export interface MediaData {
  playbackState: 'playing' | 'paused' | 'none'
  title?: string
  artist?: string
  album?: string
  artwork?: string
  duration?: number
}

export interface MediaDataGetter {
  getMediaData: () => MediaData
  getWatchId: () => string | undefined
  getRepeatMode: () => string | null
  getVideoElement: () => HTMLMediaElement | null
  getAlbumArtistLink: () => string | undefined
  getArtistLink: () => string | undefined
  getCurrentAndTotalTime: () => [string, string] | null
  hasValidPlaybackState: () => boolean
  isPlaying: () => boolean
}

export class YouTubeMusicDataGetter implements MediaDataGetter {
  private mediaSession: MediaSession | undefined

  constructor() {
    this.mediaSession = navigator.mediaSession
  }

  getMediaData(): MediaData {
    const videoElement = this.getVideoElement()
    const playbackState = videoElement && Number.isFinite(videoElement.duration)
      ? videoElement.paused ? 'paused' : 'playing'
      : this.mediaSession?.playbackState

    const titleElement = document.querySelector('.ytmusicTrackInfoTitle, .title.ytmusic-player-bar')
    const artistElement = document.querySelector('.ytmusicTrackInfoByline a, .byline.ytmusic-player-bar a')
    const artwork = this.getArtwork()

    if (videoElement && Number.isFinite(videoElement.duration) && titleElement?.textContent?.trim()) {
      return {
        playbackState: videoElement.paused ? 'paused' : 'playing',
        title: titleElement.textContent.trim(),
        artist: artistElement?.textContent?.trim() || this.mediaSession?.metadata?.artist,
        album: this.mediaSession?.metadata?.album,
        artwork: artwork || this.mediaSession?.metadata?.artwork?.at(-1)?.src,
        duration: videoElement.duration,
      }
    }

    if (this.mediaSession?.metadata && ['playing', 'paused'].includes(playbackState ?? '')) {
      return {
        playbackState: playbackState as 'playing' | 'paused',
        title: this.mediaSession.metadata.title,
        artist: this.mediaSession.metadata.artist,
        album: this.mediaSession.metadata.album,
        artwork: this.mediaSession.metadata.artwork?.at(-1)?.src,
      }
    }

    if (!videoElement || !Number.isFinite(videoElement.duration)) {
      return { playbackState: 'none' }
    }

    const artistElements = document.querySelectorAll('.byline.ytmusic-player-bar a')
    const albumElement = artistElements.length > 1 ? artistElements[1] : null

    const complexInfo = document.querySelector('.complex-string.ytmusic-player-bar')
    const albumFromElement = albumElement?.textContent?.trim()
    const albumFromComplex = complexInfo?.querySelector('a:last-child')?.textContent?.trim()
    const album = (albumFromElement && albumFromElement.length > 0)
      ? albumFromElement
      : (albumFromComplex && albumFromComplex.length > 0)
          ? albumFromComplex
          : undefined

    return {
      playbackState: videoElement.paused ? 'paused' : 'playing',
      title: titleElement?.textContent?.trim() || undefined,
      artist: artistElement?.textContent?.trim() || undefined,
      album,
      artwork,
      duration: videoElement?.duration,
    }
  }

  private getArtwork(): string | undefined {
    for (const selector of ['.ytmusicTrackInfoThumbnail', '#song-image img', 'ytmusic-player-bar img#img']) {
      const src = document.querySelector<HTMLImageElement>(selector)?.src
      if (src?.startsWith('https://') || src?.startsWith('http://'))
        return src
    }
  }

  getWatchId(): string | undefined {
    const { href } = document.location
    const urlMatch = href.match(/v=([^&#]{5,})/)?.[1]
    if (urlMatch)
      return urlMatch

    return document
      .querySelector<HTMLAnchorElement>('a.ytp-title-link.yt-uix-sessionlink')
      ?.href
      .match(/v=([^&#]{5,})/)?.[1]
  }

  getRepeatMode(): string | null {
    return document
      .querySelector('ytmusic-player-bar[slot="player-bar"]')
      ?.getAttribute('repeat-mode') ?? null
  }

  getVideoElement(): HTMLMediaElement | null {
    return document.querySelector<HTMLMediaElement>('.video-stream')
  }

  getAlbumArtistLink(): string | undefined {
    const mediaData = this.getMediaData()
    const links = [...document.querySelectorAll<HTMLAnchorElement>('.ytmusicTrackInfoByline a[href], .byline a[href]')]

    if (mediaData.album && links.length > 0) {
      return links.at(-1)?.href
    }

    return links[0]?.href
  }

  getArtistLink(): string | undefined {
    return document.querySelector<HTMLAnchorElement>('.ytmusicTrackInfoByline a[href], .byline a[href]')?.href
  }

  getCurrentAndTotalTime(): [string, string] | null {
    const timeText = document
      .querySelector<HTMLSpanElement>('#left-controls > span')
      ?.textContent
      ?.trim()

    if (!timeText)
      return this.getMiniPlayerTime()

    const times = timeText.split(' / ')
    if (times.length === 2 && times[0] && times[1]) {
      return [times[0].trim(), times[1].trim()]
    }

    const progressBar = document.querySelector('.time-info')
    if (progressBar) {
      const currentTime = progressBar.querySelector('.time-info-current')?.textContent?.trim()
      const totalTime = progressBar.querySelector('.time-info-total')?.textContent?.trim()
      if (currentTime && totalTime) {
        return [currentTime, totalTime]
      }
    }

    return null
  }

  private getMiniPlayerTime(): [string, string] | null {
    const times = document.querySelector('.ytMusicMiniPlayerTimeInfo')?.textContent?.trim().split(' / ')
    return times?.length === 2 && times[0] && times[1] ? [times[0], times[1]] : null
  }

  hasValidPlaybackState(): boolean {
    if (this.mediaSession) {
      return ['playing', 'paused'].includes(this.mediaSession.playbackState)
    }

    const videoElement = this.getVideoElement()
    return videoElement !== null && !Number.isNaN(videoElement.duration)
  }

  isPlaying(): boolean {
    if (this.mediaSession) {
      return this.mediaSession.playbackState === 'playing'
    }

    const videoElement = this.getVideoElement()
    return videoElement !== null && !videoElement.paused && videoElement.currentTime > 0
  }
}
