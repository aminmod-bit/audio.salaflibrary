export interface Category {
  id: string
  name: string
  icon: string
  count: number
  color: string
  gradient: string
}

export interface Lecture {
  id: any
  title: string
  titleAr?: string
  lessonNumber: number
  scholarId: string
  bookId: string
  duration: any
  audioUrl: string
  coverImage: string
  description: string
  tags: string[]
  // Legacy fields for backward compatibility
  scholar?: string
  icon?: string
  categoryId?: string
  src?: string
  cover?: string
  seriesId?: string
  fileType?: string
  fileSize?: number
  transcript?: string
  notes?: string
  summary?: string
}

export interface Scholar {
  id: string
  name: string
  nameAr: string
  role: string
  description: string
  imageUrl: string
  tags: string[]
}

export interface ScholarBook {
  id: string
  scholarId: string
  title: string
  titleAr: string
  description: string
  coverImage: string
  order: number
}

export interface Series {
  id: string
  name: string
  description: string
  cover?: string
  scholarId?: string
  tags?: string[]
}

export interface Playlist {
  id: string
  name: string
  description: string
  lectures: Lecture[]
  cover?: string
}

export const categories: Category[] = [
  { id: 'lectures', name: 'Лекции', icon: '📚', count: 3, color: '#1b4332', gradient: 'linear-gradient(135deg, #1b4332, #2d6a4f)' },
  { id: 'series', name: 'Серии', icon: '📖', count: 0, color: '#3c096c', gradient: 'linear-gradient(135deg, #3c096c, #7b2cbf)' },
  { id: 'reminders', name: 'Напоминания', icon: '💡', count: 0, color: '#bc6c25', gradient: 'linear-gradient(135deg, #606c38, #bc6c25)' },
]

// Load from localStorage override or use default
function loadFromStorage<T>(key: string, defaultData: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored) as T
    }
  } catch {}
  return defaultData
}

export function getLectures(): Lecture[] {
  return loadFromStorage<Lecture[]>('salaf-admin-lectures', defaultLectures)
}

export function getScholars(): Scholar[] {
  return loadFromStorage<Scholar[]>('salaf-admin-scholars', defaultScholars)
}

export function getSeries(): Series[] {
  return loadFromStorage<Series[]>('salaf-admin-series', defaultSeries)
}

export function getScholarBooks(): ScholarBook[] {
  return loadFromStorage<ScholarBook[]>('salaf-admin-scholar-books', defaultScholarBooks)
}

export function saveLectures(lectures: Lecture[]): void {
  localStorage.setItem('salaf-admin-lectures', JSON.stringify(lectures))
  window.dispatchEvent(new Event('salaf-audio-data-updated'))
}

export function saveScholars(scholars: Scholar[]): void {
  localStorage.setItem('salaf-admin-scholars', JSON.stringify(scholars))
  window.dispatchEvent(new Event('salaf-audio-data-updated'))
}

export function saveSeries(series: Series[]): void {
  localStorage.setItem('salaf-admin-series', JSON.stringify(series))
  window.dispatchEvent(new Event('salaf-audio-data-updated'))
}

export function saveScholarBooks(books: ScholarBook[]): void {
  localStorage.setItem('salaf-admin-scholar-books', JSON.stringify(books))
  window.dispatchEvent(new Event('salaf-audio-data-updated'))
}

const defaultScholars: Scholar[] = [
  {
    id: "abu-jaafar",
    name: "Абу Джафар",
    nameAr: "أبو جعفر",
    role: "Лектор",
    description: "Лектор по исламским наукам, специалист по истории и сире.",
    imageUrl: "",
    tags: ["сира", "история", "акыда"]
  },
  {
    id: "ibn-uthaymeen",
    name: "Шейх Ибн Усеймин",
    nameAr: "ابن عثيمين",
    role: "Учёный",
    description: "Мухаммад ибн Салих аль-Усеймин — один из крупнейших исламских учёных XX века.",
    imageUrl: "",
    tags: ["фикх", "тафсир", "акыда"]
  },
  {
    id: "al-fawzan",
    name: "Шейх Салих аль-Фаузан",
    nameAr: "صالح الفوزان",
    role: "Учёный",
    description: "Салих ибн Фауз аль-Фаузан — член Постоянного комитета по исламским исследованиям.",
    imageUrl: "",
    tags: ["акыда", "фикх", "фетвы"]
  }
]

const defaultScholarBooks: ScholarBook[] = [
  {
    id: "book-palestine",
    scholarId: "abu-jaafar",
    title: "Открытие Палестины",
    titleAr: "فتح فلسطين",
    description: "Серия лекций об истории Палестины и её значении для мусульман.",
    coverImage: "",
    order: 1
  },
  {
    id: "book-aqeedah-basics",
    scholarId: "abu-jaafar",
    title: "Основы акыды",
    titleAr: "أسس العقيدة",
    description: "Введение в исламское вероучение для начинающих.",
    coverImage: "",
    order: 2
  },
  {
    id: "book-three-fundamentals",
    scholarId: "ibn-uthaymeen",
    title: "Три основы",
    titleAr: "القواعد الثلاث",
    description: "Комментарий к трактату «Три основы».",
    coverImage: "",
    order: 1
  },
  {
    id: "book-kitab-tawheed",
    scholarId: "ibn-uthaymeen",
    title: "Китаб ат-Таухид",
    titleAr: "كتاب التوحيد",
    description: "Комментарий к «Книге единобожия».",
    coverImage: "",
    order: 2
  },
  {
    id: "book-aqeedah",
    scholarId: "al-fawzan",
    title: "Акыда",
    titleAr: "العقيدة",
    description: "Курс по исламскому вероучению.",
    coverImage: "",
    order: 1
  },
  {
    id: "book-fiqh",
    scholarId: "al-fawzan",
    title: "Фикх",
    titleAr: "الفقه",
    description: "Основы исламского права для начинающих.",
    coverImage: "",
    order: 2
  }
]

