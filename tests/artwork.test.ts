import { afterEach, describe, expect, it, vi } from 'vitest'
import { YouTubeMusicDataGetter } from '../activity/dataGetter.js'

afterEach(() => vi.unstubAllGlobals())

describe('miniatura del video', () => {
  it('elige la miniatura real aunque el reproductor tenga una imagen transparente', () => {
    vi.stubGlobal('navigator', { mediaSession: undefined })
    vi.stubGlobal('document', {
      querySelector: (selector: string) => {
        if (selector === '.video-stream')
          return { duration: 709, paused: false }
        if (selector.includes('.ytmusicTrackInfoTitle'))
          return { textContent: 'Accretionist - Infinite Horizons' }
        if (selector === '.ytmusicTrackInfoThumbnail')
          return { src: 'https://i.ytimg.com/vi/PkH7KVqcP8g/hqdefault.jpg' }
        if (selector === '#song-image img')
          return { src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAA' }
        return null
      },
    })

    const data = new YouTubeMusicDataGetter().getMediaData()
    expect(data.artwork).toBe('https://i.ytimg.com/vi/PkH7KVqcP8g/hqdefault.jpg')
  })

  it('ignora imágenes transparentes y usa la carátula de la sesión si existe', () => {
    const artwork = 'https://i.ytimg.com/vi/PkH7KVqcP8g/mqdefault.jpg'
    vi.stubGlobal('navigator', { mediaSession: { metadata: { artwork: [{ src: artwork }] } } })
    vi.stubGlobal('document', {
      querySelector: (selector: string) => {
        if (selector === '.video-stream')
          return { duration: 709, paused: false }
        if (selector.includes('.ytmusicTrackInfoTitle'))
          return { textContent: 'Accretionist - Infinite Horizons' }
        if (selector === '#song-image img')
          return { src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAA' }
        return null
      },
    })

    const data = new YouTubeMusicDataGetter().getMediaData()
    expect(data.artwork).toBe(artwork)
  })
})
