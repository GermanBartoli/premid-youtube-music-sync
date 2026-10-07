import type { MediaDataGetter } from './dataGetter.js'
import { getTimestamps, timestampFromFormat } from 'premid'

export interface Settings {
  showButtons: boolean
  showTimestamps: boolean
  showCover: boolean
  hidePaused: boolean
  showBrowsing: boolean
  privacyMode: boolean
  displayType: number
  links: boolean
}

export function updateSongTimestamps(
  dataGetter: MediaDataGetter,
): [number, number] {
  const video = dataGetter.getVideoElement()
  const times = dataGetter.getCurrentAndTotalTime()
  const current = times ? timestampFromFormat(times[0]) : Number.NaN
  const duration = times ? timestampFromFormat(times[1]) : Number.NaN
  const validTextTime = Number.isFinite(current) && Number.isFinite(duration)
    && duration > 0 && current >= 0 && current <= duration + 1

  if (video && Number.isFinite(video.currentTime) && Number.isFinite(video.duration) && video.duration > 0) {
    if (video.currentTime < 0 || video.currentTime > video.duration + 1)
      return validTextTime ? getTimestamps(current, duration) : [0, 0]

    if (validTextTime && Math.abs(video.duration - duration) > 2)
      return getTimestamps(current, duration)

    return getTimestamps(video.currentTime, video.duration)
  }

  if (validTextTime)
    return getTimestamps(current, duration)

  return [0, 0]
}

export async function getSettings(presence: Presence): Promise<Settings> {
  const [
    showButtons,
    showTimestamps,
    showCover,
    hidePaused,
    showBrowsing,
    privacyMode,
    displayType,
    links,
  ] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('hidePaused'),
    presence.getSetting<boolean>('browsing'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<number>('displayType'),
    presence.getSetting<boolean>('links'),
  ])

  return {
    showButtons,
    showTimestamps,
    showCover,
    hidePaused,
    showBrowsing,
    privacyMode,
    displayType,
    links,
  }
}
