import './Mission.css'
import { useEffect, useMemo, useRef, useState, type UIEvent } from 'react'
import { useNavigate } from 'react-router'
import PageHeader from '../components/PageHeader'
import ChevronIcon from '../components/ChevronIcon'
import FloatingWriteButton from '../components/FloatingWriteButton'
import HeaderIcon from '../components/HeaderIcon'
import BackButton from '../components/html/BackButton'
import DatePicker from '../components/html/DatePicker'
import Button from '../components/html/Button'
import AddSheet from '../components/AddSheet'
import MissionRecordSheet from '../components/MissionRecordSheet'
import {
  PET_PROFILES_CHANGE_EVENT,
  readPetProfiles,
  readSelectedPetProfileId,
  readSelectedPetProfileName,
  writeSelectedPetProfileId,
  type PetProfileSummary,
} from '../utils/petProfiles'
import {
  MISSION_ACTIVITY_RECORDS_CHANGE_EVENT,
  readMissionActivityRecords,
} from '../utils/missionActivityRecords'
import {
  markWalkRecorded,
  markMealRecorded,
  getCurrentChallengeDay,
  checkChallengeDayDone,
  isChallengeDayClaimed,
  claimChallengeDay,
} from '../utils/challengeStatus'
import {
  MISSION_HISTORY_RECORDS_CHANGE_EVENT,
  readMissionHistoryRecordsWithDefaults,
  toMissionHistoryRecord,
  writeStoredMissionHistoryRecords,
  type MissionHistoryRecord,
} from '../utils/missionHistoryRecords'
import { showStateBarMessage } from '../utils/stateBarMessage'
import { addUserNotification } from '../utils/userNotifications'

const weekLabels = ['일', '월', '화', '수', '목', '금', '토']
const today = new Date()
const CALENDAR_YEAR = today.getFullYear()
const CALENDAR_MONTH = today.getMonth() + 1
const CALENDAR_DAY = today.getDate()
const DEFAULT_FEED_AMOUNT_STORAGE_KEY = 'missionDefaultFeedAmount'

type CalendarDay = {
  id: string
  label: string
  month: number
  year: number
  muted?: boolean
}

type PeriodDateTime = {
  year: number
  month: number
  day: number
  period: 'AM' | 'PM'
  hour: number
  minute: number
}

type PeriodField = 'start' | 'end'

const periodWeekLabels = ['일', '월', '화', '수', '목', '금', '토']
const periodOptions: Array<{ value: PeriodDateTime['period']; label: string }> = [
  { value: 'AM', label: '오전' },
  { value: 'PM', label: '오후' },
]
const periodHourOptions = Array.from({ length: 12 }, (_, index) => index + 1)
const periodMinuteOptions = Array.from({ length: 60 }, (_, index) => index)
const periodWheelLoops = [0, 1, 2]
const periodWheelItemHeight = 44
const PERIOD_DATE_RANGE_DAYS = 366

function createCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDayIndex = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate()
  const calendar: CalendarDay[] = []

  for (let index = firstDayIndex - 1; index >= 0; index -= 1) {
    const date = daysInPrevMonth - index
    calendar.push({
      id: `p-${date}`,
      label: String(date),
      month: month === 1 ? 12 : month - 1,
      year: month === 1 ? year - 1 : year,
      muted: true,
    })
  }

  for (let date = 1; date <= daysInMonth; date += 1) {
    calendar.push({
      id: `c-${date}`,
      label: String(date),
      month,
      year,
    })
  }

  let nextDate = 1
  while (calendar.length < 42) {
    calendar.push({
      id: `n-${nextDate}`,
      label: String(nextDate),
      month: month === 12 ? 1 : month + 1,
      year: month === 12 ? year + 1 : year,
      muted: true,
    })
    nextDate += 1
  }

  return calendar
}

function getDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function createRepeatDateKeys(
  repeatId: string,
  date: { year: number; month: number; day: number },
  endDateValue?: { year: number; month: number; day: number },
) {
  const startDate = new Date(date.year, date.month - 1, date.day)
  const selectedEndDate = endDateValue
    ? new Date(endDateValue.year, endDateValue.month - 1, endDateValue.day)
    : new Date(date.year, date.month, 0)
  const endDate = selectedEndDate < startDate ? startDate : selectedEndDate
  const dateKeys: string[] = []

  for (
    const currentDate = new Date(startDate);
    currentDate <= endDate;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    const dayOfWeek = currentDate.getDay()
    const hasDateRangeOnly =
      repeatId === 'none' && endDate.getTime() > startDate.getTime()
    const shouldInclude =
      hasDateRangeOnly ||
      repeatId === 'daily' ||
      (repeatId === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) ||
      (repeatId === 'weekly' && dayOfWeek === startDate.getDay()) ||
      (repeatId === 'none' && currentDate.getTime() === startDate.getTime())

    if (shouldInclude) {
      dateKeys.push(
        getDateKey(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          currentDate.getDate(),
        ),
      )
    }
  }

  return dateKeys.length > 0 ? dateKeys : [getDateKey(date.year, date.month, date.day)]
}

function getRepeatEndDate(
  repeatId: string,
  start: Pick<PeriodDateTime, 'year' | 'month' | 'day'>,
  end: Pick<PeriodDateTime, 'year' | 'month' | 'day'>,
) {
  if (repeatId === 'none') return end

  const startDate = new Date(start.year, start.month - 1, start.day)
  const endDate = new Date(end.year, end.month - 1, end.day)

  return endDate > startDate ? end : undefined
}

function createPeriodDateTime(
  year: number,
  month: number,
  day: number,
  hour24 = 16,
  minute = 0,
): PeriodDateTime {
  const period = hour24 >= 12 ? 'PM' : 'AM'
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12

  return { year, month, day, period, hour, minute }
}

function getHour24(dateTime: PeriodDateTime) {
  if (dateTime.period === 'AM') return dateTime.hour === 12 ? 0 : dateTime.hour
  return dateTime.hour === 12 ? 12 : dateTime.hour + 12
}

function getPeriodTimeLabel(dateTime: PeriodDateTime) {
  return `${String(getHour24(dateTime)).padStart(2, '0')}:${String(dateTime.minute).padStart(2, '0')}`
}

function getPeriodDateLabel(dateTime: PeriodDateTime) {
  const date = new Date(dateTime.year, dateTime.month - 1, dateTime.day)

  return `${dateTime.year}년 ${dateTime.month}월 ${dateTime.day}일 ${periodWeekLabels[date.getDay()]}요일 ${getPeriodTimeLabel(dateTime)}`
}

function getPeriodRangeLabel(start: PeriodDateTime, end: PeriodDateTime) {
  const startLabel = `${start.month}월 ${start.day}일`
  const endLabel = `${end.month}월 ${end.day}일`

  return startLabel === endLabel ? startLabel : `${startLabel} ~ ${endLabel}`
}

function getPeriodOptionKey(dateTime: Pick<PeriodDateTime, 'year' | 'month' | 'day'>) {
  return getDateKey(dateTime.year, dateTime.month, dateTime.day)
}

function createPeriodDateOptions(centerDateTime: PeriodDateTime) {
  const centerDate = new Date(centerDateTime.year, centerDateTime.month - 1, centerDateTime.day)

  return Array.from({ length: PERIOD_DATE_RANGE_DAYS * 2 + 1 }, (_, index) => {
    const date = new Date(centerDate)
    date.setDate(centerDate.getDate() - PERIOD_DATE_RANGE_DAYS + index)

    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      label: `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${periodWeekLabels[date.getDay()]}`,
    }
  })
}

function createCenteredNumberOptions(
  value: number,
  options: number[],
) {
  void value
  return options
}

function parseTimeToPeriodDateTime(
  date: { year: number; month: number; day: number },
  time: string,
) {
  const [hourValue = '16', minuteValue = '00'] = time.split(':')
  const hour24 = Number(hourValue)
  const minute = Number(minuteValue)

  return createPeriodDateTime(
    date.year,
    date.month,
    date.day,
    Number.isFinite(hour24) ? hour24 : 16,
    Number.isFinite(minute) ? minute : 0,
  )
}

function readDefaultFeedAmount(records?: MissionHistoryRecord[]) {
  const latestRecordAmount = getLatestAmountByCategory('meal', records ?? readMissionHistoryRecordsWithDefaults())
  if (latestRecordAmount !== null) return latestRecordAmount
  if (typeof window === 'undefined') return 0

  const storedAmount = Number(window.localStorage.getItem(DEFAULT_FEED_AMOUNT_STORAGE_KEY))
  return Number.isFinite(storedAmount) && storedAmount >= 0 ? storedAmount : 0
}

function readDefaultRecordAmount(categoryId: string, records?: MissionHistoryRecord[]) {
  if (categoryId === 'meal') return readDefaultFeedAmount(records)

  if (categoryId === 'walk') {
    return getLatestAmountByCategory('walk', records ?? readMissionHistoryRecordsWithDefaults()) ?? 30
  }

  return 0
}

function writeDefaultFeedAmount(amount: number) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(
    DEFAULT_FEED_AMOUNT_STORAGE_KEY,
    String(Math.max(0, Math.round(amount)))
  )
}

