import { afterEach, describe, expect, it, vi } from 'vitest'
import { YouTubeMusicDataGetter } from '../activity/dataGetter.js'

afterEach(() => vi.unstubAllGlobals())

describe('miniatura del video', () => {
  it('prefiere la portada grande de la canción y amplía las variantes pequeñas', () => {
    const base = 'https://yt3.googleusercontent.com/portada'
    vi.stubGlobal('navigator', { mediaSession: undefined })
    vi.stubGlobal('document', {
      querySelector: (selector: string) => {
        if (selector === '.video-stream')
          return { duration: 197, paused: false }
        if (selector.includes('.ytmusicTrackInfoTitle'))
          return { textContent: 'Azúcar, Pimienta y Sal' }
        if (selector === '.ytmusicTrackInfoThumbnail')
          return { src: `${base}=w60-h60-l90-rj` }
        if (selector === '#song-image img')
          return { src: `${base}=w120-h120-l90-rj` }
        return null
      },
    })

    expect(new YouTubeMusicDataGetter().getMediaData().artwork)
      .toBe(`${base}=w544-h544-l90-rj`)
  })

  it('amplía la portada de Media Session cuando la interfaz no tiene una válida', () => {
    const src = 'https://yt3.googleusercontent.com/portada=w60-h60-l90-rj'
    vi.stubGlobal('navigator', { mediaSession: { metadata: { artwork: [{ src }] } } })
    vi.stubGlobal('document', {
      querySelector: (selector: string) => {
        if (selector === '.video-stream')
          return { duration: 197, paused: false }
        if (selector.includes('.ytmusicTrackInfoTitle'))
          return { textContent: 'Azúcar, Pimienta y Sal' }
        return null
      },
    })

    expect(new YouTubeMusicDataGetter().getMediaData().artwork)
      .toBe('https://yt3.googleusercontent.com/portada=w544-h544-l90-rj')
  })

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
