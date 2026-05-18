import { useEffect, useRef, useState, type UIEvent } from 'react'
import { useNavigate } from 'react-router'
import { ChevronRight, Dog } from 'lucide-react'
import '../Mission.css'
import './Health.css'
import galleryIcon from '../../img/gallery-icon.svg'
import cameraFlipIcon from '../../img/camera-flip-icon.svg'
import AddSheet from '../../components/AddSheet'
import HealthCameraTutorial, {
  cameraTutorialStepOrder,
  cameraTutorialStepDurations,
} from './HealthCameraTutorial'
import ChevronIcon from '../../components/ChevronIcon'
import BackButton from '../../components/html/BackButton'
import MissionRecordSheet from '../../components/MissionRecordSheet'
import StateBar from '../../components/StateBar'
import StatusMessageBar from '../../components/StatusMessageBar'
import {
  readPetProfiles,
  readSelectedPetProfileId,
  readSelectedPetProfileName,
  writeSelectedPetProfileId,
  PET_PROFILES_CHANGE_EVENT,
  type PetProfileSummary,
} from '../../utils/petProfiles'
import {
  readMissionHistoryRecordsWithDefaults,
  writeStoredMissionHistoryRecords,
  MISSION_HISTORY_RECORDS_CHANGE_EVENT,
  type MissionHistoryRecord,
} from '../../utils/missionHistoryRecords'
import { showStateBarMessage } from '../../utils/stateBarMessage'
import { addUserNotification } from '../../utils/userNotifications'

const today = new Date()

type CategoryOption = {
  id: string
  label: string
  color: string
}

type RepeatOption = {
  id: string
  label: string
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

const categoryOptions: CategoryOption[] = [
  { id: 'meal', label: '식사 기록', color: '#ffd1a8' },
  { id: 'poop', label: '배변 기록', color: '#527ca3' },
  { id: 'activity', label: '활동 기록', color: '#428fe6' },
  { id: 'symptom', label: '증상', color: '#b9dfe3' },
]

const quickMessages = [
  '사료 30g',
  '사료 60g',
  '사료 90g',
  '사료 120g',
  '사료 150g',
]

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

const categoryDisplayOptions: CategoryOption[] = [
  { id: 'meal', label: '식사 기록', color: '#F2B472' },
  { id: 'poop', label: '배변·배뇨 기록', color: '#BEE3F8' },
  { id: 'activity', label: '활동 기록', color: '#162447' },
  { id: 'symptom', label: '증상 기록', color: '#A28BFA' },
  { id: 'walk', label: '산책 기록', color: '#A4CE95' },
]

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

const categoryQuickMessageOptions: Record<string, string[]> = {
  meal: ['사료 30g', '사료 60g', '사료 90g', '사료 120g', '사료 150g'],
  activity: ['활발함', '보통', '활동 적음', '무기력', '평소와 다름', '기타'],
  poop: ['정상 변', '묽은 변', '딱딱한 변', '배변 못함', '소변 적음', '소변 많음', '평소와 다름', '기타'],
  symptom: ['기침', '재채기', '구토', '설사', '떨림', '무기력', '가려움', '기타'],
  walk: [],
}

const HEALTH_CAMERA_CALENDAR_RECORD_COLOR = '#A08DFF'

const periodWeekLabels = ['일', '월', '화', '수', '목', '금', '토']
const periodOptions: Array<{ value: PeriodDateTime['period']; label: string }> = [
  { value: 'AM', label: '오전' },
  { value: 'PM', label: '오후' },
]
const periodHourOptions = Array.from({ length: 12 }, (_, index) => index + 1)
const periodMinuteOptions = Array.from({ length: 60 }, (_, index) => index)
const periodWheelLoops = [0, 1, 2]
const periodWheelItemHeight = 44

function getDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function createRepeatDateKeysFromPeriod(
  repeatId: string,
  start: Pick<PeriodDateTime, 'year' | 'month' | 'day'>,
  end?: Pick<PeriodDateTime, 'year' | 'month' | 'day'>,
) {
  const startDate = new Date(start.year, start.month - 1, start.day)
  const selectedEndDate = end
    ? new Date(end.year, end.month - 1, end.day)
    : new Date(start.year, start.month, 0)
  const endDate = selectedEndDate < startDate ? startDate : selectedEndDate
  const keys: string[] = []

  for (
    const currentDate = new Date(startDate);
    currentDate <= endDate;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    const dayOfWeek = currentDate.getDay()
    const shouldInclude =
      repeatId === 'daily' ||
      (repeatId === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) ||
      (repeatId === 'weekly' && dayOfWeek === startDate.getDay()) ||
      (repeatId === 'none' && currentDate.getTime() === startDate.getTime())

    if (shouldInclude) {
      keys.push(getDateKey(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()))
    }
  }

  return keys.length > 0 ? keys : [getDateKey(start.year, start.month, start.day)]
}

function getRepeatEndPeriod(
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

function addHoursToPeriodDateTime(dateTime: PeriodDateTime, hours: number) {
  const date = new Date(
    dateTime.year,
    dateTime.month - 1,
    dateTime.day,
    getHour24(dateTime),
    dateTime.minute,
  )
  date.setHours(date.getHours() + hours)

  return createPeriodDateTime(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  )
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

function createPeriodDateOptions(centerDateTime: PeriodDateTime) {
  const centerDate = new Date(centerDateTime.year, centerDateTime.month - 1, centerDateTime.day)

  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(centerDate)
    date.setDate(centerDate.getDate() - 2 + index)

    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      label: `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${periodWeekLabels[date.getDay()]}`,
    }
  })
}

