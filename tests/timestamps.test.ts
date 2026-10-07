import type { MediaDataGetter } from '../activity/dataGetter.js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { updateSongTimestamps } from '../activity/utils.js'

afterEach(() => vi.useRealTimers())

describe('tiempos al cambiar de canción en una playlist', () => {
  it('recalcula la duración al pasar automáticamente a la siguiente canción', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-06T18:00:00Z'))

    const video = { currentTime: 1185, duration: 1200 }
    let textTime: [string, string] = ['19:45', '20:00']
    const getter = {
      getVideoElement: () => video,
      getCurrentAndTotalTime: () => textTime,
    } as MediaDataGetter

    const previous = updateSongTimestamps(getter)
    video.currentTime = 148
    video.duration = 196
    textTime = ['2:28', '3:16']
    vi.setSystemTime(new Date('2026-10-06T18:00:03Z'))

    const current = updateSongTimestamps(getter)
    expect(previous[1] - previous[0]).toBe(1200)
    expect(current[1] - current[0]).toBe(196)
    expect(Math.floor(Date.now() / 1000) - current[0]).toBe(148)
  })

  it('usa el tiempo visible si el video todavía conserva la duración anterior', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-06T18:00:00Z'))

    const getter = {
      getVideoElement: () => ({ currentTime: 1185, duration: 1200 }),
      getCurrentAndTotalTime: () => ['2:28', '3:16'],
    } as MediaDataGetter

    const timestamps = updateSongTimestamps(getter)
    expect(timestamps[1] - timestamps[0]).toBe(196)
    expect(Math.floor(Date.now() / 1000) - timestamps[0]).toBe(148)
  })

  it('usa el contador visible cuando el tiempo del video es incoherente', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-06T18:00:00Z'))

    const getter = {
      getVideoElement: () => ({ currentTime: 1185, duration: 196 }),
      getCurrentAndTotalTime: () => ['2:28', '3:16'],
    } as MediaDataGetter

    const timestamps = updateSongTimestamps(getter)
    expect(timestamps[1] - timestamps[0]).toBe(196)
    expect(Math.floor(Date.now() / 1000) - timestamps[0]).toBe(148)
  })
})
