// Audio progress tracking
export interface AudioProgress {
  lectureId: number
  currentTime: number
  duration: number
  updatedAt: number
}

export function saveProgress(lectureId: number, currentTime: number, duration: number): void {
  const progress = getProgressList()
  const existing = progress.findIndex(p => p.lectureId === lectureId)
  const item: AudioProgress = {
    lectureId,
    currentTime,
    duration,
    updatedAt: Date.now(),
  }
  if (existing >= 0) {
    progress[existing] = item
  } else {
    progress.push(item)
  }
  localStorage.setItem('salaf-audio-progress', JSON.stringify(progress))
}

export function getProgress(lectureId: number): AudioProgress | null {
  const progress = getProgressList()
  return progress.find(p => p.lectureId === lectureId) || null
}

export function getProgressList(): AudioProgress[] {
  try {
    return JSON.parse(localStorage.getItem('salaf-audio-progress') || '[]')
  } catch {
    return []
  }
}

export function getRecentProgress(limit = 5): AudioProgress[] {
  return getProgressList()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit)
}

export function clearProgress(lectureId: number): void {
  const progress = getProgressList().filter(p => p.lectureId !== lectureId)
  localStorage.setItem('salaf-audio-progress', JSON.stringify(progress))
}

// Audio speed
export function getAudioSpeed(): number {
  return parseFloat(localStorage.getItem('salaf-audio-speed') || '1')
}

export function setAudioSpeed(speed: number): void {
  localStorage.setItem('salaf-audio-speed', String(speed))
}

// Sleep timer
export interface SleepTimer {
  active: boolean
  minutes: number
  startTime: number
  endTime: number
}

let sleepTimerInterval: ReturnType<typeof setInterval> | null = null

export function startSleepTimer(minutes: number, onEnd: () => void): void {
  clearSleepTimer()
  const now = Date.now()
  const endTime = now + minutes * 60 * 1000
  const timer: SleepTimer = {
    active: true,
    minutes,
    startTime: now,
    endTime,
  }
  localStorage.setItem('salaf-audio-sleep-timer', JSON.stringify(timer))

  sleepTimerInterval = setInterval(() => {
    if (Date.now() >= endTime) {
      clearSleepTimer()
      onEnd()
    }
  }, 1000)
}

export function clearSleepTimer(): void {
  if (sleepTimerInterval) {
    clearInterval(sleepTimerInterval)
    sleepTimerInterval = null
  }
  localStorage.removeItem('salaf-audio-sleep-timer')
}

export function getSleepTimer(): SleepTimer | null {
  try {
    const timer = JSON.parse(localStorage.getItem('salaf-audio-sleep-timer') || 'null')
    if (timer && timer.active && Date.now() < timer.endTime) {
      return timer
    }
    return null
  } catch {
    return null
  }
}

export function getSleepTimerRemaining(): number {
  const timer = getSleepTimer()
  if (!timer) return 0
  return Math.max(0, timer.endTime - Date.now())
}

// Offline storage
export interface OfflineLecture {
  lectureId: number
  title: string
  src: string
  savedAt: number
}

export async function saveOffline(lecture: { id: number; title: string; src: string }): Promise<boolean> {
  try {
    if (!('caches' in window)) return false

    const cache = await caches.open('salaf-audio-offline')
    const response = await fetch(lecture.src)
    if (!response.ok) return false

    await cache.put(lecture.src, response)

    const offlineList = getOfflineList()
    if (!offlineList.find(o => o.lectureId === lecture.id)) {
      offlineList.push({
        lectureId: lecture.id,
        title: lecture.title,
        src: lecture.src,
        savedAt: Date.now(),
      })
      localStorage.setItem('salaf-audio-offline', JSON.stringify(offlineList))
    }

    return true
  } catch {
    return false
  }
}

export async function removeOffline(lectureId: number): Promise<void> {
  const offlineList = getOfflineList()
  const item = offlineList.find(o => o.lectureId === lectureId)
  if (item && 'caches' in window) {
    const cache = await caches.open('salaf-audio-offline')
    await cache.delete(item.src)
  }
  localStorage.setItem('salaf-audio-offline', JSON.stringify(offlineList.filter(o => o.lectureId !== lectureId)))
}

export function getOfflineList(): OfflineLecture[] {
  try {
    return JSON.parse(localStorage.getItem('salaf-audio-offline') || '[]')
  } catch {
    return []
  }
}

export async function clearOfflineCache(): Promise<void> {
  if ('caches' in window) {
    await caches.delete('salaf-audio-offline')
  }
  localStorage.removeItem('salaf-audio-offline')
}

export function isOfflineAvailable(lectureId: number): boolean {
  return getOfflineList().some(o => o.lectureId === lectureId)
}
