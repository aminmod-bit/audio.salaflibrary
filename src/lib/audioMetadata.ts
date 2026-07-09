export interface AudioMetadata {
  title: string
  lessonNumber: number
  duration: string
  fileType: string
  size: number
  coverImage: string
}

export async function readAudioMetadata(file: File): Promise<AudioMetadata> {
  const fileName = file.name.replace(/\.[^/.]+$/, '')
  const fileExt = file.name.split('.').pop()?.toLowerCase() || ''

  const cleanTitle = cleanFileName(fileName)
  const lessonNumber = extractLessonNumber(fileName)

  // Get duration from audio element
  const duration = await getDuration(file)

  return {
    title: cleanTitle,
    duration,
    lessonNumber,
    fileType: fileExt,
    size: file.size,
    coverImage: '',
  }
}

function getDuration(file: File): Promise<string> {
  return new Promise((resolve) => {
    const audio = new Audio()
    audio.src = URL.createObjectURL(file)
    audio.addEventListener('loadedmetadata', () => {
      const duration = formatDuration(audio.duration)
      URL.revokeObjectURL(audio.src)
      resolve(duration)
    })
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(audio.src)
      resolve('0:00')
    })
  })
}

function cleanFileName(name: string): string {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function extractLessonNumber(name: string): number {
  const patterns = [
    /^(\d+)/,
    /lesson[-_]?(\d+)/i,
    /uroki[-_]?(\d+)/i,
    /part[-_]?(\d+)/i,
  ]

  for (const pattern of patterns) {
    const match = name.match(pattern)
    if (match) {
      return parseInt(match[1], 10)
    }
  }

  return 0
}

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

export function getNextLessonNumber(lectures: any[], seriesId?: string): number {
  if (!seriesId) return lectures.length + 1
  const seriesLectures = lectures.filter(l => l.seriesId === seriesId)
  if (seriesLectures.length === 0) return 1
  const maxNumber = Math.max(...seriesLectures.map(l => l.lessonNumber || 0))
  return maxNumber + 1
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
