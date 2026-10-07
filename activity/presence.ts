import { ActivityType } from 'premid'
import { createBrowsingPresence } from './browsingPresence.js'
import { ActivityAssets } from './constants.js'
import { YouTubeMusicDataGetter } from './dataGetter.js'
import { stringMap } from './i18n.js'
import { createListeningPresence } from './listeningPresence.js'
import { getSettings, updateSongTimestamps } from './utils.js'

const presence = new Presence({
  clientId: '463151177836658699',
})

class PresenceState {
  oldPath = ''
  startTimestamp = 0
  videoElement: HTMLMediaElement | null = null
  trackInfoElement: Element | null = null
  trackInfoObserver = new MutationObserver(scheduleTrackUpdate)
  updateTimer: ReturnType<typeof setTimeout> | undefined
  settleTimer: ReturnType<typeof setTimeout> | undefined
  publishTimer: ReturnType<typeof setTimeout> | undefined
  pendingActivity: PresenceData | undefined
  lastActivity: PresenceData | undefined
  lastPublishedAt = 0
  updateId = 0
  dataGetter = new YouTubeMusicDataGetter()
}

const state = new PresenceState()

function sameActivity(first: PresenceData, second: PresenceData): boolean {
  const { startTimestamp: firstStart, endTimestamp: firstEnd, ...firstDetails } = first
  const { startTimestamp: secondStart, endTimestamp: secondEnd, ...secondDetails } = second

  return JSON.stringify(firstDetails) === JSON.stringify(secondDetails)
    && Math.abs(Number(firstStart ?? 0) - Number(secondStart ?? 0)) < 3
    && Math.abs(Number(firstEnd ?? 0) - Number(secondEnd ?? 0)) < 3
}

function publishActivity(activity: PresenceData) {
  if (state.lastActivity && sameActivity(state.lastActivity, activity)) {
    state.pendingActivity = undefined
    clearTimeout(state.publishTimer)
    return
  }

  state.pendingActivity = activity
  clearTimeout(state.publishTimer)

  const delay = Math.max(0, 4100 - (Date.now() - state.lastPublishedAt))
  state.publishTimer = setTimeout(() => {
    const latest = state.pendingActivity
    state.pendingActivity = undefined
    if (!latest)
      return

    state.lastActivity = latest
    state.lastPublishedAt = Date.now()
    presence.setActivity(latest)
  }, delay)
}

function clearActivity() {
  clearTimeout(state.publishTimer)
  state.pendingActivity = undefined
  state.lastActivity = undefined
  return presence.clearActivity()
}

function scheduleUpdate() {
  clearTimeout(state.updateTimer)
  state.updateTimer = setTimeout(updateActivity, 150)
}

function scheduleTrackUpdate() {
  scheduleUpdate()
  clearTimeout(state.settleTimer)
  state.settleTimer = setTimeout(updateActivity, 1200)
}

async function updateActivity() {
  const updateId = ++state.updateId
  const { pathname, search, href } = document.location
  const trackInfoElement = document.querySelector('ytmusic-track-info')?.parentElement
    ?? document.querySelector('.title.ytmusic-player-bar')?.parentElement
    ?? null

  if (state.trackInfoElement !== trackInfoElement) {
    state.trackInfoObserver.disconnect()
    if (trackInfoElement) {
      state.trackInfoObserver.observe(trackInfoElement, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['src', 'title'],
      })
    }
    state.trackInfoElement = trackInfoElement
  }

  const settings = await getSettings(presence)
  const strings = await presence.getStrings(stringMap)
  if (updateId !== state.updateId)
    return

  const videoElement = state.dataGetter.getVideoElement()
  if (state.videoElement !== videoElement) {
    for (const event of ['loadedmetadata', 'playing', 'pause', 'seeked']) {
      state.videoElement?.removeEventListener(event, scheduleUpdate)
      videoElement?.addEventListener(event, scheduleUpdate)
    }
    state.videoElement = videoElement
  }

  const mediaData = state.dataGetter.getMediaData()
  const watchID = state.dataGetter.getWatchId()
  const repeatMode = state.dataGetter.getRepeatMode()

  if (settings.hidePaused && mediaData.playbackState !== 'playing') {
    return clearActivity()
  }

  let presenceData: PresenceData = {}

  if (['playing', 'paused'].includes(mediaData.playbackState)) {
    if (settings.privacyMode) {
      return publishActivity({
        type: ActivityType.Listening,
        largeImageKey: ActivityAssets.Logo,
        details: strings.listeningToSong,
      })
    }

    if (!mediaData.title)
      return clearActivity()

    presenceData = createListeningPresence(
      mediaData,
      state.dataGetter,
      settings,
      watchID,
      repeatMode,
      updateSongTimestamps(state.dataGetter),
      strings,
    )
  }
  else if (settings.showBrowsing) {
    if (state.oldPath !== pathname) {
      state.oldPath = pathname
      state.startTimestamp = Math.floor(Date.now() / 1000)
    }

    presenceData = createBrowsingPresence(pathname, search, href, state.startTimestamp, strings, settings.privacyMode)
  }
  else {
    return clearActivity()
  }

  publishActivity(presenceData)
}

presence.on('UpdateData', updateActivity)
