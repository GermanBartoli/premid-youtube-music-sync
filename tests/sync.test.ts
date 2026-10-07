import { afterEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  title: 'Tema anterior',
  video: null as any,
  update: undefined as undefined | (() => Promise<void>),
  observerCallback: undefined as undefined | (() => void),
  setActivity: vi.fn(),
}))

vi.mock('../activity/dataGetter.js', () => ({
  YouTubeMusicDataGetter: class {
    getVideoElement() { return state.video }
    getMediaData() { return { playbackState: 'playing', title: state.title } }
    getWatchId() { return undefined }
    getRepeatMode() { return null }
  },
}))
vi.mock('../activity/utils.js', () => ({
  getSettings: async () => ({ hidePaused: false, privacyMode: false, showBrowsing: false }),
  updateSongTimestamps: () => [100, 200],
}))
vi.mock('../activity/listeningPresence.js', () => ({
  createListeningPresence: (media: { title: string }) => ({ details: media.title }),
}))
vi.mock('../activity/browsingPresence.js', () => ({ createBrowsingPresence: () => ({}) }))
vi.mock('../activity/i18n.js', () => ({ stringMap: {} }))

function createVideo() {
  const listeners = new Map<string, () => void>()
  return {
    listeners,
    addEventListener: (event: string, callback: () => void) => listeners.set(event, callback),
    removeEventListener: (event: string) => listeners.delete(event),
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.resetModules()
  state.setActivity.mockClear()
})

describe('sincronización al cambiar de pista', () => {
  it('actualiza Discord cuando cambia el título sin eventos del video', async () => {
    vi.useFakeTimers()
    state.title = 'Tema anterior'
    state.video = createVideo()
    const trackInfoParent = {}
    vi.stubGlobal('document', {
      location: { pathname: '/', search: '', href: 'https://music.youtube.com/' },
      querySelector: (selector: string) => selector === 'ytmusic-track-info' ? { parentElement: trackInfoParent } : null,
    })
    vi.stubGlobal('MutationObserver', class {
      constructor(callback: () => void) { state.observerCallback = callback }
      observe() {}
      disconnect() {}
    })
    vi.stubGlobal('Presence', class {
      on(_event: string, callback: () => Promise<void>) { state.update = callback }
      getStrings = async () => ({})
      setActivity = state.setActivity
      clearActivity() {}
    })

    await import('../activity/presence.js')
    await state.update?.()
    await vi.advanceTimersByTimeAsync(0)
    expect(state.setActivity).toHaveBeenLastCalledWith({ details: 'Tema anterior' })

    state.title = 'Tema siguiente'
    state.observerCallback?.()
    await vi.advanceTimersByTimeAsync(150)
    expect(state.setActivity).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(3950)
    expect(state.setActivity).toHaveBeenLastCalledWith({ details: 'Tema siguiente' })
  })

  it('vuelve a escuchar el video reemplazado al elegir Play en la playlist', async () => {
    vi.useFakeTimers()
    state.title = 'Tema anterior'
    const previousVideo = createVideo()
    state.video = previousVideo
    const trackInfoParent = {}
    vi.stubGlobal('document', {
      location: { pathname: '/', search: '', href: 'https://music.youtube.com/' },
      querySelector: (selector: string) => selector === 'ytmusic-track-info' ? { parentElement: trackInfoParent } : null,
    })
    vi.stubGlobal('MutationObserver', class {
      constructor(callback: () => void) { state.observerCallback = callback }
      observe() {}
      disconnect() {}
    })
    vi.stubGlobal('Presence', class {
      on(_event: string, callback: () => Promise<void>) { state.update = callback }
      getStrings = async () => ({})
      setActivity = state.setActivity
      clearActivity() {}
    })

    await import('../activity/presence.js')
    await state.update?.()

    state.title = 'Tema elegido'
    state.observerCallback?.()
    await vi.advanceTimersByTimeAsync(150)

    const nextVideo = createVideo()
    state.video = nextVideo
    await vi.advanceTimersByTimeAsync(3950)

    expect(previousVideo.listeners.has('playing')).toBe(false)
    expect(nextVideo.listeners.has('playing')).toBe(true)
    expect(state.setActivity).toHaveBeenLastCalledWith({ details: 'Tema elegido' })
  })

  it('publica la cuarta pista sin saturar Discord con cambios rápidos', async () => {
    vi.useFakeTimers()
    state.title = 'Pista 1'
    state.video = createVideo()
    vi.stubGlobal('document', {
      location: { pathname: '/', search: '', href: 'https://music.youtube.com/' },
      querySelector: (selector: string) => selector === 'ytmusic-track-info' ? { parentElement: {} } : null,
    })
    vi.stubGlobal('MutationObserver', class {
      constructor(callback: () => void) { state.observerCallback = callback }
      observe() {}
      disconnect() {}
    })
    vi.stubGlobal('Presence', class {
      on(_event: string, callback: () => Promise<void>) { state.update = callback }
      getStrings = async () => ({})
      setActivity = state.setActivity
      clearActivity() {}
    })

    await import('../activity/presence.js')
    await state.update?.()
    await vi.advanceTimersByTimeAsync(0)

    for (let track = 2; track <= 4; track++) {
      state.title = `Pista ${track}`
      state.observerCallback?.()
      await vi.advanceTimersByTimeAsync(200)
    }

    expect(state.setActivity).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(3500)
    expect(state.setActivity).toHaveBeenCalledTimes(2)
    expect(state.setActivity).toHaveBeenLastCalledWith({ details: 'Pista 4' })
  })
})