const defaultSeries: Series[] = []

const defaultLectures: Lecture[] = [
  {
    id: "lec-1",
    title: "Открытие Палестины — Часть 1",
    lessonNumber: 1,
    scholarId: "abu-jaafar",
    bookId: "book-palestine",
    duration: 3540,
    audioUrl: "/audio/01 Открытие Палестины.mp3",
    coverImage: "",
    description: "Первая часть серии лекций об истории Палестины.",
    tags: ["сира", "история"]
  },
  {
    id: "lec-2",
    title: "Открытие Палестины — Часть 2",
    lessonNumber: 2,
    scholarId: "abu-jaafar",
    bookId: "book-palestine",
    duration: 3561,
    audioUrl: "/audio/02 Открытие Палестины.mp3",
    coverImage: "",
    description: "Вторая часть серии лекций об истории Палестины.",
    tags: ["сира", "история"]
  },
  {
    id: "lec-3",
    title: "Открытие Палестины — Часть 3",
    lessonNumber: 3,
    scholarId: "abu-jaafar",
    bookId: "book-palestine",
    duration: 3561,
    audioUrl: "/audio/03 Открытие Палестины.mp3",
    coverImage: "",
    description: "Третья часть серии лекций об истории Палестины.",
    tags: ["сира", "история"]
  },
  {
    id: "lec-4",
    title: "Что такое акыда",
    lessonNumber: 1,
    scholarId: "abu-jaafar",
    bookId: "book-aqeedah-basics",
    duration: 1800,
    audioUrl: "",
    coverImage: "",
    description: "Введение в понятие акыда в исламе.",
    tags: ["акыда"]
  },
  {
    id: "lec-5",
    title: "Таухид — единобожие",
    lessonNumber: 2,
    scholarId: "abu-jaafar",
    bookId: "book-aqeedah-basics",
    duration: 2100,
    audioUrl: "",
    coverImage: "",
    description: "Обзор основ единобожия.",
    tags: ["акыда", "таухид"]
  },
  {
    id: "lec-6",
    title: "Три основы — введение",
    lessonNumber: 1,
    scholarId: "ibn-uthaymeen",
    bookId: "book-three-fundamentals",
    duration: 2400,
    audioUrl: "",
    coverImage: "",
    description: "Введение к трактату «Три основы».",
    tags: ["акыда", "таухид"]
  },
  {
    id: "lec-7",
    title: "Знание Аллаха",
    lessonNumber: 2,
    scholarId: "ibn-uthaymeen",
    bookId: "book-three-fundamentals",
    duration: 2700,
    audioUrl: "",
    coverImage: "",
    description: "Первая основа — знание Аллаха.",
    tags: ["акыда", "таухид"]
  },
  {
    id: "lec-8",
    title: "Таухид — урок 1",
    lessonNumber: 1,
    scholarId: "ibn-uthaymeen",
    bookId: "book-kitab-tawheed",
    duration: 3000,
    audioUrl: "",
    coverImage: "",
    description: "Введение в «Книгу единобожия».",
    tags: ["таухид"]
  },
  {
    id: "lec-9",
    title: "Таухид — урок 2",
    lessonNumber: 2,
    scholarId: "ibn-uthaymeen",
    bookId: "book-kitab-tawheed",
    duration: 3200,
    audioUrl: "",
    coverImage: "",
    description: "Продолжение изучения единобожия.",
    tags: ["таухид"]
  },
  {
    id: "lec-10",
    title: "Основы акыды — урок 1",
    lessonNumber: 1,
    scholarId: "al-fawzan",
    bookId: "book-aqeedah",
    duration: 2500,
    audioUrl: "",
    coverImage: "",
    description: "Введение в акыду.",
    tags: ["акыда"]
  },
  {
    id: "lec-11",
    title: "Основы акыды — урок 2",
    lessonNumber: 2,
    scholarId: "al-fawzan",
    bookId: "book-aqeedah",
    duration: 2800,
    audioUrl: "",
    coverImage: "",
    description: "Продолжение курса по акыде.",
    tags: ["акыда"]
  },
  {
    id: "lec-12",
    title: "Введение в фикх",
    lessonNumber: 1,
    scholarId: "al-fawzan",
    bookId: "book-fiqh",
    duration: 2200,
    audioUrl: "",
    coverImage: "",
    description: "Основы исламского права.",
    tags: ["фикх"]
  },
  {
    id: "lec-13",
    title: "Чистота в исламе",
    lessonNumber: 2,
    scholarId: "al-fawzan",
    bookId: "book-fiqh",
    duration: 1900,
    audioUrl: "",
    coverImage: "",
    description: "Правила чистоты (тахара) в исламе.",
    tags: ["фикх", "тахара"]
  }
]

export const lectures = getLectures()
export const scholars = getScholars()
export const series = getSeries()
export const scholarBooks = getScholarBooks()

// Legacy alias
export const audioData = lectures