function getFeedAmountFromText(text: string) {
  const match = text.match(/(\d+)\s*g/i)
  if (!match) return null

  const amount = Number(match[1])
  return Number.isFinite(amount) ? amount : null
}

function getWalkMinutesFromText(text: string) {
  const match = text.match(/(\d+)\s*분/)
  if (!match) return null

  const amount = Number(match[1])
  return Number.isFinite(amount) ? amount : null
}

function getRecordAmountFromText(categoryId: string, text: string) {
  if (categoryId === 'meal') return getFeedAmountFromText(text)
  if (categoryId === 'walk') return getWalkMinutesFromText(text)

  return null
}

function isCategoryAmountRecord(categoryId: string, record: MissionHistoryRecord) {
  if (categoryId === 'meal') {
    return record.title.includes('식사') || record.detail.includes('사료')
  }

  if (categoryId === 'walk') {
    return record.title.includes('산책') || record.detail.includes('산책')
  }

  return false
}

function getLatestAmountByCategory(categoryId: string, records: MissionHistoryRecord[]) {
  const latestRecord = [...records]
    .filter((record) => (
      isCategoryAmountRecord(categoryId, record) &&
      getRecordAmountFromText(categoryId, record.detail) !== null
    ))
    .sort((a, b) => {
      const aTime = new Date(`${a.date}T${a.time || '00:00'}`).getTime()
      const bTime = new Date(`${b.date}T${b.time || '00:00'}`).getTime()
      return bTime - aTime
    })[0]

  return latestRecord ? getRecordAmountFromText(categoryId, latestRecord.detail) : null
}

function getPetAgeLabel(birthDate: string) {
  const [birthYear, birthMonth, birthDay] = birthDate.split('.').map(Number)
  if (!birthYear || !birthMonth || !birthDay) return '-'

  const today = new Date()
  let age = today.getFullYear() - birthYear
  const birthdayThisYear = new Date(today.getFullYear(), birthMonth - 1, birthDay)

  if (today < birthdayThisYear) {
    age -= 1
  }

  return `${Math.max(age, 0)}살`
}

type CategoryOption = {
  id: string
  label: string
  color: string
}

type RepeatOption = {
  id: string
  label: string
}

const initialCategoryOptions: CategoryOption[] = [
  { id: 'meal', label: '식사 기록', color: '#F2B472' },
  { id: 'poop', label: '배변 · 배뇨 기록', color: '#BEE3F8' },
  { id: 'activity', label: '활동 기록', color: '#162447' },
  { id: 'symptom', label: '증상 기록', color: '#A28BFA' },
  { id: 'walk', label: '산책 기록', color: '#A4CE95' },
]

const fixedCategoryIds = new Set(initialCategoryOptions.map((category) => category.id))
const categoryDisplayOrder = ['meal', 'poop', 'activity', 'symptom', 'walk']

const repeatOptions: RepeatOption[] = [
  { id: 'none', label: '반복 안 함' },
  { id: 'daily', label: '매일' },
  { id: 'weekdays', label: '주중만' },
  { id: 'weekly', label: '매주' },
]

const categoryColorOptions = [
  '#162447',
  '#BEE3F8',
  '#DDEEEC',
  '#A28BFA',
  '#E8CEA0',
  '#A4CE95',
  '#F2B472',
  '#D93A47',
]

function getCategoryColorForTitle(
  title: string,
  categories: CategoryOption[],
) {
  const normalizedTitle = title.replace(/\s+/g, '')

  return categories.find((category) => {
    const normalizedLabel = category.label.replace(/\s+/g, '')
    return (
      normalizedTitle.includes(normalizedLabel) ||
      normalizedLabel.includes(normalizedTitle.replace(/기록$/, '')) ||
      (normalizedTitle.includes('배변') && normalizedLabel.includes('배변'))
    )
  })?.color
}

const quickMessageOptions = [
  '사료 30g',
  '사료 60g',
  '사료 90g',
  '사료 120g',
  '사료 150g',
  '기타',
]

const categoryQuickMessageOptions: Record<string, string[]> = {
  meal: quickMessageOptions,
  activity: ['활발함', '보통', '활동 적음', '무기력', '평소와 다름', '기타'],
  poop: ['정상 변', '묽은 변', '딱딱한 변', '배변 못함', '소변 잦음', '실수 배뇨', '평소와 다름', '기타'],
  symptom: ['기침', '재채기', '구토', '설사', '헐떡', '무기력', '긁음', '기타'],
}