function getPetAge(birthDate: string): string {
  const parts = birthDate.split('.')
  if (parts.length < 3) return ''
  const birth = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  if (
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  ) {
    age--
  }
  return age <= 0 ? '1살 미만' : `${age}살`
}

function Health() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingChunksRef = useRef<Blob[]>([])
  const periodWheelScrollFrames = useRef<Record<string, number | undefined>>({})
  const [isRecording, setIsRecording] = useState(false)
  const [capturedVideo, setCapturedVideo] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [isCameraAvailable, setIsCameraAvailable] = useState(true)
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo')
  const [activeTab, setActiveTab] = useState<'camera' | 'memo'>('camera')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraTutorialStepIndex, setCameraTutorialStepIndex] = useState<number | null>(0)
  const [showPetModal, setShowPetModal] = useState(false)
  const [showCalendarPetSwitch, setShowCalendarPetSwitch] = useState(false)
  const [pets, setPets] = useState<PetProfileSummary[]>(readPetProfiles)
  const [selectedPetId, setSelectedPetId] = useState<number | null>(() => readSelectedPetProfileId())
  const [hasExplicitPetSelection, setHasExplicitPetSelection] = useState(false)

  // 메모 바텀시트 state
  const [showMemoSheet, setShowMemoSheet] = useState(false)
  const [showCalendarMemoSheet, setShowCalendarMemoSheet] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryOptions[0].id)
  const [draftCategoryId, setDraftCategoryId] = useState(categoryOptions[0].id)
  const [selectedRepeatId, setSelectedRepeatId] = useState(repeatOptions[0].id)
  const [draftRepeatId, setDraftRepeatId] = useState(repeatOptions[0].id)
  const [recordDate, setRecordDate] = useState(today)
  const [isPeriodPickerOpen, setIsPeriodPickerOpen] = useState(false)
  const [isRepeatPickerOpen, setIsRepeatPickerOpen] = useState(false)
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false)
  const [isCategoryEditOpen, setIsCategoryEditOpen] = useState(false)
  const [isCategoryAddOpen, setIsCategoryAddOpen] = useState(false)
  const [editCategoryName, setEditCategoryName] = useState('')
  const [editCategoryColor, setEditCategoryColor] = useState(categoryDisplayOptions[0].color)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(categoryDisplayOptions[0].color)
  const [customCategories, setCustomCategories] = useState<CategoryOption[]>(categoryDisplayOptions)
  const [periodStart, setPeriodStart] = useState(() =>
    createPeriodDateTime(today.getFullYear(), today.getMonth() + 1, today.getDate(), new Date().getHours(), new Date().getMinutes())
  )
  const [periodEnd, setPeriodEnd] = useState(() =>
    addHoursToPeriodDateTime(
      createPeriodDateTime(today.getFullYear(), today.getMonth() + 1, today.getDate(), new Date().getHours(), new Date().getMinutes()),
      1,
    )
  )
  const [draftPeriodStart, setDraftPeriodStart] = useState(periodStart)
  const [draftPeriodEnd, setDraftPeriodEnd] = useState(periodEnd)
  const [periodEditingField, setPeriodEditingField] = useState<PeriodField>('start')
  const [memoText, setMemoText] = useState('')
  const [selectedAmount, setSelectedAmount] = useState('')
  const [feedAmount, setFeedAmount] = useState(30)

  useEffect(() => {
    const sync = () => {
      setPets(readPetProfiles())
    }
    window.addEventListener(PET_PROFILES_CHANGE_EVENT, sync)
    return () => window.removeEventListener(PET_PROFILES_CHANGE_EVENT, sync)
  }, [])

  useEffect(() => {
    let stream: MediaStream

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode } })
      .then((s) => {
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          videoRef.current.play()
        }
        setIsCameraAvailable(true)
      })
      .catch((err) => {
        console.error('카메라 접근 실패:', err)
        setIsCameraAvailable(false)
      })

    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [facingMode])

  const handleFlip = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  const handleCapture = () => {
    const selectedProfileImage = selectedPetImage || pets[0]?.image || null

    if (!isMobile) {
      if (selectedProfileImage) setCapturedImage(selectedProfileImage)
      return
    }

    if (cameraMode === 'photo') {
      const video = videoRef.current
      if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('비디오 스트림 준비 안됨')
        if (selectedProfileImage) setCapturedImage(selectedProfileImage)
        return
      }
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')!.drawImage(video, 0, 0)
      setCapturedImage(canvas.toDataURL('image/jpeg'))
      video.pause()
      return
    }

    // VIDEO 모드
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      return
    }

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream)
        mediaRecorderRef.current = recorder
        recordingChunksRef.current = []

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordingChunksRef.current.push(e.data)
        }

        recorder.onstop = () => {
          const blob = new Blob(recordingChunksRef.current, { type: 'video/webm' })
          setCapturedVideo(URL.createObjectURL(blob))
          stream.getTracks().forEach((t) => t.stop())
          setIsRecording(false)
        }

        recorder.start()
        setIsRecording(true)
      })
      .catch((err) => {
        console.error('카메라/마이크 접근 실패:', err)
        alert('카메라 또는 마이크 권한이 필요합니다.')
      })
  }

  const handleGalleryClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCapturedImage(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handleRetake = () => {
    if (capturedImage?.startsWith('blob:')) URL.revokeObjectURL(capturedImage)
    if (capturedVideo) URL.revokeObjectURL(capturedVideo)
    setCapturedImage(null)
    setCapturedVideo(null)
    videoRef.current?.play()
  }

  const saveCapturedMediaToCalendar = () => {
    const mediaSrc = capturedVideo || capturedImage
    const mediaType = capturedVideo ? 'video' : capturedImage ? 'image' : null

    if (!mediaSrc || !mediaType) {
      return false
    }

    const now = new Date()
    const nextRecord: MissionHistoryRecord = {
      id: Date.now(),
      title: mediaType === 'video' ? '동영상 기록' : '사진 기록',
      detail: mediaType === 'video' ? '건강 체크용 동영상을 업로드했어요.' : '건강 체크용 사진을 업로드했어요.',
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      color: HEALTH_CAMERA_CALENDAR_RECORD_COLOR,
      date: getDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate()),
      media: [
        {
          type: mediaType,
          src: mediaSrc,
          label: mediaType === 'video' ? '건강 체크 동영상' : '건강 체크 사진',
        },
      ],
    }

    writeStoredMissionHistoryRecords([nextRecord, ...readMissionHistoryRecordsWithDefaults()])
    window.dispatchEvent(new CustomEvent(MISSION_HISTORY_RECORDS_CHANGE_EVENT, { detail: nextRecord }))

    return true
  }

  const handleUpload = () => {
    saveCapturedMediaToCalendar()
    navigate('/health/check')
  }

  const handleSelectPet = (pet: PetProfileSummary) => {
    const shouldShowChangeToast = pet.id !== selectedPetId
    writeSelectedPetProfileId(pet.id)
    setSelectedPetId(pet.id)
    setHasExplicitPetSelection(true)
    setShowPetModal(false)
    setShowCalendarPetSwitch(false)
    if (shouldShowChangeToast) {
      showStateBarMessage(`${pet.name} 반려동물로 대상을 변경했어요`, 3000, { placement: 'footer' })
    }
  }

  // 메모 저장 로직
  const selectedCategory = customCategories.find((c) => c.id === selectedCategoryId) ?? customCategories[0]
  const draftCategory = customCategories.find((c) => c.id === draftCategoryId) ?? selectedCategory
  const selectedRepeat = repeatOptions.find((option) => option.id === selectedRepeatId) ?? repeatOptions[0]
  const draftRepeat = repeatOptions.find((option) => option.id === draftRepeatId) ?? selectedRepeat
  const selectedQuickMessageOptions = categoryQuickMessageOptions[selectedCategory.id] ?? []
  const isActive = selectedCategory.id === 'meal' || selectedCategory.id === 'walk' || memoText.trim() !== '' || selectedAmount !== ''
  const firstAvailableCategoryColor =
    categoryColorOptions.find((color) => !customCategories.some((category) => category.color === color)) ??
    categoryColorOptions[0]
  const canAddCategory = newCategoryName.trim().length > 0 && newCategoryColor !== ''
  const canEditCategory = editCategoryName.trim().length > 0 && editCategoryColor !== ''
  const activeDraftPeriod = periodEditingField === 'start' ? draftPeriodStart : draftPeriodEnd
  const periodDateOptions = createPeriodDateOptions(activeDraftPeriod)

  useEffect(() => {
    if (!isPeriodPickerOpen || typeof window === 'undefined') return undefined

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
    activeDraftPeriod.day,
    activeDraftPeriod.hour,
    activeDraftPeriod.minute,
    activeDraftPeriod.month,
    activeDraftPeriod.period,
    activeDraftPeriod.year,
    isPeriodPickerOpen,
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

  const renderPeriodWheel = () => (
    <div className="mission_period_wheel" aria-label="기간 날짜와 시간 선택">
      <div className="mission_period_wheel_selector" aria-hidden="true" />
      <div
        className="mission_period_wheel_column date"
        onScroll={(event) => handlePeriodWheelScroll(event, 'date')}
      >
        {periodDateOptions.map((option) => {
          const isSelected =
            option.year === activeDraftPeriod.year &&
            option.month === activeDraftPeriod.month &&
            option.day === activeDraftPeriod.day

          return (
            <button
              key={getDateKey(option.year, option.month, option.day)}
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
          periodHourOptions.map((hour) => (
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
          periodMinuteOptions.map((minute) => (
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

  const periodPickerContent = (
    <div className="mission_period_inline">
      <div className="mission_period_rows">
        <button
          type="button"
          className={`mission_period_row${periodEditingField === 'start' ? ' active' : ''}`}
          onClick={() => {
            setPeriodEditingField('start')
            setIsPeriodPickerOpen(true)
          }}
        >
          <span className="mission_period_row_label">시작일</span>
          <span className="mission_period_row_value">
            {getPeriodDateLabel(draftPeriodStart)}
            <ChevronIcon direction="right" size="sm" />
          </span>
        </button>
        {periodEditingField === 'start' && isPeriodPickerOpen && renderPeriodWheel()}

        <button
          type="button"
          className={`mission_period_row${periodEditingField === 'end' ? ' active' : ''}`}
          onClick={() => {
            setPeriodEditingField('end')
            setIsPeriodPickerOpen(true)
          }}
        >
          <span className="mission_period_row_label">종료일</span>
          <span className="mission_period_row_value">
            {getPeriodDateLabel(draftPeriodEnd)}
            <ChevronIcon direction="right" size="sm" />
          </span>
        </button>
        {periodEditingField === 'end' && isPeriodPickerOpen && renderPeriodWheel()}
      </div>
    </div>
  )

  const handleCalendarMemoSave = () => {
    const primaryDetail = selectedCategory.id === 'meal' && feedAmount > 0
      ? `사료 ${feedAmount}g`
      : selectedAmount
    const detail = [primaryDetail, memoText.trim()].filter(Boolean).join('\n').trim()
    if (!detail) return false

    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const recordTitle = selectedCategory.id === 'symptom' ? '증상 기록' : selectedCategory.label
    const baseId = Date.now()
    const effectiveStart = draftPeriodStart
    const effectiveEnd = draftPeriodEnd
    const records: MissionHistoryRecord[] = createRepeatDateKeysFromPeriod(
      selectedRepeatId,
      effectiveStart,
      getRepeatEndPeriod(selectedRepeatId, effectiveStart, effectiveEnd),
    ).map((date, index) => ({
      id: baseId + index,
      title: recordTitle,
      detail,
      time: getPeriodTimeLabel(effectiveStart) || time,
      color: selectedCategory.color,
      date,
    }))

    writeStoredMissionHistoryRecords([...records].reverse().concat(readMissionHistoryRecordsWithDefaults()))
    window.dispatchEvent(new CustomEvent(MISSION_HISTORY_RECORDS_CHANGE_EVENT, { detail: records[0] }))
    setMemoText('')
    setSelectedAmount('')
    setFeedAmount(30)
    setSelectedRepeatId(repeatOptions[0].id)
    setDraftRepeatId(repeatOptions[0].id)
    setPeriodStart(effectiveStart)
    setPeriodEnd(effectiveEnd)
    setRecordDate(new Date(effectiveStart.year, effectiveStart.month - 1, effectiveStart.day))
    return true
  }

  const handleMemoSaveOnly = () => {
    if (!handleCalendarMemoSave()) return
    showStateBarMessage('우리 아이의 기록이 저장되었어요.')
    addUserNotification({
      title: '건강 히스토리',
      content: `${readSelectedPetProfileName()}의 기록이 저장되었어요.`,
      path: '/mission',
    })
    setShowMemoSheet(false)
    setShowCalendarMemoSheet(false)
    setIsPeriodPickerOpen(false)
    setIsRepeatPickerOpen(false)
    setIsCategoryPickerOpen(false)
    setIsCategoryEditOpen(false)
    setIsCategoryAddOpen(false)
  }

  const handleMemoUpload = () => {
    if (!handleCalendarMemoSave()) return
    setShowMemoSheet(false)
    setShowCalendarMemoSheet(false)
    setIsPeriodPickerOpen(false)
    setIsRepeatPickerOpen(false)
    setIsCategoryPickerOpen(false)
    setIsCategoryEditOpen(false)
    setIsCategoryAddOpen(false)
    navigate('/health/check')
  }

  const handleCategoryClick = () => {
    const idx = categoryOptions.findIndex((c) => c.id === selectedCategoryId)
    setSelectedCategoryId(categoryOptions[(idx + 1) % categoryOptions.length].id)
  }

  const effectiveSelectedPetId = selectedPetId ?? pets[0]?.id ?? null
  const selectedPetProfile = pets.find((pet) => pet.id === effectiveSelectedPetId) ?? pets[0] ?? null
  const selectedPetName = selectedPetProfile?.name ?? ''
  const selectedPetImage = selectedPetProfile?.image ?? ''
  const activeCameraTutorialStep =
    cameraTutorialStepIndex !== null ? cameraTutorialStepOrder[cameraTutorialStepIndex] ?? null : null
  const isCameraTutorialCameraTabActive =
    activeCameraTutorialStep === 'video' || activeCameraTutorialStep === 'photo' || activeCameraTutorialStep === 'close'
  const isCameraTutorialRecordTabActive = activeCameraTutorialStep === 'record'
  const isCameraTutorialVisible =
    activeCameraTutorialStep !== null &&
    !capturedImage &&
    !capturedVideo &&
    activeTab === 'camera' &&
    !showPetModal &&
    !showCalendarPetSwitch &&
    !showMemoSheet &&
    !showCalendarMemoSheet

  useEffect(() => {
    if (!isCameraTutorialVisible || cameraTutorialStepIndex === null) return
    if (cameraTutorialStepOrder[cameraTutorialStepIndex] === 'close') return

    const timeoutId = window.setTimeout(() => {
      setCameraTutorialStepIndex((currentStep) => {
        if (currentStep === null) return null
        return currentStep < cameraTutorialStepOrder.length - 1 ? currentStep + 1 : currentStep
      })
    }, cameraTutorialStepDurations[cameraTutorialStepIndex] ?? 2200)

    return () => window.clearTimeout(timeoutId)
  }, [cameraTutorialStepIndex, isCameraTutorialVisible])

  useEffect(() => {
    if (
      capturedImage ||
      capturedVideo ||
      activeTab !== 'camera' ||
      showPetModal ||
      showCalendarPetSwitch ||
      showMemoSheet ||
      showCalendarMemoSheet
    ) {
      setCameraTutorialStepIndex(null)
    }
  }, [activeTab, capturedImage, capturedVideo, showCalendarMemoSheet, showCalendarPetSwitch, showMemoSheet, showPetModal])

  const advanceCameraTutorial = () => {
    setCameraTutorialStepIndex((currentStep) => {
      if (currentStep === null) return null
      return currentStep < cameraTutorialStepOrder.length - 1 ? currentStep + 1 : currentStep
    })
  }

  return (
    <main className={`health_cam_ui${isCameraTutorialVisible ? ' is_tutorial_active' : ''}`}>
      <StateBar />
      <StatusMessageBar />
      <section className="health_cam_view" aria-label="카메라 뷰">
        {capturedVideo ? (
          <video className="health_cam_img" src={capturedVideo} controls playsInline />
        ) : capturedImage ? (
          <img className="health_cam_img" src={capturedImage} alt="촬영된 사진" />
        ) : isCameraAvailable ? (
          <video ref={videoRef} className="health_cam_video" autoPlay muted playsInline />
        ) : (
          <div className="health_cam_img health_cam_img_fallback" aria-hidden="true" />
        )}
        <div className="health_cam_overlay" aria-hidden="true" />
        <BackButton
          bgColor="#505050"
          iconColor="#fff"
          size={36}
          className={`health_cam_close_btn${activeCameraTutorialStep === 'close' ? ' is_tutorial_target' : ''}`}
          onClick={isCameraTutorialVisible ? () => setCameraTutorialStepIndex(null) : undefined}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          }
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2,
            borderRadius: '50%',
            padding: 0,
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="닫기"
        />
      </section>

      <div className="health_cam_ctrl">
        <button
          type="button"
          className={`health_cam_pet_link${hasExplicitPetSelection ? ' has_selected_pet' : ''}`}
          onClick={() => setShowCalendarPetSwitch(true)}
        >
          <span className="health_cam_pet_default_label">반려동물 선택하기</span>
          {selectedPetName ? (
            <span>
              현재 반려동물 · <span className="health_cam_pet_name">{selectedPetName}</span>
            </span>
          ) : (
            <>
            <span>반려동물 선택하기</span>
            <span>반려동물 변경하기</span>
            </>
          )}
          <ChevronRight size={16} color="#505050" aria-hidden="true" />
        </button>

        <div className="health_cam_zoom" aria-hidden="true">
          <button type="button" className="health_cam_zoom_btn is_disabled" disabled tabIndex={-1}>.5</button>
          <button
            type="button"
            className="health_cam_zoom_btn health_cam_zoom_lg is_disabled"
            disabled
            tabIndex={-1}
          >
            <span>1</span><span>x</span>
          </button>
          <button type="button" className="health_cam_zoom_btn is_disabled" disabled tabIndex={-1}>3</button>
        </div>

        <div className="health_cam_modes" role="tablist" aria-label="촬영 모드">
          <button
            type="button"
            className={`health_cam_mode${cameraMode === 'video' ? ' is_active' : ''}${activeCameraTutorialStep === 'video' ? ' is_tutorial_target is_tutorial_label' : ''}`}
            onClick={() => setCameraMode('video')}
          >
            VIDEO
          </button>
          <button
            type="button"
            className={`health_cam_mode${cameraMode === 'photo' ? ' is_active' : ''}${activeCameraTutorialStep === 'photo' ? ' is_tutorial_target is_tutorial_label' : ''}`}
            onClick={() => setCameraMode('photo')}
          >
            PHOTO
          </button>
        </div>

        <div className="health_cam_shutter_row">
          <button type="button" className="health_cam_side" aria-label="갤러리" onClick={handleGalleryClick}>
            <img src={galleryIcon} width={24} height={24} aria-hidden="true" alt="" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button type="button" className="health_cam_shutter" aria-label="촬영" onClick={handleCapture}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid black', padding: 3, backgroundColor: 'white' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'black' }} />
            </div>
          </button>
          <button type="button" className="health_cam_side" aria-label="카메라 전환" onClick={handleFlip}>
            <img src={cameraFlipIcon} width={24} height={24} aria-hidden="true" alt="" />
          </button>
        </div>
      </div>

      {(capturedImage || capturedVideo) ? (
        <div className="health_cam_result_ctrl">
          <button type="button" className="health_cam_retake" onClick={handleRetake}>
            재촬영 하기
          </button>
          <button type="button" className="health_cam_upload" onClick={handleUpload}>
           건강 리포트 받기
          </button>
        </div>
      ) : (
        <div className={`health_cam_tabs_wrapper${activeCameraTutorialStep === 'close' ? ' is_hidden' : ''}`}>
          <div className="health_cam_tabs" role="tablist" aria-label="건강 체크 탭">
            <button
              type="button"
              className={`health_cam_tab${activeTab === 'camera' ? ' is_active' : ''}`}
              onClick={() => setActiveTab('camera')}
            >
              카메라
            </button>
            <button
              type="button"
              className={`health_cam_tab${activeTab === 'memo' ? ' is_active' : ''}`}
              onClick={() => { setActiveTab('memo'); setShowCalendarMemoSheet(true) }}
            >
              기록
            </button>
          </div>
        </div>
      )}

      {isCameraTutorialVisible ? (
        <HealthCameraTutorial
          step={activeCameraTutorialStep}
          isCameraTabActive={isCameraTutorialCameraTabActive}
          isRecordTabActive={isCameraTutorialRecordTabActive}
          onAdvance={advanceCameraTutorial}
        />
      ) : null}

      <div style={{ backgroundColor: 'white', height: '34px', position: 'relative', width: '100%' }} aria-hidden="true">
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'black',
          height: '5px',
          width: '134px',
          borderRadius: '100px',
        }} />
      </div>

      {/* 반려동물 변경 모달 */}
      {showCalendarPetSwitch && (
        <AddSheet onClose={() => setShowCalendarPetSwitch(false)}>
          <div className="mission_pet_switch_sheet">
            <div className="mission_pet_switch_list">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  type="button"
                  className={`mission_pet_switch_option${hasExplicitPetSelection && pet.id === selectedPetId ? ' is_selected' : ''}`}
                  onClick={() => handleSelectPet(pet)}
                >
                  {pet.image ? (
                    <img src={pet.image} alt="" aria-hidden="true" />
                  ) : (
                    <span className="mission_pet_switch_avatar_fallback" aria-hidden="true">
                      <Dog size={24} color="#505050" />
                    </span>
                  )}
                  <span className="mission_pet_switch_copy">
                    <strong>{pet.name}</strong>
                    <span className="mission_pet_switch_meta">
                      <span>나이: <b>{getPetAge(pet.birthDate)}</b></span>
                      <span className="mission_pet_switch_dot" aria-hidden="true">·</span>
                      <span>몸무게: <b>{pet.weight ? `${pet.weight}kg` : '-'}</b></span>
                      <span className="mission_pet_switch_dot" aria-hidden="true">·</span>
                      <span>성별: <b>{pet.sex || '-'}</b></span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="purple_btn mission_pet_switch_close"
              onClick={() => setShowCalendarPetSwitch(false)}
            >
              닫기
            </button>
          </div>
        </AddSheet>
      )}

      {showPetModal && (
        <div className="health_pet_modal">
          <div
            className="health_pet_modal_overlay"
            onClick={() => setShowPetModal(false)}
            aria-hidden="true"
          />
          <div className="health_pet_modal_sheet" role="dialog" aria-label="반려동물 선택">
            <div className="health_pet_modal_handle" aria-hidden="true" />
            <ul className="health_pet_modal_list">
              {pets.map((pet) => {
                const age = getPetAge(pet.birthDate)
                const sexLabel = pet.sex === '남' ? '남아' : pet.sex === '여' ? '여아' : pet.sex
                const isSelected = pet.id === effectiveSelectedPetId
                return (
                  <li key={pet.id}>
                    <button
                      type="button"
                      className={`health_pet_modal_item${isSelected ? ' is_selected' : ''}`}
                      onClick={() => handleSelectPet(pet)}
                    >
                      <div className="health_pet_modal_avatar">
                        {pet.image ? (
                          <img src={pet.image} alt={pet.name} />
                        ) : (
                          <Dog size={24} color="#505050" />
                        )}
                      </div>
                      <div className="health_pet_modal_info">
                        <span className="health_pet_modal_name">{pet.name}</span>
                        <div className="health_pet_modal_detail">
                          <span className="health_pet_modal_detail_label">나이: </span>
                          <span className="health_pet_modal_detail_value">{age}</span>
                          <div className="health_pet_modal_dot" aria-hidden="true" />
                          <span className="health_pet_modal_detail_label">몸무게: </span>
                          <span className="health_pet_modal_detail_value">{pet.weight}kg</span>
                          <div className="health_pet_modal_dot" aria-hidden="true" />
                          <span className="health_pet_modal_detail_label">성별: </span>
                          <span className="health_pet_modal_detail_value">{sexLabel}</span>
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
            <button
              type="button"
              className="health_pet_modal_close_btn"
              onClick={() => setShowPetModal(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 메모 바텀시트 */}
      {showCalendarMemoSheet && (
        <AddSheet
          onClose={() => {
            setShowCalendarMemoSheet(false)
            setIsPeriodPickerOpen(false)
            setIsRepeatPickerOpen(false)
            setIsCategoryPickerOpen(false)
            setIsCategoryEditOpen(false)
            setIsCategoryAddOpen(false)
          }}
        >
          {isRepeatPickerOpen ? (
            <div className="mission_repeat_picker">
              <h2>반복 설정</h2>
              <div className="mission_repeat_grid">
                {repeatOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={option.id === draftRepeat.id ? 'mission_repeat_option active' : 'mission_repeat_option'}
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
          ) : isCategoryEditOpen ? (
            <div className="mission_category_add">
              <h2>카테고리 수정</h2>
              <input
                type="text"
                value={editCategoryName}
                onChange={(event) => setEditCategoryName(event.target.value)}
                placeholder="카테고리를 입력하세요."
                maxLength={12}
                autoFocus
              />
              <div className="mission_category_color_grid">
                {categoryColorOptions.map((color) => {
                  const isSelected = color === editCategoryColor

                  return (
                    <button
                      key={color}
                      type="button"
                      className={isSelected ? 'mission_category_color selected' : 'mission_category_color'}
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
                  onClick={() => {
                    if (!canEditCategory) return
                    setCustomCategories((current) =>
                      current.map((category) =>
                        category.id === draftCategoryId
                          ? { ...category, label: editCategoryName.trim(), color: editCategoryColor }
                          : category,
                      ),
                    )
                    setIsCategoryEditOpen(false)
                    setEditCategoryName('')
                    setEditCategoryColor('')
                  }}
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
                onChange={(event) => setNewCategoryName(event.target.value)}
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
                      className={isSelected ? 'mission_category_color selected' : 'mission_category_color'}
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
                    setCustomCategories((current) => [...current, category])
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
          ) : isCategoryPickerOpen ? (
            <div className="mission_category_picker">
              <div className="mission_category_picker_top">
                <span aria-hidden="true" />
                <h2>카테고리 선택</h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditCategoryName(draftCategory.label)
                    setEditCategoryColor(draftCategory.color)
                    setIsCategoryEditOpen(true)
                  }}
                >
                  수정
                </button>
              </div>
              <div className="mission_category_grid">
                {customCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={category.id === draftCategory.id ? 'mission_category_option active' : 'mission_category_option'}
                    onClick={() => setDraftCategoryId(category.id)}
                  >
                    <span className="mission_category_dot" style={{ backgroundColor: category.color }} aria-hidden="true" />
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
                      setSelectedAmount('')
                      setMemoText('')
                    }
                    setSelectedCategoryId(draftCategoryId)
                    setIsCategoryPickerOpen(false)
                  }}
                >
                  확인
                </button>
              </div>
            </div>
          ) : (
            <MissionRecordSheet
              addDate={{ month: recordDate.getMonth() + 1, day: recordDate.getDate() }}
              selectedCategory={selectedCategory}
              repeatLabel={selectedRepeat.label}
              periodLabel={getPeriodRangeLabel(draftPeriodStart, draftPeriodEnd)}
              addTitle={memoText}
              feedAmount={feedAmount}
              canSave={isActive}
              isEditing={false}
              quickMessageOptions={selectedQuickMessageOptions}
              selectedQuickMessage={selectedAmount}
              isPeriodPickerOpen={isPeriodPickerOpen}
              periodPickerContent={periodPickerContent}
              onOpenPeriodPicker={() => {
                setPeriodEditingField('start')
                setIsPeriodPickerOpen(true)
              }}
              onOpenRepeatPicker={() => {
                setIsPeriodPickerOpen(false)
                setDraftRepeatId(selectedRepeatId)
                setIsRepeatPickerOpen(true)
              }}
              onOpenCategoryPicker={() => {
                setIsPeriodPickerOpen(false)
                setDraftCategoryId(selectedCategoryId)
                setIsCategoryPickerOpen(true)
              }}
              onQuickMessageSelect={(message) => {
                setSelectedAmount(message)
                setMemoText('')
              }}
              onTitleChange={(title) => {
                setMemoText(title)
                setSelectedAmount('')
              }}
              onFeedAmountChange={setFeedAmount}
              onDelete={() => {}}
              onSecondaryAction={handleMemoSaveOnly}
              onSave={handleMemoUpload}
              secondaryActionLabel="기록 완료"
              saveLabel="건강 리포트 받기"
            />
          )}
        </AddSheet>
      )}

      {showMemoSheet && (
        <>
          <div
            className="health_memo_overlay"
            onClick={() => setShowMemoSheet(false)}
            aria-hidden="true"
          />
          <div className="health_memo_sheet" role="dialog" aria-label="건강 메모 입력">
            <div className="health_memo_handle" aria-hidden="true" />

            <div className="health_memo_rows">
              <div className="health_memo_row">
                <span className="health_memo_row_label">기간</span>
                <button type="button" className="health_memo_row_value">
                  {today.getMonth() + 1}월 {today.getDate()}일
                  <ChevronIcon direction="right" size="md" />
                </button>
              </div>
              <div className="health_memo_row">
                <span className="health_memo_row_label">
                  자동 등록
                  <span className="health_memo_info" aria-hidden="true">i</span>
                </span>
                <button type="button" className="health_memo_row_value">
                  매일
                  <ChevronIcon direction="right" size="md" />
                </button>
              </div>
              <div className="health_memo_row health_memo_row_category">
                <span className="health_memo_row_label">카테고리</span>
                <button type="button" className="health_memo_row_value" onClick={handleCategoryClick}>
                  <span
                    className="health_memo_category_dot"
                    style={{ backgroundColor: selectedCategory.color }}
                    aria-hidden="true"
                  />
                  {selectedCategory.label}
                  <ChevronIcon direction="right" size="md" />
                </button>
              </div>
            </div>

            <section className="health_memo_content">
              <h2>내용입력</h2>
              <div className="health_memo_quick_messages" aria-label="빠른 입력">
                {quickMessages.map((msg) => (
                  <button
                    key={msg}
                    type="button"
                    className={`health_memo_quick_message${selectedAmount === msg ? ' is_selected' : ''}`}
                    onClick={() => { setSelectedAmount(msg); setMemoText('') }}
                  >
                    {msg}
                  </button>
                ))}
              </div>
              <textarea
                className="health_memo_textarea"
                placeholder="기타 입력사항을 자유롭게 작성해 주세요."
                rows={4}
                value={memoText}
                onChange={(e) => { setMemoText(e.target.value); setSelectedAmount('') }}
              />
            </section>

            <div className="health_memo_actions">
              <button
                type="button"
                className="health_memo_save_btn"
                disabled={!isActive}
                onClick={handleMemoSaveOnly}
              >
                저장하기
              </button>
              <button
                type="button"
                className="health_memo_upload_btn"
                disabled={!isActive}
                style={{
                  background: isActive ? '#6d59f8' : '#e5e5ec',
                  color: isActive ? 'white' : '#aaaaaa',
                  cursor: isActive ? 'pointer' : 'not-allowed',
                }}
                onClick={handleMemoUpload}
              >
                건강 리포트 받기
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}

export default Health