function Mission() {
  const navigate = useNavigate()
  const [calendarYear, setCalendarYear] = useState(CALENDAR_YEAR)
  const [calendarMonth, setCalendarMonth] = useState(CALENDAR_MONTH)
  const [selectedDayId, setSelectedDayId] = useState(`c-${CALENDAR_DAY}`)
  const [monthSlideDirection, setMonthSlideDirection] = useState<'prev' | 'next'>('next')
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isCalendarCondensed, setIsCalendarCondensed] = useState(false)
  const [isFabOpen, setIsFabOpen] = useState(false)
  const [isFabClosing, setIsFabClosing] = useState(false)
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false)
  const [isCategoryAddOpen, setIsCategoryAddOpen] = useState(false)
  const [isCategoryEditOpen, setIsCategoryEditOpen] = useState(false)
  const [isRepeatPickerOpen, setIsRepeatPickerOpen] = useState(false)
  const [isPetSwitchOpen, setIsPetSwitchOpen] = useState(false)
  const [hasExplicitPetSelection, setHasExplicitPetSelection] = useState(false)
  const [isPeriodPickerOpen, setIsPeriodPickerOpen] = useState(false)
  const [isPeriodDatePickerOpen, setIsPeriodDatePickerOpen] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const [selectedQuickMessage, setSelectedQuickMessage] = useState('')
  const [feedAmount, setFeedAmount] = useState(readDefaultFeedAmount)
  const [editingHistoryId, setEditingHistoryId] = useState<number | null>(null)
  const [historyItems, setHistoryItems] = useState<MissionHistoryRecord[]>(() => [
    ...readMissionActivityRecords().map(toMissionHistoryRecord),
    ...readMissionHistoryRecordsWithDefaults(),
  ])
  const [petProfiles, setPetProfiles] = useState<PetProfileSummary[]>(readPetProfiles)
  const [selectedPetProfileId, setSelectedPetProfileId] = useState(readSelectedPetProfileId)
  const [categories, setCategories] = useState<CategoryOption[]>(initialCategoryOptions)
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryOptions[0].id)
  const [draftCategoryId, setDraftCategoryId] = useState(initialCategoryOptions[0].id)
  const [selectedRepeatId, setSelectedRepeatId] = useState('none')
  const [draftRepeatId, setDraftRepeatId] = useState('none')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('')
  const [editCategoryName, setEditCategoryName] = useState('')
  const [editCategoryColor, setEditCategoryColor] = useState('')
  const [addDate, setAddDate] = useState({
    year: CALENDAR_YEAR,
    month: CALENDAR_MONTH,
    day: CALENDAR_DAY,
  })
  const [draftAddDate, setDraftAddDate] = useState(addDate)
  const [periodStart, setPeriodStart] = useState(() =>
    createPeriodDateTime(CALENDAR_YEAR, CALENDAR_MONTH, CALENDAR_DAY)
  )
  const [periodEnd, setPeriodEnd] = useState(() =>
    createPeriodDateTime(CALENDAR_YEAR, CALENDAR_MONTH, CALENDAR_DAY)
  )
  const [draftPeriodStart, setDraftPeriodStart] = useState(periodStart)
  const [draftPeriodEnd, setDraftPeriodEnd] = useState(periodEnd)
  const [periodEditingField, setPeriodEditingField] = useState<PeriodField>('start')
  const calendarRef = useRef<HTMLElement>(null)
  const monthBarRef = useRef<HTMLDivElement>(null)
  const weekdaysRef = useRef<HTMLDivElement>(null)
  const historyListRef = useRef<HTMLDivElement>(null)
  const periodWheelScrollFrames = useRef<Record<string, number | undefined>>({})
  const calendarDays = useMemo(
    () => createCalendarDays(calendarYear, calendarMonth),
    [calendarMonth, calendarYear]
  )
  const recordedDateKeys = useMemo(
    () => new Set(historyItems.map((item) => item.date).filter(Boolean)),
    [historyItems]
  )
  const recordedDateColors = useMemo(() => {
    const colorsByDate = new Map<string, string[]>()

    historyItems.forEach((item) => {
      if (!item.date) return

      const colors = colorsByDate.get(item.date) ?? []
      const recordColor = getCategoryColorForTitle(item.title, categories) ?? item.color
      if (!colors.includes(recordColor)) {
        colorsByDate.set(item.date, [...colors, recordColor])
      }
    })

    return colorsByDate
  }, [categories, historyItems])

  useEffect(() => {
    const currentSelected = calendarDays.find((day) => day.id === selectedDayId)
    if (currentSelected) {
      return
    }

    const firstCurrentMonthDay = calendarDays.find((day) => !day.muted)
    if (firstCurrentMonthDay) {
      setSelectedDayId(firstCurrentMonthDay.id)
    }
  }, [calendarDays, selectedDayId])

  useEffect(() => {
    const syncMissionActivityRecords = () => {
      setHistoryItems([
        ...readMissionActivityRecords().map(toMissionHistoryRecord),
        ...readMissionHistoryRecordsWithDefaults(),
      ])
    }

    window.addEventListener(MISSION_ACTIVITY_RECORDS_CHANGE_EVENT, syncMissionActivityRecords)
    window.addEventListener(MISSION_HISTORY_RECORDS_CHANGE_EVENT, syncMissionActivityRecords)
    window.addEventListener('storage', syncMissionActivityRecords)

    return () => {
      window.removeEventListener(MISSION_ACTIVITY_RECORDS_CHANGE_EVENT, syncMissionActivityRecords)
      window.removeEventListener(MISSION_HISTORY_RECORDS_CHANGE_EVENT, syncMissionActivityRecords)
      window.removeEventListener('storage', syncMissionActivityRecords)
    }
  }, [])

  useEffect(() => {
    writeStoredMissionHistoryRecords(historyItems)
  }, [historyItems])

  useEffect(() => {
    const syncPetProfiles = () => {
      setPetProfiles(readPetProfiles())
      setSelectedPetProfileId(readSelectedPetProfileId())
      setHistoryItems([
        ...readMissionActivityRecords().map(toMissionHistoryRecord),
        ...readMissionHistoryRecordsWithDefaults(),
      ])
    }

    window.addEventListener(PET_PROFILES_CHANGE_EVENT, syncPetProfiles)
    window.addEventListener('storage', syncPetProfiles)

    return () => {
      window.removeEventListener(PET_PROFILES_CHANGE_EVENT, syncPetProfiles)
      window.removeEventListener('storage', syncPetProfiles)
    }
  }, [])

  const selectedDay = useMemo(
    () => calendarDays.find((day) => day.id === selectedDayId) ?? calendarDays[24],
    [calendarDays, selectedDayId]
  )

  const selectedPetProfile = petProfiles.find((profile) => profile.id === selectedPetProfileId)
  const effectiveSelectedPetProfileId = selectedPetProfile?.id ?? petProfiles[0]?.id ?? selectedPetProfileId
  const petName = selectedPetProfile?.name ?? readSelectedPetProfileName()
  const selectedDate = new Date(selectedDay.year, selectedDay.month - 1, Number(selectedDay.label))
  const selectedDateKey = getDateKey(selectedDay.year, selectedDay.month, Number(selectedDay.label))
  const isTodaySelected =
    calendarYear === CALENDAR_YEAR &&
    calendarMonth === CALENDAR_MONTH &&
    selectedDateKey === getDateKey(CALENDAR_YEAR, CALENDAR_MONTH, CALENDAR_DAY)
  const selectedDateLabel = `${selectedDay.month}월 ${selectedDay.label}일(${weekLabels[selectedDate.getDay()]})`
  const selectedHistoryItems = useMemo(
    () => historyItems.filter((item) => item.date === selectedDateKey),
    [historyItems, selectedDateKey]
  )
  const canCondenseCalendar = selectedHistoryItems.length > 1
  const isWeeklyCalendar = isCalendarCondensed
  const selectedWeekIndex = useMemo(() => {
    const selectedIndex = calendarDays.findIndex(
      (day) =>
        day.year === selectedDay.year &&
        day.month === selectedDay.month &&
        day.label === selectedDay.label
    )

    return Math.floor(Math.max(selectedIndex, 0) / 7)
  }, [calendarDays, selectedDay])
  const calendarTranslateY = isWeeklyCalendar ? selectedWeekIndex * 49 : 0
  const firstAvailableCategoryColor = categoryColorOptions[0] ?? ''
  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? categories[0]
  const orderedCategories = useMemo(
    () =>
      [...categories].sort((firstCategory, secondCategory) => {
        const firstOrder = categoryDisplayOrder.indexOf(firstCategory.id)
        const secondOrder = categoryDisplayOrder.indexOf(secondCategory.id)

        if (firstOrder === -1 && secondOrder === -1) return 0
        if (firstOrder === -1) return 1
        if (secondOrder === -1) return -1

        return firstOrder - secondOrder
      }),
    [categories],
  )
  const selectedQuickMessageOptions = categoryQuickMessageOptions[selectedCategory.id] ?? []
  const draftCategory =
    categories.find((category) => category.id === draftCategoryId) ?? selectedCategory
  const isFixedDraftCategory = fixedCategoryIds.has(draftCategory.id)
  const selectedRepeat =
    repeatOptions.find((option) => option.id === selectedRepeatId) ?? repeatOptions[0]
  const draftRepeat =
    repeatOptions.find((option) => option.id === draftRepeatId) ?? selectedRepeat
  const getHistoryColor = (title: string, color?: string) => {
    const matchedColor = getCategoryColorForTitle(title, categories)
    if (matchedColor) return matchedColor
    if (color) return color

    return (
      categories.find((category) => title.includes(category.label) || category.label.includes(title.replace(/\s*기록$/, '')))?.color ??
      '#A08DFF'
    )
  }
  const canSaveMission =
    selectedCategory.id === 'meal' ||
    selectedCategory.id === 'walk' ||
    addTitle.trim().length > 0 ||
    selectedQuickMessage !== ''
  const isEditingHistory = editingHistoryId !== null
  const canAddCategory =
    newCategoryName.trim().length > 0 &&
    newCategoryColor !== ''
  const canEditCategory =
    editCategoryName.trim().length > 0 &&
    editCategoryColor !== ''
  const addCalendarDays = useMemo(
    () => createCalendarDays(draftAddDate.year, draftAddDate.month),
    [draftAddDate.month, draftAddDate.year]
  )
  const activeDraftPeriod = periodEditingField === 'start' ? draftPeriodStart : draftPeriodEnd
  const periodDateOptions = useMemo(
    () => createPeriodDateOptions(activeDraftPeriod),
    [activeDraftPeriod],
  )
  const visiblePeriodHourOptions = useMemo(
    () => createCenteredNumberOptions(activeDraftPeriod.hour, periodHourOptions),
    [activeDraftPeriod.hour],
  )
  const visiblePeriodMinuteOptions = useMemo(
    () => createCenteredNumberOptions(activeDraftPeriod.minute, periodMinuteOptions),
    [activeDraftPeriod.minute],
  )

  useEffect(() => {
    if (!isPeriodDatePickerOpen || typeof window === 'undefined') return undefined

    const frameId = window.requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>('.mission_period_wheel_column').forEach((column) => {
        const activeOption =
          column.querySelector<HTMLElement>('button.active[data-loop="1"]') ??
          column.querySelector<HTMLElement>('button.active')
        activeOption?.scrollIntoView({ block: 'center' })
      })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [
    isPeriodDatePickerOpen,
    periodEditingField,
  ])

  const updateDraftPeriod = (nextValue: Partial<PeriodDateTime>) => {
    const updater = (prev: PeriodDateTime) => ({ ...prev, ...nextValue })

    if (periodEditingField === 'start') {
      setDraftPeriodStart(updater)
      return
    }

    setDraftPeriodEnd(updater)
  }

  const openStartPeriodPicker = () => {
    setPeriodEditingField('start')
    setIsPeriodDatePickerOpen(true)
  }

  const openDatePicker = () => {
    setIsDatePickerOpen((prev) => !prev)
  }

  const togglePeriodDatePicker = () => {
    setIsPeriodDatePickerOpen((prev) => !prev)
  }

  const closeMissionSheet = () => {
    setIsFabOpen(false)
    setIsFabClosing(false)
    setIsCategoryPickerOpen(false)
    setIsCategoryAddOpen(false)
    setIsCategoryEditOpen(false)
    setIsRepeatPickerOpen(false)
    setIsPeriodPickerOpen(false)
    setIsPeriodDatePickerOpen(false)
    setAddTitle('')
    setSelectedQuickMessage('')
    setFeedAmount(readDefaultRecordAmount(selectedCategoryId, historyItems))
    setEditingHistoryId(null)
  }

  const requestCloseMissionSheet = () => {
    setIsFabClosing(true)
  }

  const openMissionSheet = () => {
    const nextAddDate = {
      year: selectedDay.year,
      month: selectedDay.month,
      day: Number(selectedDay.label),
    }
    const now = new Date()
    const nextPeriod = createPeriodDateTime(
      nextAddDate.year,
      nextAddDate.month,
      nextAddDate.day,
      now.getHours(),
      now.getMinutes(),
    )

    setAddDate(nextAddDate)
    setDraftAddDate(nextAddDate)
    setPeriodStart(nextPeriod)
    setPeriodEnd(nextPeriod)
    setDraftPeriodStart(nextPeriod)
    setDraftPeriodEnd(nextPeriod)
    setPeriodEditingField('start')
    setIsPeriodDatePickerOpen(false)
    setFeedAmount(readDefaultRecordAmount(selectedCategoryId, historyItems))
    setAddTitle('')
    setSelectedQuickMessage('')
    setSelectedRepeatId('none')
    setDraftRepeatId('none')
    setIsFabClosing(false)
    setIsFabOpen(true)
  }

  useEffect(() => {
    const scrollContainer = document.querySelector('.layout_content') as HTMLElement | null
    const pageContainer = document.querySelector('.mission_page') as HTMLElement | null
    const resetScrollTop = () => {
      if (scrollContainer) scrollContainer.scrollTop = 0
      if (pageContainer) pageContainer.scrollTop = 0
      window.scrollTo({ top: 0 })
    }
    const getScrollTop = () =>
      Math.max(
        scrollContainer?.scrollTop ?? 0,
        pageContainer?.scrollTop ?? 0,
        window.scrollY,
        document.documentElement.scrollTop,
      )
    const showWeeklyCalendar = () => {
      if (!canCondenseCalendar) return
      setIsCalendarCondensed(true)
    }
    const showMonthlyCalendar = () => {
      setIsCalendarCondensed(false)
      resetScrollTop()
    }
    const isHistoryListAtTop = () => getScrollTop() <= 4
    const syncCalendarMode = () => {
      if (!canCondenseCalendar) {
        setIsCalendarCondensed(false)
        resetScrollTop()
        return
      }

      const shouldShowWeeklyCalendar = getScrollTop() > 4
      setIsCalendarCondensed((prev) => (
        prev === shouldShowWeeklyCalendar ? prev : shouldShowWeeklyCalendar
      ))
    }
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0) {
        showWeeklyCalendar()
        return
      }

      if (event.deltaY < 0 && isHistoryListAtTop()) {
        showMonthlyCalendar()
      }
    }
    let touchStartY = 0
    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0
    }
    const handleTouchMove = (event: TouchEvent) => {
      const nextY = event.touches[0]?.clientY ?? touchStartY
      if (touchStartY - nextY > 0) {
        showWeeklyCalendar()
        return
      }

      if (touchStartY - nextY < 0 && isHistoryListAtTop()) {
        showMonthlyCalendar()
      }
    }

    syncCalendarMode()
    scrollContainer?.addEventListener('scroll', syncCalendarMode, { passive: true })
    pageContainer?.addEventListener('scroll', syncCalendarMode, { passive: true })
    window.addEventListener('scroll', syncCalendarMode, { passive: true })
    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      scrollContainer?.removeEventListener('scroll', syncCalendarMode)
      pageContainer?.removeEventListener('scroll', syncCalendarMode)
      window.removeEventListener('scroll', syncCalendarMode)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [canCondenseCalendar])

  useEffect(() => {
    if (!isDatePickerOpen && !isPeriodDatePickerOpen) return

    const closePickerOnPageMove = (event: Event) => {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest('.date_picker, .mission_period_inline, .mission_period_wheel, .mission_period_row')
      ) {
        return
      }

      setIsDatePickerOpen(false)
      setIsPeriodDatePickerOpen(false)
    }

    window.addEventListener('scroll', closePickerOnPageMove, true)
    window.addEventListener('wheel', closePickerOnPageMove, true)
    window.addEventListener('touchmove', closePickerOnPageMove, true)
    document.addEventListener('mousedown', closePickerOnPageMove, true)

    return () => {
      window.removeEventListener('scroll', closePickerOnPageMove, true)
      window.removeEventListener('wheel', closePickerOnPageMove, true)
      window.removeEventListener('touchmove', closePickerOnPageMove, true)
      document.removeEventListener('mousedown', closePickerOnPageMove, true)
    }
  }, [isDatePickerOpen, isPeriodDatePickerOpen])

  const saveMission = () => {
    const memo = addTitle.trim()
    const effectiveAddDate = {
      year: draftPeriodStart.year,
      month: draftPeriodStart.month,
      day: draftPeriodStart.day,
    }
    const effectivePeriodStart = draftPeriodStart
    const effectivePeriodEnd = draftPeriodEnd
    const primaryDetail =
      selectedCategory.id === 'meal'
        ? `사료 ${feedAmount}g`
        : selectedCategory.id === 'walk'
          ? `산책 ${feedAmount}분`
          : selectedQuickMessage
    const detail = [primaryDetail, memo].filter(Boolean).join('\n')

    if (!detail) return
    if (selectedCategory.id === 'meal') {
      writeDefaultFeedAmount(feedAmount)
    }

    const time = getPeriodTimeLabel(effectivePeriodStart)
    const recordTitle = selectedCategory.label === '증상' ? '증상 기록' : selectedCategory.label
    const recordDate = getDateKey(effectiveAddDate.year, effectiveAddDate.month, effectiveAddDate.day)
    const repeatDateKeys = createRepeatDateKeys(
      selectedRepeatId,
      effectiveAddDate,
      getRepeatEndDate(selectedRepeatId, effectivePeriodStart, effectivePeriodEnd),
    )

    if (editingHistoryId !== null) {
      setHistoryItems((prev) =>
        prev.map((item) =>
          item.id === editingHistoryId
            ? {
                ...item,
                title: recordTitle,
                detail,
                color: selectedCategory.color,
                date: recordDate,
              }
            : item
        )
      )
      showStateBarMessage('기록이 수정되었습니다.', 3000)
      requestCloseMissionSheet()
      return
    }

    const baseId = Date.now()
    const nextRecords = repeatDateKeys.map((dateKey, index) => ({
      id: baseId + index,
      title: recordTitle,
      detail,
      time,
      color: selectedCategory.color,
      date: dateKey,
    }))

    if (selectedCategory.id === 'walk') markWalkRecorded()
    if (selectedCategory.id === 'meal') markMealRecorded()
    const nextHistory = [...nextRecords].reverse().concat(historyItems)
    writeStoredMissionHistoryRecords(nextHistory)
    setHistoryItems(nextHistory)
    window.dispatchEvent(new CustomEvent(MISSION_HISTORY_RECORDS_CHANGE_EVENT, { detail: nextRecords[0] }))
    showStateBarMessage(`${petName}의 기록이 저장되었어요.`)
    addUserNotification({
      title: '건강 히스토리',
      content: `${petName}의 기록이 저장되었어요.`,
      path: '/mission',
    })

    if (selectedCategory.id === 'walk' || selectedCategory.id === 'meal') {
      const challengeDay = getCurrentChallengeDay()
      if (checkChallengeDayDone(challengeDay) && !isChallengeDayClaimed(challengeDay)) {
        claimChallengeDay(challengeDay)
        addUserNotification({
          title: '챌린지',
          content: '오늘의 챌린지가 참여되었습니다. 포인트 받아주세요.',
          path: '/community/challenge',
        })
        showStateBarMessage('오늘의 챌린지가 참여되었습니다.\n포인트 받아주세요.', 5000, {
          actionLabel: '이동하기',
          onAction: () => navigate('/community/challenge'),
        })
      }
    }

    requestCloseMissionSheet()
  }

  const deleteMission = () => {
    if (editingHistoryId === null) return

    setHistoryItems((prev) => prev.filter((item) => item.id !== editingHistoryId))
    requestCloseMissionSheet()
  }

  const openHistoryEdit = (item: MissionHistoryRecord) => {
    const [year, month, day] = item.date.split('-').map(Number)
    const nextDate = {
      year: Number.isFinite(year) ? year : selectedDay.year,
      month: Number.isFinite(month) ? month : selectedDay.month,
      day: Number.isFinite(day) ? day : Number(selectedDay.label),
    }
    const nextCategory =
      categories.find((category) => (
        item.title.includes(category.label) ||
        category.label.includes(item.title.replace(/\s*기록$/, '')) ||
        category.color.toLowerCase() === item.color.toLowerCase()
      )) ?? selectedCategory
    const [primaryDetail = '', ...memoDetailParts] = item.detail.split('\n')
    const isAmountRecord = nextCategory.id === 'meal' || nextCategory.id === 'walk'
    const nextPeriod = parseTimeToPeriodDateTime(nextDate, item.time)

    setEditingHistoryId(item.id)
    setSelectedQuickMessage(isAmountRecord ? '' : primaryDetail)
    setAddTitle(memoDetailParts.join('\n'))
    setFeedAmount(
      getRecordAmountFromText(nextCategory.id, item.detail) ??
      readDefaultRecordAmount(nextCategory.id, historyItems)
    )
    setSelectedCategoryId(nextCategory.id)
    setDraftCategoryId(nextCategory.id)
    setAddDate(nextDate)
    setDraftAddDate(nextDate)
    setPeriodStart(nextPeriod)
    setPeriodEnd(nextPeriod)
    setDraftPeriodStart(nextPeriod)
    setDraftPeriodEnd(nextPeriod)
    setPeriodEditingField('start')
    setIsCategoryPickerOpen(false)
    setIsCategoryAddOpen(false)
    setIsCategoryEditOpen(false)
    setIsRepeatPickerOpen(false)
    setIsPeriodPickerOpen(false)
    setIsPeriodDatePickerOpen(false)
    setIsFabOpen(true)
  }

  const openCategoryEdit = () => {
    const category = categories.find((item) => item.id === draftCategoryId) ?? selectedCategory
    setEditCategoryName(category.label)
    setEditCategoryColor(category.color)
    setIsCategoryEditOpen(true)
  }

  const saveCategoryEdit = () => {
    if (!canEditCategory) return
    const isFixedCategory = fixedCategoryIds.has(draftCategoryId)

    setCategories((prev) =>
      prev.map((category) =>
        category.id === draftCategoryId
          ? {
              ...category,
              label: isFixedCategory ? category.label : editCategoryName.trim(),
              color: editCategoryColor,
            }
          : category
      )
    )
    setIsCategoryEditOpen(false)
    setEditCategoryName('')
    setEditCategoryColor('')
  }

  const selectPetProfile = (profileId: number) => {
    const selectedProfile = petProfiles.find((profile) => profile.id === profileId)
    const shouldShowChangeToast = profileId !== effectiveSelectedPetProfileId
    setSelectedPetProfileId(profileId)
    setHasExplicitPetSelection(true)
    writeSelectedPetProfileId(profileId)
    setHistoryItems([
      ...readMissionActivityRecords().map(toMissionHistoryRecord),
      ...readMissionHistoryRecordsWithDefaults(),
    ])
    setIsPetSwitchOpen(false)
    if (selectedProfile && shouldShowChangeToast) {
      showStateBarMessage(`${selectedProfile.name} 반려동물로 대상을 변경했어요`, 3000, { placement: 'footer' })
    }
  }

  const goToToday = () => {
    setMonthSlideDirection(calendarYear > CALENDAR_YEAR || (calendarYear === CALENDAR_YEAR && calendarMonth > CALENDAR_MONTH) ? 'prev' : 'next')
    setCalendarYear(CALENDAR_YEAR)
    setCalendarMonth(CALENDAR_MONTH)
    setSelectedDayId(`c-${CALENDAR_DAY}`)
  }

  const moveMonth = (direction: 'prev' | 'next') => {
    setMonthSlideDirection(direction)
    setCalendarMonth((prev) => {
      if (direction === 'prev') {
        if (prev === 1) { setCalendarYear((y) => y - 1); return 12 }
        return prev - 1
      }
      if (prev === 12) { setCalendarYear((y) => y + 1); return 1 }
      return prev + 1
    })
  }

  useEffect(() => {
    const section = calendarRef.current
    if (!section) return

    let startX = 0
    let startY = 0

    const handleSectionTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const handleSectionTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX
      const dy = e.changedTouches[0].clientY - startY
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= 40) {
        moveMonth(dx < 0 ? 'next' : 'prev')
      }
    }

    section.addEventListener('touchstart', handleSectionTouchStart, { passive: true })
    section.addEventListener('touchend', handleSectionTouchEnd, { passive: true })

    return () => {
      section.removeEventListener('touchstart', handleSectionTouchStart)
      section.removeEventListener('touchend', handleSectionTouchEnd)
    }
  }, [moveMonth])

  const getCenteredPeriodButton = (column: HTMLElement) => {
    const columnRect = column.getBoundingClientRect()
    const columnCenterY = columnRect.top + columnRect.height / 2
    const buttons = Array.from(column.querySelectorAll<HTMLButtonElement>('button'))

    return buttons.reduce<HTMLButtonElement | null>((closestButton, button) => {
      if (!closestButton) return button

      const buttonRect = button.getBoundingClientRect()
      const closestRect = closestButton.getBoundingClientRect()
      const buttonDistance = Math.abs((buttonRect.top + buttonRect.height / 2) - columnCenterY)
      const closestDistance = Math.abs((closestRect.top + closestRect.height / 2) - columnCenterY)

      return buttonDistance < closestDistance ? button : closestButton
    }, null)
  }

  const handlePeriodWheelScroll = (
    event: UIEvent<HTMLDivElement>,
    type: 'date' | 'period' | 'hour' | 'minute',
  ) => {
    const column = event.currentTarget
    const frameKey = `${periodEditingField}-${type}`
    const optionCount =
      type === 'period'
        ? periodOptions.length
        : type === 'hour'
          ? periodHourOptions.length
          : type === 'minute'
            ? periodMinuteOptions.length
            : 0

    if (optionCount > 0) {
      const loopHeight = optionCount * periodWheelItemHeight
      if (column.scrollTop < loopHeight * 0.5) {
        column.scrollTop += loopHeight
      } else if (column.scrollTop > loopHeight * 1.5) {
        column.scrollTop -= loopHeight
      }
    }

    if (periodWheelScrollFrames.current[frameKey]) {
      window.cancelAnimationFrame(periodWheelScrollFrames.current[frameKey])
    }

    periodWheelScrollFrames.current[frameKey] = window.requestAnimationFrame(() => {
      applyCenteredPeriodValue(column, type)
      periodWheelScrollFrames.current[frameKey] = undefined
    })
  }

  const applyCenteredPeriodValue = (
    column: HTMLElement,
    type: 'date' | 'period' | 'hour' | 'minute',
  ) => {
    const centeredButton = getCenteredPeriodButton(column)
    if (!centeredButton) return

    if (type === 'date') {
      const year = Number(centeredButton.dataset.year)
      const month = Number(centeredButton.dataset.month)
      const day = Number(centeredButton.dataset.day)

      if (
        Number.isFinite(year) &&
        Number.isFinite(month) &&
        Number.isFinite(day) &&
        (
          activeDraftPeriod.year !== year ||
          activeDraftPeriod.month !== month ||
          activeDraftPeriod.day !== day
        )
      ) {
        updateDraftPeriod({ year, month, day })
      }
      return
    }

    if (type === 'period') {
      const period = centeredButton.dataset.value as PeriodDateTime['period'] | undefined
      if ((period === 'AM' || period === 'PM') && activeDraftPeriod.period !== period) {
        updateDraftPeriod({ period })
      }
      return
    }

    const numericValue = Number(centeredButton.dataset.value)
    if (!Number.isFinite(numericValue)) return

    if (type === 'hour' && activeDraftPeriod.hour !== numericValue) {
      updateDraftPeriod({ hour: numericValue })
    }

    if (type === 'minute' && activeDraftPeriod.minute !== numericValue) {
      updateDraftPeriod({ minute: numericValue })
    }
  }

  const renderPeriodWheel = () => (
    <div className="mission_period_wheel" aria-label="기간 날짜와 시간 선택">
      <div className="mission_period_wheel_selector" aria-hidden="true" />
      <div
        className="mission_period_wheel_column date"
        onScroll={(event) => handlePeriodWheelScroll(event, 'date')}
      >
        {periodDateOptions.map((option) => {
          const isSelected =
            getPeriodOptionKey(option) === getPeriodOptionKey(activeDraftPeriod)

          return (
            <button
              key={getPeriodOptionKey(option)}
              type="button"
              className={isSelected ? 'active' : ''}
              data-year={option.year}
              data-month={option.month}
              data-day={option.day}
              onClick={() => updateDraftPeriod({
                year: option.year,
                month: option.month,
                day: option.day,
              })}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      <div
        className="mission_period_wheel_column period"
        onScroll={(event) => handlePeriodWheelScroll(event, 'period')}
      >
        {periodWheelLoops.flatMap((loopIndex) =>
          periodOptions.map((option) => (
            <button
              key={`${option.value}-${loopIndex}`}
              type="button"
              className={activeDraftPeriod.period === option.value ? 'active' : ''}
              data-value={option.value}
              data-loop={loopIndex}
              onClick={() => updateDraftPeriod({ period: option.value })}
            >
              {option.label}
            </button>
          )),
        )}
      </div>
      <div
        className="mission_period_wheel_column"
        onScroll={(event) => handlePeriodWheelScroll(event, 'hour')}
      >
        {periodWheelLoops.flatMap((loopIndex) =>
          visiblePeriodHourOptions.map((hour) => (
            <button
              key={`${hour}-${loopIndex}`}
              type="button"
              className={activeDraftPeriod.hour === hour ? 'active' : ''}
              data-value={hour}
              data-loop={loopIndex}
              onClick={() => updateDraftPeriod({ hour })}
            >
              {hour}
            </button>
          )),
        )}
      </div>
      <div
        className="mission_period_wheel_column"
        onScroll={(event) => handlePeriodWheelScroll(event, 'minute')}
      >
        {periodWheelLoops.flatMap((loopIndex) =>
          visiblePeriodMinuteOptions.map((minute) => (
            <button
              key={`${minute}-${loopIndex}`}
              type="button"
              className={activeDraftPeriod.minute === minute ? 'active' : ''}
              data-value={minute}
              data-loop={loopIndex}
              onClick={() => updateDraftPeriod({ minute })}
            >
              {String(minute).padStart(2, '0')}
            </button>
          )),
        )}
      </div>
    </div>
  )

  return (
    <>
      <PageHeader
        title="건강 히스토리"
        leftContent={<BackButton />}
        rightContent={(
          <>
            <Button type="button" aria-label="캘린더" onClick={openDatePicker}>
              <HeaderIcon type="calendar" />
            </Button>
            <Button type="button" aria-label="알림" onClick={() => navigate('/notification')}>
              <HeaderIcon type="notification" />
            </Button>
          </>
        )}
      />
      <main className={`page mission_page${isWeeklyCalendar ? ' is_condensed' : ''}`}>
        <section className="mission_profile_header">
          <h2>{petName}의 히스토리</h2>
          <Button
            type="button"
            className={`mission_pet_switch_button${hasExplicitPetSelection ? ' has_selected_pet' : ''}`}
            onClick={() => setIsPetSwitchOpen(true)}
          >
            <span>반려동물 선택하기</span>
            <span>
              현재 반려동물 · <strong>{petName}</strong>
            </span>
            <ChevronIcon direction="right" size="md" />
          </Button>
        </section>

        <section
          className={`mission_calendar_section${isWeeklyCalendar ? ' is_condensed' : ''}`}
          ref={calendarRef}
        >
          <div className="mission_calendar_card">
            <div className="mission_month_bar" ref={monthBarRef}>
              <button type="button" className="mission_month_title" onClick={openDatePicker}>
                {calendarYear}년 {calendarMonth}월
                <i className={`bx bx-chevron-${isDatePickerOpen ? 'up' : 'down'}`} aria-hidden="true" />
              </button>
              <Button
                type="button"
                className={`s_white_radius_btn mission_today_chip${isTodaySelected ? ' is_active' : ''}`}
                onClick={goToToday}
              >
                오늘
              </Button>
            </div>

            <div className="mission_weekdays" ref={weekdaysRef} aria-hidden="true">
              {weekLabels.map((label) => (
                <span key={label} className="p_regular">{label}</span>
              ))}
            </div>

            <div className={`mission_calendar_viewport${isWeeklyCalendar ? ' is_weekly' : ''}`}>
              <div
                className="mission_calendar_track"
                style={{ transform: `translateY(-${calendarTranslateY}px)` }}
              >
              <div
                key={`${calendarYear}-${calendarMonth}`}
                className={`mission_calendar_grid slide_${monthSlideDirection}`}
                aria-label={`${calendarYear}년 ${calendarMonth}월 달력`}
              >
                {calendarDays.map((day) => (
                  (() => {
                    const dayDateKey = getDateKey(day.year, day.month, Number(day.label))
                    const dayRecordColors = recordedDateColors.get(dayDateKey) ?? []

                    return (
                      <button
                        key={day.id}
                        type="button"
                        className={`mission_day ${day.muted ? 'muted' : ''} ${
                          day.id === selectedDayId ? 'selected' : ''
                        } ${recordedDateKeys.has(dayDateKey) ? 'has_record' : ''}`}
                        aria-pressed={day.id === selectedDayId}
                        onClick={() => setSelectedDayId(day.id)}
                      >
                        <span className="p_medium">{day.label}</span>
                        {dayRecordColors.length > 0 && (
                          <span className="mission_day_record_dots" aria-hidden="true">
                            {dayRecordColors.slice(0, 3).map((color) => (
                              <span
                                key={color}
                                className="mission_day_record_dot"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </span>
                        )}
                      </button>
                    )
                  })()
                ))}
              </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`mission_history_section${isWeeklyCalendar ? ' is_condensed' : ''}`}>
          <h2>{selectedDateLabel}</h2>
          <div className="mission_history_list" ref={historyListRef}>
            {selectedHistoryItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="mission_history_item"
                onClick={() => openHistoryEdit(item)}
              >
                <span
                  className="mission_history_thumb"
                  style={{ backgroundColor: getHistoryColor(item.title, item.color) }}
                  aria-hidden="true"
                />
                <div className="mission_history_body">
                  <strong className="title_h5">
                    {item.title}
                    <i className="bx bx-edit-alt mission_history_edit_icon" aria-hidden="true" />
                  </strong>
                  <p className="p_regular">{item.detail}</p>
                  {item.media && item.media.length > 0 ? (
                    <div className="mission_history_media" aria-label="등록 이미지">
                      {item.media.slice(0, 3).map((media, index) => (
                        media.type === 'video' ? (
                          <video
                            key={`${media.src}-${index}`}
                            src={media.src}
                            aria-label={media.label || `${item.title} 동영상 ${index + 1}`}
                            controls
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <img
                            key={`${media.src}-${index}`}
                            src={media.src}
                            alt={media.label || `${item.title} 이미지 ${index + 1}`}
                          />
                        )
                      ))}
                    </div>
                  ) : null}
                </div>
                <time className="p_regular">{item.time}</time>
              </button>
            ))}
          </div>
        </section>

        <FloatingWriteButton aria-label="기록 추가" onClick={openMissionSheet} />
      </main>

      {isDatePickerOpen && (
        <AddSheet onClose={() => setIsDatePickerOpen(false)}>
          <div className="mission_date_picker_sheet">
            <DatePicker
              year={calendarYear}
              month={calendarMonth}
              day={Number(selectedDay.label)}
              inline
              flat
              onConfirm={(y, m, d) => {
                setCalendarYear(y)
                setCalendarMonth(m)
                setSelectedDayId(`c-${d}`)
                setIsDatePickerOpen(false)
              }}
              onCancel={() => setIsDatePickerOpen(false)}
            />
          </div>
        </AddSheet>
      )}

      {isPetSwitchOpen && (
        <AddSheet onClose={() => setIsPetSwitchOpen(false)}>
          <div className="mission_pet_switch_sheet">
            <div className="mission_pet_switch_list">
              {petProfiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  className={`mission_pet_switch_option${
                    profile.id === effectiveSelectedPetProfileId ? ' is_selected' : ''
                  }`}
                  onClick={() => selectPetProfile(profile.id)}
                >
                  <img src={profile.image} alt="" aria-hidden="true" />
                  <span className="mission_pet_switch_copy">
                    <strong>{profile.name}</strong>
                    <span className="mission_pet_switch_meta">
                      <span>나이: <b>{profile.birthDate ? getPetAgeLabel(profile.birthDate) : '-'}</b></span>
                      <span className="mission_pet_switch_dot" aria-hidden="true">·</span>
                      <span>몸무게: <b>{profile.weight ? `${profile.weight}kg` : '-'}</b></span>
                      <span className="mission_pet_switch_dot" aria-hidden="true">·</span>
                      <span>성별: <b>{profile.sex || '-'}</b></span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <Button type="button" className="purple_btn mission_pet_switch_close" onClick={() => setIsPetSwitchOpen(false)}>
              닫기
            </Button>
          </div>
        </AddSheet>
      )}

      {isFabOpen && (
        <AddSheet
          onClose={closeMissionSheet}
          isClosing={isFabClosing}
          onScrollCapture={(event) => {
            if (!isPeriodDatePickerOpen) return
            if ((event.target as HTMLElement).closest('.date_picker_column, .mission_period_wheel')) return
            setIsPeriodDatePickerOpen(false)
          }}
          onWheelCapture={(event) => {
            if (!isPeriodDatePickerOpen) return
            if ((event.target as HTMLElement).closest('.date_picker_column, .mission_period_wheel')) return
            setIsPeriodDatePickerOpen(false)
          }}
          onTouchMoveCapture={(event) => {
            if (!isPeriodDatePickerOpen) return
            if ((event.target as HTMLElement).closest('.date_picker_column, .mission_period_wheel')) return
            setIsPeriodDatePickerOpen(false)
          }}
          onMouseDownCapture={(event) => {
            if (!isPeriodDatePickerOpen) return
            if ((event.target as HTMLElement).closest('.date_picker, .mission_period_wheel, .mission_period_row')) return
            setIsPeriodDatePickerOpen(false)
          }}
        >
            {import.meta.env.VITE_ENABLE_PERIOD_PICKER === 'true' && isPeriodPickerOpen ? (
              <div className="mission_period_picker">
                <div className="mission_period_rows">
                  <button
                    type="button"
                    className={`mission_period_row${periodEditingField === 'start' ? ' active' : ''}`}
                    onClick={() => {
                      setPeriodEditingField('start')
                      setIsPeriodDatePickerOpen(true)
                    }}
                  >
                    <span className="mission_period_row_label">시작일</span>
                    <span className="mission_period_row_value">
                      {getPeriodDateLabel(draftPeriodStart)}
                      <ChevronIcon direction="right" size="sm" />
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`mission_period_row${periodEditingField === 'end' ? ' active' : ''}`}
                    onClick={() => {
                      setPeriodEditingField('end')
                      setIsPeriodDatePickerOpen(true)
                    }}
                  >
                    <span className="mission_period_row_label">종료일</span>
                    <span className="mission_period_row_value">
                      {getPeriodDateLabel(draftPeriodEnd)}
                      <ChevronIcon direction="right" size="sm" />
                    </span>
                  </button>
                </div>

                {isPeriodDatePickerOpen && (
                  <div className="mission_period_wheel" aria-label="기간 날짜와 시간 선택">
                    <div className="mission_period_wheel_selector" aria-hidden="true" />
                    <div className="mission_period_wheel_column date">
                      {periodDateOptions.map((option) => {
                        const isSelected =
                          getPeriodOptionKey(option) === getPeriodOptionKey(activeDraftPeriod)

                        return (
                          <button
                            key={getPeriodOptionKey(option)}
                            type="button"
                            className={isSelected ? 'active' : ''}
                            onClick={() => updateDraftPeriod({
                              year: option.year,
                              month: option.month,
                              day: option.day,
                            })}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                    <div className="mission_period_wheel_column period">
                      {periodOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={activeDraftPeriod.period === option.value ? 'active' : ''}
                          onClick={() => updateDraftPeriod({ period: option.value })}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <div className="mission_period_wheel_column">
                      {visiblePeriodHourOptions.map((hour) => (
                        <button
                          key={hour}
                          type="button"
                          className={activeDraftPeriod.hour === hour ? 'active' : ''}
                          onClick={() => updateDraftPeriod({ hour })}
                        >
                          {hour}
                        </button>
                      ))}
                    </div>
                    <div className="mission_period_wheel_column">
                      {visiblePeriodMinuteOptions.map((minute) => (
                        <button
                          key={minute}
                          type="button"
                          className={activeDraftPeriod.minute === minute ? 'active' : ''}
                          onClick={() => updateDraftPeriod({ minute })}
                        >
                          {String(minute).padStart(2, '0')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mission_category_actions mission_period_actions mission_period_new_actions">
                  <button
                    type="button"
                    className="mission_category_prev white_btn"
                    onClick={() => {
                      setDraftAddDate(addDate)
                      setDraftPeriodStart(periodStart)
                      setDraftPeriodEnd(periodEnd)
                      setIsPeriodPickerOpen(false)
                      setIsPeriodDatePickerOpen(false)
                    }}
                  >
                    이전
                  </button>
                  <button
                    type="button"
                    className="mission_category_confirm"
                    onClick={() => {
                      setAddDate({
                        year: draftPeriodStart.year,
                        month: draftPeriodStart.month,
                        day: draftPeriodStart.day,
                      })
                      setDraftAddDate({
                        year: draftPeriodStart.year,
                        month: draftPeriodStart.month,
                        day: draftPeriodStart.day,
                      })
                      setPeriodStart(draftPeriodStart)
                      setPeriodEnd(draftPeriodEnd)
                      setIsPeriodPickerOpen(false)
                      setIsPeriodDatePickerOpen(false)
                    }}
                  >
                    저장하기
                  </button>
                </div>
                <div className="mission_period_tabs" role="tablist" aria-label="기간 선택 방식">
                  <button type="button" className="active">일반</button>
                  <button type="button">기간</button>
                  <button type="button">반복</button>
                </div>
                <div className="mission_period_month">
                  <button
                    type="button"
                    className="mission_month_bar_date mission_period_month_title"
                    onClick={togglePeriodDatePicker}
                  >
                    {draftAddDate.year}.{String(draftAddDate.month).padStart(2, '0')}.{String(draftAddDate.day).padStart(2, '0')}
                    <i className={`bx bx-chevron-${isPeriodDatePickerOpen ? 'up' : 'down'}`} />
                  </button>
                  {isPeriodDatePickerOpen && (
                    <div className="mission_period_date_dropdown">
                      <DatePicker
                        year={draftAddDate.year}
                        month={draftAddDate.month}
                        day={draftAddDate.day}
                        inline
                        flat
                        onConfirm={(year, month, day) => {
                          setDraftAddDate({ year, month, day })
                          setIsPeriodDatePickerOpen(false)
                        }}
                        onCancel={() => setIsPeriodDatePickerOpen(false)}
                      />
                    </div>
                  )}
                </div>
                <div className={isPeriodDatePickerOpen ? 'mission_period_dimmed' : ''}>
                  <button
                    type="button"
                    className="mission_period_dim_close"
                    aria-label="날짜 선택 닫기"
                    onClick={() => setIsPeriodDatePickerOpen(false)}
                  />
                  <div className="mission_period_weekdays" aria-hidden="true">
                    {weekLabels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                  <div className="mission_period_grid">
                    {addCalendarDays.map((day) => {
                      const dateNumber = Number(day.label)
                      const isSelected =
                        day.year === draftAddDate.year &&
                        day.month === draftAddDate.month &&
                        dateNumber === draftAddDate.day

                      return (
                        <button
                          key={`${day.year}-${day.month}-${day.id}`}
                          type="button"
                          className={`mission_period_day${day.muted ? ' muted' : ''}${isSelected ? ' selected' : ''}`}
                          onClick={() => setDraftAddDate({
                            year: day.year,
                            month: day.month,
                            day: dateNumber,
                          })}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                  <div className="mission_category_actions mission_period_actions">
                    <button
                      type="button"
                      className="mission_category_prev white_btn"
                      onClick={() => {
                        setDraftAddDate(addDate)
                        setIsPeriodPickerOpen(false)
                        setIsPeriodDatePickerOpen(false)
                      }}
                    >
                      이전
                    </button>
                    <button
                      type="button"
                      className="mission_category_confirm"
                      onClick={() => {
                        setAddDate(draftAddDate)
                        setIsPeriodPickerOpen(false)
                        setIsPeriodDatePickerOpen(false)
                      }}
                    >
                      확인
                    </button>
                  </div>
                </div>
              </div>
            ) : isCategoryEditOpen ? (
              <div className="mission_category_add">
                <h2>카테고리 수정</h2>
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  placeholder="카테고리를 입력하세요."
                  maxLength={12}
                  disabled={isFixedDraftCategory}
                  autoFocus={!isFixedDraftCategory}
                />
                <div className="mission_category_color_grid">
                  {categoryColorOptions.map((color) => {
                    const isSelected = color === editCategoryColor

                    return (
                      <button
                        key={color}
                        type="button"
                        className={
                          isSelected
                              ? 'mission_category_color selected'
                              : 'mission_category_color'
                        }
                        style={{ backgroundColor: color }}
                        aria-label={`${color} 색상`}
                        onClick={() => setEditCategoryColor(color)}
                      >
                        {isSelected && <i className="bx bx-check" aria-hidden="true" />}
                      </button>
                    )
                  })}
                </div>
                <div className="mission_category_actions">
                  <button
                    type="button"
                    className="mission_category_prev white_btn"
                    onClick={() => {
                      setIsCategoryEditOpen(false)
                      setEditCategoryName('')
                      setEditCategoryColor('')
                    }}
                  >
                    이전
                  </button>
                  <button
                    type="button"
                    className="mission_category_confirm"
                    disabled={!canEditCategory}
                    onClick={saveCategoryEdit}
                  >
                    확인
                  </button>
                </div>
              </div>
            ) : isCategoryAddOpen ? (
              <div className="mission_category_add">
                <h2>카테고리 추가</h2>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="카테고리를 입력하세요."
                  maxLength={12}
                  autoFocus
                />
                <div className="mission_category_color_grid">
                  {categoryColorOptions.map((color) => {
                    const isSelected = color === newCategoryColor

                    return (
                      <button
                        key={color}
                        type="button"
                        className={
                          isSelected
                              ? 'mission_category_color selected'
                              : 'mission_category_color'
                        }
                        style={{ backgroundColor: color }}
                        aria-label={`${color} 색상`}
                        onClick={() => setNewCategoryColor(color)}
                      >
                        {isSelected && <i className="bx bx-check" aria-hidden="true" />}
                      </button>
                    )
                  })}
                </div>
                <div className="mission_category_actions">
                  <button
                    type="button"
                    className="mission_category_prev white_btn"
                    onClick={() => {
                      setIsCategoryAddOpen(false)
                      setNewCategoryName('')
                      setNewCategoryColor('')
                    }}
                  >
                    이전
                  </button>
                  <button
                    type="button"
                    className="mission_category_confirm"
                    disabled={!canAddCategory}
                    onClick={() => {
                      if (!canAddCategory) return
                      const category = {
                        id: `custom-${Date.now()}`,
                        label: newCategoryName.trim(),
                        color: newCategoryColor,
                      }
                      setCategories((prev) => [...prev, category])
                      setSelectedCategoryId(category.id)
                      setDraftCategoryId(category.id)
                      setNewCategoryName('')
                      setNewCategoryColor('')
                      setIsCategoryAddOpen(false)
                      setIsCategoryPickerOpen(false)
                    }}
                  >
                    확인
                  </button>
                </div>
              </div>
            ) : isRepeatPickerOpen ? (
              <div className="mission_repeat_picker">
                <h2>반복 설정</h2>
                <div className="mission_repeat_grid">
                  {repeatOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={
                        option.id === draftRepeat.id
                          ? 'mission_repeat_option active'
                          : 'mission_repeat_option'
                      }
                      onClick={() => setDraftRepeatId(option.id)}
                    >
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mission_category_actions mission_repeat_actions">
                  <button
                    type="button"
                    className="mission_category_prev white_btn"
                    onClick={() => {
                      setDraftRepeatId(selectedRepeatId)
                      setIsRepeatPickerOpen(false)
                    }}
                  >
                    이전
                  </button>
                  <button
                    type="button"
                    className="mission_category_confirm"
                    onClick={() => {
                      setSelectedRepeatId(draftRepeatId)
                      setIsRepeatPickerOpen(false)
                    }}
                  >
                    확인
                  </button>
                </div>
              </div>
            ) : isCategoryPickerOpen ? (
              <div className="mission_category_picker">
                <div className="mission_category_picker_top">
                  <span aria-hidden="true" />
                  <h2>카테고리 선택</h2>
                  <button type="button" onClick={openCategoryEdit}>수정</button>
                </div>
                <div className="mission_category_grid">
                  {orderedCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={
                        category.id === draftCategory.id
                          ? 'mission_category_option active'
                          : 'mission_category_option'
                      }
                      onClick={() => setDraftCategoryId(category.id)}
                    >
                      <span
                        className="mission_category_dot"
                        style={{ backgroundColor: category.color }}
                        aria-hidden="true"
                      />
                      <span>{category.label}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="mission_category_option mission_category_add_tile"
                    onClick={() => {
                      setNewCategoryName('')
                      setNewCategoryColor(firstAvailableCategoryColor)
                      setIsCategoryEditOpen(false)
                      setIsCategoryAddOpen(true)
                    }}
                  >
                    <span className="mission_category_plus" aria-hidden="true">+</span>
                  </button>
                </div>
                <div className="mission_category_actions">
                  <button
                    type="button"
                    className="mission_category_prev white_btn"
                    onClick={() => {
                      setDraftCategoryId(selectedCategoryId)
                      setIsCategoryPickerOpen(false)
                    }}
                  >
                    이전
                  </button>
                  <button
                    type="button"
                    className="mission_category_confirm"
                    onClick={() => {
                      if (draftCategoryId !== selectedCategoryId) {
                        setSelectedQuickMessage('')
                        setAddTitle('')
                      }
                      setSelectedCategoryId(draftCategoryId)
                      if (!isEditingHistory && (draftCategoryId === 'meal' || draftCategoryId === 'walk')) {
                        setFeedAmount(readDefaultRecordAmount(draftCategoryId, historyItems))
                      }
                      setIsCategoryPickerOpen(false)
                    }}
                  >
                    확인
                  </button>
                </div>
              </div>
            ) : (
              <MissionRecordSheet
                addDate={addDate}
                selectedCategory={selectedCategory}
                repeatLabel={selectedRepeat.label}
                periodLabel={getPeriodRangeLabel(draftPeriodStart, draftPeriodEnd)}
                addTitle={addTitle}
                feedAmount={feedAmount}
                canSave={canSaveMission}
                isEditing={isEditingHistory}
                quickMessageOptions={selectedQuickMessageOptions}
                selectedQuickMessage={selectedQuickMessage}
                isPeriodPickerOpen={isPeriodPickerOpen}
                periodPickerContent={(
                  <div className="mission_period_inline">
                    <div className="mission_period_rows">
                      <button
                        type="button"
                        className={`mission_period_row${periodEditingField === 'start' ? ' active' : ''}`}
                        onClick={openStartPeriodPicker}
                      >
                        <span className="mission_period_row_label">시작일</span>
                        <span className="mission_period_row_value">
                          {getPeriodDateLabel(draftPeriodStart)}
                          <ChevronIcon
                            direction="right"
                            size="sm"
                            className={periodEditingField === 'start' && isPeriodDatePickerOpen ? 'mission_period_chevron up' : 'mission_period_chevron'}
                          />
                        </span>
                      </button>
                      {periodEditingField === 'start' && isPeriodDatePickerOpen && renderPeriodWheel()}
                      <button
                        type="button"
                        className={`mission_period_row${periodEditingField === 'end' ? ' active' : ''}`}
                        onClick={() => {
                          setPeriodEditingField('end')
                          setIsPeriodDatePickerOpen(true)
                        }}
                      >
                        <span className="mission_period_row_label">종료일</span>
                        <span className="mission_period_row_value">
                          {getPeriodDateLabel(draftPeriodEnd)}
                          <ChevronIcon
                            direction="right"
                            size="sm"
                            className={periodEditingField === 'end' && isPeriodDatePickerOpen ? 'mission_period_chevron up' : 'mission_period_chevron'}
                          />
                        </span>
                      </button>
                      {periodEditingField === 'end' && isPeriodDatePickerOpen && renderPeriodWheel()}
                    </div>
                  </div>
                )}
                onOpenPeriodPicker={() => {
                  setDraftAddDate(addDate)
                  setPeriodEditingField('start')
                  setIsPeriodDatePickerOpen(true)
                  setIsRepeatPickerOpen(false)
                  setIsPeriodPickerOpen(true)
                }}
                onOpenRepeatPicker={() => {
                  setDraftRepeatId(selectedRepeatId)
                  setIsPeriodPickerOpen(false)
                  setIsPeriodDatePickerOpen(false)
                  setIsCategoryPickerOpen(false)
                  setIsCategoryAddOpen(false)
                  setIsCategoryEditOpen(false)
                  setIsRepeatPickerOpen(true)
                }}
                onOpenCategoryPicker={() => {
                  setDraftCategoryId(selectedCategoryId)
                  setIsRepeatPickerOpen(false)
                  setIsCategoryEditOpen(false)
                  setIsCategoryPickerOpen(true)
                }}
                onQuickMessageSelect={setSelectedQuickMessage}
                onTitleChange={setAddTitle}
                onFeedAmountChange={setFeedAmount}
                onDelete={deleteMission}
                onSave={saveMission}
              />
            )}
        </AddSheet>
      )}

      {import.meta.env.VITE_ENABLE_PERIOD_PICKER === 'true' && isFabOpen && isPeriodPickerOpen && (
        <AddSheet
          onClose={() => {
            setIsPeriodPickerOpen(false)
            setIsPeriodDatePickerOpen(false)
          }}
          onScrollCapture={(event) => {
            if (!isPeriodDatePickerOpen) return
            if ((event.target as HTMLElement).closest('.mission_period_wheel')) return
            setIsPeriodDatePickerOpen(false)
          }}
          onWheelCapture={(event) => {
            if (!isPeriodDatePickerOpen) return
            if ((event.target as HTMLElement).closest('.mission_period_wheel')) return
            setIsPeriodDatePickerOpen(false)
          }}
          onTouchMoveCapture={(event) => {
            if (!isPeriodDatePickerOpen) return
            if ((event.target as HTMLElement).closest('.mission_period_wheel')) return
            setIsPeriodDatePickerOpen(false)
          }}
          onMouseDownCapture={(event) => {
            if (!isPeriodDatePickerOpen) return
            if ((event.target as HTMLElement).closest('.mission_period_wheel, .mission_period_row')) return
            setIsPeriodDatePickerOpen(false)
          }}
        >
          <div className="mission_period_picker">
            <div className="mission_period_rows">
              <button
                type="button"
                className={`mission_period_row${periodEditingField === 'start' ? ' active' : ''}`}
                onClick={() => {
                  setPeriodEditingField('start')
                  setIsPeriodDatePickerOpen(true)
                }}
              >
                <span className="mission_period_row_label">시작일</span>
                <span className="mission_period_row_value">
                  {getPeriodDateLabel(draftPeriodStart)}
                  <ChevronIcon direction="right" size="sm" />
                </span>
              </button>
              <button
                type="button"
                className={`mission_period_row${periodEditingField === 'end' ? ' active' : ''}`}
                onClick={() => {
                  setPeriodEditingField('end')
                  setIsPeriodDatePickerOpen(true)
                }}
              >
                <span className="mission_period_row_label">종료일</span>
                <span className="mission_period_row_value">
                  {getPeriodDateLabel(draftPeriodEnd)}
                  <ChevronIcon direction="right" size="sm" />
                </span>
              </button>
            </div>

            {isPeriodDatePickerOpen && (
              <div className="mission_period_wheel" aria-label="기간 날짜와 시간 선택">
                <div className="mission_period_wheel_selector" aria-hidden="true" />
                <div className="mission_period_wheel_column date">
                  {periodDateOptions.map((option) => {
                    const isSelected =
                      getPeriodOptionKey(option) === getPeriodOptionKey(activeDraftPeriod)

                    return (
                      <button
                        key={getPeriodOptionKey(option)}
                        type="button"
                        className={isSelected ? 'active' : ''}
                        onClick={() => updateDraftPeriod({
                          year: option.year,
                          month: option.month,
                          day: option.day,
                        })}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
                <div className="mission_period_wheel_column period">
                  {periodOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={activeDraftPeriod.period === option.value ? 'active' : ''}
                      onClick={() => updateDraftPeriod({ period: option.value })}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="mission_period_wheel_column">
                  {visiblePeriodHourOptions.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      className={activeDraftPeriod.hour === hour ? 'active' : ''}
                      onClick={() => updateDraftPeriod({ hour })}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
                <div className="mission_period_wheel_column">
                  {visiblePeriodMinuteOptions.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      className={activeDraftPeriod.minute === minute ? 'active' : ''}
                      onClick={() => updateDraftPeriod({ minute })}
                    >
                      {String(minute).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mission_category_actions mission_period_actions mission_period_new_actions">
              <button
                type="button"
                className="mission_category_prev white_btn"
                onClick={() => {
                  setDraftAddDate(addDate)
                  setDraftPeriodStart(periodStart)
                  setDraftPeriodEnd(periodEnd)
                  setIsPeriodPickerOpen(false)
                  setIsPeriodDatePickerOpen(false)
                }}
              >
                이전
              </button>
              <button
                type="button"
                className="mission_category_confirm"
                onClick={() => {
                  setAddDate({
                    year: draftPeriodStart.year,
                    month: draftPeriodStart.month,
                    day: draftPeriodStart.day,
                  })
                  setDraftAddDate({
                    year: draftPeriodStart.year,
                    month: draftPeriodStart.month,
                    day: draftPeriodStart.day,
                  })
                  setPeriodStart(draftPeriodStart)
                  setPeriodEnd(draftPeriodEnd)
                  setIsPeriodPickerOpen(false)
                  setIsPeriodDatePickerOpen(false)
                }}
              >
                저장하기
              </button>
            </div>
          </div>
        </AddSheet>
      )}

    </>
  )
}

export default Mission
