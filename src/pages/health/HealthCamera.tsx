import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import '../Mission.css'
import './Health.css'
import './HealthCamera.css'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import ChevronIcon from '../../components/ChevronIcon'
import Button from '../../components/html/Button'
import BackButton from '../../components/html/BackButton'
import AddSheet from '../../components/AddSheet'
import ConfirmDialog from '../../components/ConfirmDialog'
import MissionRecordSheet from '../../components/MissionRecordSheet'
import StatusMessageBar from '../../components/StatusMessageBar'
import calendarGuideIcon from '../../svg/calendar.svg?raw'
import cameraGuideIcon from '../../svg/camera.svg?raw'
import camcorderGuideIcon from '../../svg/camcorder.svg?raw'
import guideExampleImage from '../../img/ex.png'
import guideVideoImage from '../../img/guide_video.png'
import communicateGuideIcon from '../../svg/nav_communicate off.svg?raw'
import memoGuideIcon from '../../svg/memo.svg?raw'
import {
  MISSION_HISTORY_RECORDS_CHANGE_EVENT,
  readMissionHistoryRecordsWithDefaults,
  type MissionHistoryRecord,
  writeStoredMissionHistoryRecords,
} from '../../utils/missionHistoryRecords'
import { showStateBarMessage } from '../../utils/stateBarMessage'
import { readSelectedPetProfileName } from '../../utils/petProfiles'
import { addUserNotification } from '../../utils/userNotifications'

type GuideMode = 'photo' | 'audio' | 'video' | 'memo'
type GuideIconType =
  | 'target'
  | 'light'
  | 'camera'
  | 'mic'
  | 'chat'
  | 'timer'
  | 'note'
  | 'video'
  | 'phone'
  | 'info'
  | 'meal'
  | 'calendar'
  | 'activity'

type PeriodDateTime = {
  year: number
  month: number
  day: number
  period: 'AM' | 'PM'
  hour: number
  minute: number
}

type PeriodField = 'start' | 'end'

const memoExamples = [
  {
    icon: 'meal' as const,
    title: '식사량 감소',
    description: '평소보다 밥을 잘 안 먹어요',
  },
  {
    icon: 'calendar' as const,
    title: '2일 지속',
    description: '2일째 지속되고 있어요',
  },
  {
    icon: 'activity' as const,
    title: '활동량 줄어듦',
    description: '산책이나 놀이 활동이 줄었어요',
  },
]

const today = new Date()

const categoryOptions = [
  { id: 'meal', label: '식사 기록', color: '#ffd1a8' },
  { id: 'poop', label: '배변 기록', color: '#527ca3' },
  { id: 'activity', label: '활동 기록', color: '#428fe6' },
  { id: 'symptom', label: '증상', color: '#b9dfe3' },
]

const repeatOptions = [
  { id: 'none', label: '안 함' },
  { id: 'daily', label: '매일' },
  { id: 'weekdays', label: '주중만' },
  { id: 'weekly', label: '매주' },
]

const quickMessages = [
  '사료 30g',
  '사료 60g',
  '사료 90g',
  '사료 120g',
  '사료 150g',
]

function getDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
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
  return `${dateTime.year}.${String(dateTime.month).padStart(2, '0')}.${String(dateTime.day).padStart(2, '0')}`
}

function getPeriodRangeLabel(start: PeriodDateTime, end: PeriodDateTime) {
  const startLabel = `${start.month}월 ${start.day}일`
  const endLabel = `${end.month}월 ${end.day}일`

  return startLabel === endLabel ? startLabel : `${startLabel} ~ ${endLabel}`
}

function createRepeatDateKeysFromPeriod(
  repeatId: string,
  start: Pick<PeriodDateTime, 'year' | 'month' | 'day'>,
  end?: Pick<PeriodDateTime, 'year' | 'month' | 'day'>,
) {
  const startDate = new Date(start.year, start.month - 1, start.day)
  const selectedEndDate = end
    ? new Date(end.year, end.month - 1, end.day)
    : startDate
  const endDate = selectedEndDate < startDate ? startDate : selectedEndDate
  const dateKeys: string[] = []

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
      dateKeys.push(
        getDateKey(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()),
      )
    }
  }

  return dateKeys.length > 0 ? dateKeys : [getDateKey(start.year, start.month, start.day)]
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

const guideConfigs: Record<
  GuideMode,
  {
    label: string
    title: string
    highlight: string
    actionLabel: string
    items: Array<{
      icon: GuideIconType
      title: string
      description: string
    }>
  }
> = {
  photo: {
    label: 'AI 건강 체크 촬영 가이드',
    title: '선명하게 촬영해주세요',
    highlight: '선명하게',
    actionLabel: '사진 촬영',
    items: [
      {
        icon: 'target',
        title: '문제가 있는 부위를 중심으로 촬영해주세요',
        description: '문제가 있는 부위가 잘 보이도록 촬영해주세요.',
      },
      {
        icon: 'light',
        title: '흐리거나 어두운 사진은 피해주세요',
        description: '선명한 사진을 위해 밝고 또렷하게 촬영해주세요.',
      },
      {
        icon: 'camera',
        title: '가능하면 밝은 곳에서 촬영해주세요',
        description: '자연광에서 촬영하면 더 잘 보입니다.',
      },
    ],
  },
  audio: {
    label: 'AI 건강 체크 음성 기록 가이드',
    title: '또렷하게 말씀해주세요',
    highlight: '또렷하게',
    actionLabel: '음성 기록',
    items: [
      {
        icon: 'mic',
        title: '조용한 환경에서 녹음해주세요',
        description: '주변 소음이 적은 곳에서 녹음하면 더 잘 들려요.',
      },
      {
        icon: 'chat',
        title: '증상이나 변화를 구체적으로 말씀해주세요',
        description: '언제부터, 어떤 변화가 있는지 자세히 말씀해주시면 좋아요.',
      },
      {
        icon: 'timer',
        title: '짧고 간단하게 말씀해주세요',
        description: '핵심 내용을 중심으로 짧게 말씀해주시면 충분해요.',
      },
    ],
  },
  video: {
    label: 'AI 건강 체크 동영상 촬영 가이드',
    title: '움직임이 잘 보이도록 촬영해주세요',
    highlight: '움직임이',
    actionLabel: '동영상 촬영',
    items: [
      {
        icon: 'video',
        title: '문제가 보이는 순간을 촬영해주세요',
        description: '증상이나 움직임이 드러나는 장면을 중심으로 담아주세요.',
      },
      {
        icon: 'phone',
        title: '카메라는 흔들리지 않게 유지해주세요',
        description: '화면이 흔들리지 않으면 상태를 더 잘 확인할 수 있어요.',
      },
      {
        icon: 'light',
        title: '밝은 환경에서 촬영해주세요',
        description: '어둡지 않은 곳에서 촬영하면 움직임이 더 선명하게 보여요.',
      },
    ],
  },
  memo: {
    label: 'AI 건강 체크 메모 작성 가이드',
    title: '간단하게 기록해주세요',
    highlight: '간단하게',
    actionLabel: '메모 작성',
    items: [
      {
        icon: 'note',
        title: '증상이나 변화를 중심으로 작성해주세요',
        description: '가장 걱정되는 변화부터 적어주세요.',
      },
      {
        icon: 'timer',
        title: '시간이나 횟수를 함께 적어주세요',
        description: '언제, 몇 번 있었는지 함께 적으면 좋아요.',
      },
      {
        icon: 'note',
        title: '짧고 이해하기 쉽게 작성해주세요',
        description: '핵심만 간단히 정리해 주세요.',
      },
    ],
  },
}

function GuideIcon({ type }: { type: GuideIconType }) {
  if (type === 'target') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="18" />
        <circle cx="24" cy="24" r="6" />
        <path d="M24 8v7M24 33v7M8 24h7M33 24h7M20 24h8M24 20v8" />
      </svg>
    )
  }

  if (type === 'light') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="9" />
        <path d="M24 6v6M24 36v6M6 24h6M36 24h6M11.3 11.3l4.2 4.2M32.5 32.5l4.2 4.2M36.7 11.3l-4.2 4.2M15.5 32.5l-4.2 4.2" />
      </svg>
    )
  }

  if (type === 'mic') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="18" y="7" width="12" height="22" rx="6" />
        <path d="M12 22a12 12 0 0 0 24 0M24 34v7M18 41h12" />
      </svg>
    )
  }

  if (type === 'chat') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M10 14a6 6 0 0 1 6-6h18a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H22l-10 8v-8h-2a6 6 0 0 1-6-6V14Z" />
        <path d="M17 20h.1M24 20h.1M31 20h.1" />
      </svg>
    )
  }

  if (type === 'timer') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="25" r="15" />
        <path d="M20 6h8M24 25V15M24 25l6 4M34 11l4 4" />
      </svg>
    )
  }

  if (type === 'note') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M15 8h13l9 9v18a5 5 0 0 1-5 5H15a5 5 0 0 1-5-5V13a5 5 0 0 1 5-5Z" />
        <path d="M28 8v10h10" />
        <path d="M18 22h12M18 28h8" />
        <path d="M28 34l3-3 4 4" />
      </svg>
    )
  }

  if (type === 'video') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="8" y="13" width="23" height="22" rx="5" />
        <path d="M31 21l9-6v18l-9-6" />
      </svg>
    )
  }

  if (type === 'phone') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="14" y="7" width="20" height="34" rx="6" />
        <path d="M21 12h6M21 36h6M35 17a6 6 0 0 1 0 14M39 13a11 11 0 0 1 0 22" />
      </svg>
    )
  }

  if (type === 'info') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="18" />
        <path d="M24 21v10" />
        <circle cx="24" cy="15" r="2" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  if (type === 'meal') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M12 27.5c0-6.8 5.4-12.5 12-12.5s12 5.7 12 12.5" />
        <path d="M9.5 28.5h29a3.5 3.5 0 0 1 3.5 3.5v1.2c0 4.3-3.5 7.8-7.8 7.8H13.8C9.5 41 6 37.5 6 33.2V32a3.5 3.5 0 0 1 3.5-3.5Z" />
        <path d="M17.5 17.5V13M24 16v-5M30.5 17.5V13" />
      </svg>
    )
  }

  if (type === 'calendar') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="8" y="10" width="32" height="30" rx="4" />
        <path d="M8 18h32M15 6v6M33 6v6" />
        <path d="M18 25h.1M24 25h.1M30 25h.1M18 31h.1M24 31h.1" />
      </svg>
    )
  }

  if (type === 'activity') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M21.41 22.38c1.82-.74 3.88-.76 6.09.36 2.23 1.31 3.47 2.99 4.98 5.33l.01.01c1.04 1.6 2.28 2.54 3.65 3.5h.01c1.25.92 2 1.81 2.26 2.97.19 1.54-.27 2.94-1.3 4.28-.25.28-.49.56-.75.83l-.01.01-.01.01c-.11.12-.22.25-.33.38-.87.92-1.84 1.54-2.95 1.77-1.24.03-2.65-.29-3.87-.81l-.08-.03-.69-.22c-1.62-.47-3.24-.58-4.81-.58h-.63c-1.98.03-3.67.41-5.47 1-.9.29-1.64.48-2.32.58-.82.11-1.48.02-2.2-.28-1.84-1.01-3.08-2.68-3.79-4.72-.31-1.3-.26-2.32.28-3.28.45-.62.92-1.12 1.5-1.59l.64-.49.02-.01c1.65-1.2 2.76-2.38 3.84-4.08v-.01c1.45-2.25 3.35-3.97 5.43-4.81Z" />
        <path d="M29.55 6.66c.35-.09.79-.11 1.44.05 1.14.89 1.75 1.88 2.17 3.37l.01.02.01.02.01.03c.35 1.83-.03 3.61-1 5.29-.43.59-.97 1.04-1.61 1.34-.79.09-1.31.01-1.76-.28-1.2-1.01-1.93-2.24-2.13-3.74-.16-2.18.2-3.99 1.44-5.5.56-.54 1-.79 1.43-.88Z" />
        <path d="M18.15 6.64c.35-.08.78-.07 1.39.08 1.14.89 1.75 1.88 2.17 3.37l.01.04.01.01c.03.1.06.2.09.31.38 1.92-.13 3.83-1.23 5.64-.56.62-1.08.93-1.73 1.03-.46.02-.77-.05-1.03-.16-.3-.14-.63-.37-1.1-.77-1.04-1.09-1.46-2.59-1.47-4.34.03-1.8.49-3.16 1.63-4.42.51-.47.92-.68 1.26-.76Z" />
        <path d="M38.25 16.61c.71-.49 1.5-.58 2.63-.3 1.1.71 1.66 1.54 1.97 2.71.25 1.89-.1 3.38-1.39 4.92-.51.49-.92.7-1.63.8-.58.02-.94 0-1.24-.08-.26-.06-.53-.17-.86-.43-1.16-1.05-1.52-2.39-1.5-4.09.12-1.38.76-2.59 2.02-3.53Z" />
        <path d="M7.18 16.62c.58-.45 1.19-.55 2.36-.42 1.11.5 1.83 1.38 2.42 2.54.54 1.4.48 3.04-.2 4.35-.53.76-1.04 1.28-1.76 1.61-.84.09-1.43.06-2.05-.15-1.49-1.21-2.17-2.4-2.3-4.03-.06-1.47.39-2.67 1.53-3.9Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M15 17h5l2-4h8l2 4h5a4 4 0 0 1 4 4v13a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4V21a4 4 0 0 1 4-4h4Z" />
      <circle cx="24" cy="28" r="7" />
    </svg>
  )
}

const guideIconAssets: Partial<Record<GuideIconType, string>> = {
  camera: cameraGuideIcon,
  video: camcorderGuideIcon,
  chat: communicateGuideIcon,
  note: memoGuideIcon,
  calendar: calendarGuideIcon,
}

function GuideAssetIcon({ type }: { type: GuideIconType }) {
  if (type === 'chat') {
    return (
      <span className="health_camera_guide_asset_icon health_camera_guide_asset_icon_chat" aria-hidden="true">
        <svg viewBox="0 0 48 48">
          <path d="M24 10c8.8 0 16 5.9 16 13.2S32.8 36.4 24 36.4c-1.8 0-3.5-.2-5.2-.7L11 39l2.5-6.6C10.7 30 8 26.8 8 23.2 8 15.9 15.2 10 24 10Z" />
          <path d="M19 23.2h.1M24 23.2h.1M29 23.2h.1" />
        </svg>
      </span>
    )
  }

  const asset = guideIconAssets[type]

  if (!asset) {
    return <GuideIcon type={type} />
  }

  return (
    <span
      className={`health_camera_guide_asset_icon health_camera_guide_asset_icon_${type}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: asset }}
    />
  )
}

type HealthCameraProps = {
  captureOnly?: boolean
}

function HealthCamera({ captureOnly = false }: HealthCameraProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const shouldNavigateAfterRecordRef = useRef(false)
  const albumInputRef = useRef<HTMLInputElement>(null)
  const [cameraError, setCameraError] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment')
  const [cameraZoom, setCameraZoom] = useState(1)
  const [showGuide] = useState(!captureOnly && searchParams.get('guide') !== 'false')
  const modeParam = searchParams.get('mode')
  const mode: GuideMode =
    modeParam === 'audio' || modeParam === 'video' || modeParam === 'memo' ? modeParam : 'photo'
  const guideConfig = guideConfigs[mode]
  const isCaptureMode = mode === 'photo' || mode === 'video'
  const isAudioMode = mode === 'audio'
  const actionLabel = guideConfig.actionLabel
  const isEditFlow = searchParams.get('edit') === 'true'
  const cameraModes = [
    { label: 'CINEMATIC' },
    { label: 'VIDEO', mode: 'video' as const },
    { label: 'PHOTO', mode: 'photo' as const },
    { label: 'PORTRAIT' },
    { label: 'PANO' },
  ]
  const zoomOptions = [
    { label: '.5', value: 0.5 },
    { label: '1x', value: 1 },
    { label: '3', value: 3 },
  ]
  const [isMemoSheetOpen, setIsMemoSheetOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryOptions[0].id)
  const [draftCategoryId, setDraftCategoryId] = useState(categoryOptions[0].id)
  const [selectedRepeatId, setSelectedRepeatId] = useState(repeatOptions[0].id)
  const [draftRepeatId, setDraftRepeatId] = useState(repeatOptions[0].id)
  const [periodStart, setPeriodStart] = useState(() =>
    createPeriodDateTime(today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes()),
  )
  const [periodEnd, setPeriodEnd] = useState(() =>
    createPeriodDateTime(today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes()),
  )
  const [draftPeriodStart, setDraftPeriodStart] = useState(periodStart)
  const [draftPeriodEnd, setDraftPeriodEnd] = useState(periodEnd)
  const [periodEditingField, setPeriodEditingField] = useState<PeriodField>('start')
  const [isPeriodPickerOpen, setIsPeriodPickerOpen] = useState(false)
  const [isRepeatPickerOpen, setIsRepeatPickerOpen] = useState(false)
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false)
  const [memoText, setMemoText] = useState('')
  const [selectedQuickMessage, setSelectedQuickMessage] = useState('')
  const [feedAmount, setFeedAmount] = useState(30)
  const [isSaveCompleteDialogOpen, setIsSaveCompleteDialogOpen] = useState(false)
  const selectedCategory = categoryOptions.find((category) => category.id === selectedCategoryId) ?? categoryOptions[0]
  const draftCategory = categoryOptions.find((category) => category.id === draftCategoryId) ?? selectedCategory
  const selectedRepeat = repeatOptions.find((option) => option.id === selectedRepeatId) ?? repeatOptions[0]
  const draftRepeat = repeatOptions.find((option) => option.id === draftRepeatId) ?? selectedRepeat
  const activeDraftPeriod = periodEditingField === 'start' ? draftPeriodStart : draftPeriodEnd
  const canSaveMemo =
    memoText.trim().length > 0 ||
    selectedQuickMessage.length > 0 ||
    (selectedCategory.id === 'meal' && feedAmount > 0)

  const updateDraftPeriod = (nextValue: Partial<PeriodDateTime>) => {
    const updater = (prev: PeriodDateTime) => ({ ...prev, ...nextValue })

    if (periodEditingField === 'start') {
      setDraftPeriodStart(updater)
      return
    }

    setDraftPeriodEnd(updater)
  }

  const continueAfterGuide = async () => {
    if (mode === 'memo') {
      setIsMemoSheetOpen(true)
      return
    }

    try {
      const preflightStream = await navigator.mediaDevices.getUserMedia({
        video: isAudioMode ? false : { facingMode: cameraFacingMode },
        audio: mode === 'video' || isAudioMode,
      })

      preflightStream.getTracks().forEach((track) => track.stop())
    } catch {
      setCameraError(isAudioMode ? '마이크 권한을 허용해 주세요.' : '카메라 권한을 허용해 주세요.')
      return
    }

    navigate(`/health/camera/capture?mode=${mode}${isEditFlow ? '&edit=true' : ''}`, { replace: true })
  }

  const openMemoSheet = () => {
    setIsMemoSheetOpen(true)
  }

  const closeMemoSheet = () => {
    setIsMemoSheetOpen(false)
    setIsPeriodPickerOpen(false)
    setIsRepeatPickerOpen(false)
    setIsCategoryPickerOpen(false)
  }

  const resetMemoSheet = () => {
    const nextToday = new Date()
    const nextPeriod = createPeriodDateTime(
      nextToday.getFullYear(),
      nextToday.getMonth() + 1,
      nextToday.getDate(),
      nextToday.getHours(),
      nextToday.getMinutes(),
    )

    setMemoText('')
    setSelectedQuickMessage('')
    setFeedAmount(30)
    setSelectedRepeatId(repeatOptions[0].id)
    setDraftRepeatId(repeatOptions[0].id)
    setPeriodStart(nextPeriod)
    setPeriodEnd(nextPeriod)
    setDraftPeriodStart(nextPeriod)
    setDraftPeriodEnd(nextPeriod)
    setPeriodEditingField('start')
  }

  const saveMemoToCalendar = () => {
    const primaryDetail =
      selectedCategory.id === 'meal' && feedAmount > 0
        ? `사료 ${feedAmount}g`
        : selectedQuickMessage
    const detail = [primaryDetail, memoText.trim()].filter(Boolean).join('\n')

    if (!detail) {
      return false
    }

    const baseId = Date.now()
    const repeatDateKeys = createRepeatDateKeysFromPeriod(
      selectedRepeatId,
      draftPeriodStart,
      getRepeatEndPeriod(selectedRepeatId, draftPeriodStart, draftPeriodEnd),
    )
    const newRecords: MissionHistoryRecord[] = repeatDateKeys.map((date, index) => ({
      id: baseId + index,
      title: selectedCategory.id === 'symptom' ? '증상 기록' : selectedCategory.label,
      detail,
      time: getPeriodTimeLabel(draftPeriodStart),
      color: selectedCategory.color,
      date,
    }))

    writeStoredMissionHistoryRecords([...newRecords.reverse(), ...readMissionHistoryRecordsWithDefaults()])
    window.dispatchEvent(new CustomEvent(MISSION_HISTORY_RECORDS_CHANGE_EVENT, { detail: newRecords[0] }))
    setPeriodStart(draftPeriodStart)
    setPeriodEnd(draftPeriodEnd)
    setSelectedRepeatId(draftRepeatId)
    return true
  }

  const handleMemoSaveComplete = () => {
    if (!saveMemoToCalendar()) return

    showStateBarMessage(`${readSelectedPetProfileName()}의 기록이 저장되었어요.`)
    addUserNotification({
      title: '건강 히스토리',
      content: `${readSelectedPetProfileName()}의 기록이 저장되었어요.`,
      path: '/mission',
    })
    resetMemoSheet()
    closeMemoSheet()
  }

  const handleMemoUpload = () => {
    if (!saveMemoToCalendar()) return

    resetMemoSheet()
    closeMemoSheet()
    navigate('/health/check')
  }

  const periodPickerContent = (
    <div className="mission_period_inline health_camera_period_inline">
      <div className="mission_period_rows">
        <button
          type="button"
          className={`mission_period_row${periodEditingField === 'start' ? ' active' : ''}`}
          onClick={() => setPeriodEditingField('start')}
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
          onClick={() => setPeriodEditingField('end')}
        >
          <span className="mission_period_row_label">종료일</span>
          <span className="mission_period_row_value">
            {getPeriodDateLabel(draftPeriodEnd)}
            <ChevronIcon direction="right" size="sm" />
          </span>
        </button>
      </div>

      <div className="health_camera_period_editor">
        <label className="health_camera_period_field">
          <span>{periodEditingField === 'start' ? '시작일 선택' : '종료일 선택'}</span>
          <input
            type="date"
            value={getDateKey(activeDraftPeriod.year, activeDraftPeriod.month, activeDraftPeriod.day)}
            onChange={(event) => {
              const [year, month, day] = event.target.value.split('-').map(Number)
              if (!year || !month || !day) return
              updateDraftPeriod({ year, month, day })
            }}
          />
        </label>
      </div>

      <div className="mission_category_actions mission_period_actions">
        <button
          type="button"
          className="mission_category_prev white_btn"
          onClick={() => {
            setDraftPeriodStart(periodStart)
            setDraftPeriodEnd(periodEnd)
            setIsPeriodPickerOpen(false)
          }}
        >
          이전
        </button>
        <button
          type="button"
          className="mission_category_confirm"
          onClick={() => {
            setPeriodStart(draftPeriodStart)
            setPeriodEnd(draftPeriodEnd)
            setIsPeriodPickerOpen(false)
          }}
        >
          확인
        </button>
      </div>
    </div>
  )

  const memoSheet = isMemoSheetOpen ? (
    <AddSheet onClose={closeMemoSheet}>
      {isPeriodPickerOpen ? (
        <div className="mission_repeat_picker">
          <h2>기간 선택</h2>
          {periodPickerContent}
        </div>
      ) : isRepeatPickerOpen ? (
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
      ) : isCategoryPickerOpen ? (
        <div className="mission_category_picker">
          <div className="mission_category_picker_top">
            <span aria-hidden="true" />
            <h2>카테고리 선택</h2>
            <span aria-hidden="true" />
          </div>
          <div className="mission_category_grid">
            {categoryOptions.map((category) => (
              <button
                key={category.id}
                type="button"
                className={category.id === draftCategory.id ? 'mission_category_option active' : 'mission_category_option'}
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
          addDate={{ month: periodStart.month, day: periodStart.day }}
          selectedCategory={selectedCategory}
          repeatLabel={selectedRepeat.label}
          periodLabel={getPeriodRangeLabel(periodStart, periodEnd)}
          addTitle={memoText}
          feedAmount={feedAmount}
          canSave={canSaveMemo}
          isEditing={false}
          quickMessageOptions={quickMessages}
          selectedQuickMessage={selectedQuickMessage}
          isPeriodPickerOpen={isPeriodPickerOpen}
          periodPickerContent={periodPickerContent}
          onOpenPeriodPicker={() => {
            setDraftPeriodStart(periodStart)
            setDraftPeriodEnd(periodEnd)
            setPeriodEditingField('start')
            setIsRepeatPickerOpen(false)
            setIsCategoryPickerOpen(false)
            setIsPeriodPickerOpen(true)
          }}
          onOpenRepeatPicker={() => {
            setDraftRepeatId(selectedRepeatId)
            setIsPeriodPickerOpen(false)
            setIsRepeatPickerOpen(true)
          }}
          onOpenCategoryPicker={() => {
            setDraftCategoryId(selectedCategoryId)
            setIsPeriodPickerOpen(false)
            setIsCategoryPickerOpen(true)
          }}
          onQuickMessageSelect={(message) => {
            setSelectedQuickMessage(message)
            setMemoText('')
          }}
          onTitleChange={(title) => {
            setMemoText(title)
            setSelectedQuickMessage('')
          }}
          onFeedAmountChange={setFeedAmount}
          onDelete={() => {}}
          onSecondaryAction={handleMemoSaveComplete}
          onSave={handleMemoUpload}
          secondaryActionLabel="기록 완료"
          saveLabel="업로드 하기"
        />
      )}
    </AddSheet>
  ) : null

  const returnToRegister = (
    _section: Exclude<GuideMode, 'memo'>,
    state?: {
      capturedEntry?: {
        section: Exclude<GuideMode, 'memo'>
        entry: {
          id: string
          preview?: string
          label?: string
          mediaType?: 'image' | 'video' | 'audio'
        }
      }
      pendingEdit?: {
        section: 'photo' | 'video'
        src: string
        mediaType: 'image' | 'video'
        label: string
      }
    },
  ) => {
    navigate('/health/cam', {
      replace: true,
      state,
    })
  }

  const capturePhotoPreview = () => {
    const video = videoRef.current

    if (!video || !video.videoWidth || !video.videoHeight) {
      return ''
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')

    if (!context) {
      return ''
    }

    context.fillStyle = '#000000'
    context.fillRect(0, 0, canvas.width, canvas.height)

    if (cameraZoom > 1) {
      const sourceWidth = video.videoWidth / cameraZoom
      const sourceHeight = video.videoHeight / cameraZoom
      const sourceX = (video.videoWidth - sourceWidth) / 2
      const sourceY = (video.videoHeight - sourceHeight) / 2
      context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
    } else {
      const drawWidth = canvas.width * cameraZoom
      const drawHeight = canvas.height * cameraZoom
      const drawX = (canvas.width - drawWidth) / 2
      const drawY = (canvas.height - drawHeight) / 2
      context.drawImage(video, drawX, drawY, drawWidth, drawHeight)
    }

    return canvas.toDataURL('image/jpeg', 0.92)
  }

  const getAlbumAcceptType = () => {
    if (mode === 'video') return 'video/*'
    if (mode === 'audio') return 'audio/*'
    return 'image/*'
  }

  const handleAlbumClick = () => {
    albumInputRef.current?.click()
  }

  const handleCameraSwitch = () => {
    setCameraFacingMode((current) => (current === 'environment' ? 'user' : 'environment'))
  }

  const handleCameraZoomChange = (zoom: number) => {
    setCameraZoom(zoom)
  }

  const handleAlbumChange = (event: { target: HTMLInputElement }) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const fileUrl = URL.createObjectURL(file)
    const label = file.name || (mode === 'video' ? '동영상 업로드 완료' : mode === 'audio' ? '녹음 업로드 완료' : '사진 업로드 완료')

    if (mode === 'video') {
      if (isEditFlow) {
        returnToRegister('video', {
          pendingEdit: {
            section: 'video',
            src: fileUrl,
            mediaType: 'video',
            label,
          },
        })
      } else {
        returnToRegister('video', {
          capturedEntry: {
            section: 'video',
            entry: {
              id: `video-upload-${Date.now()}`,
              preview: fileUrl,
              label,
              mediaType: 'video',
            },
          },
        })
      }
    } else if (mode === 'audio') {
      returnToRegister('audio', {
        capturedEntry: {
          section: 'audio',
          entry: {
            id: `audio-upload-${Date.now()}`,
            preview: fileUrl,
            label,
            mediaType: 'audio',
          },
        },
      })
    } else {
      if (isEditFlow) {
        returnToRegister('photo', {
          pendingEdit: {
            section: 'photo',
            src: fileUrl,
            mediaType: 'image',
            label,
          },
        })
      } else {
        returnToRegister('photo', {
          capturedEntry: {
            section: 'photo',
            entry: {
              id: `photo-upload-${Date.now()}`,
              preview: fileUrl,
              label,
              mediaType: 'image',
            },
          },
        })
      }
    }

    event.target.value = ''
  }

  const handleCapture = () => {
    if (mode === 'audio') {
      if (isRecording) {
        shouldNavigateAfterRecordRef.current = true
        mediaRecorderRef.current?.stop()
        return
      }

      const stream = streamRef.current

      if (!stream) {
        setCameraError('녹음을 시작할 수 없어요. 잠시 후 다시 시도해주세요.')
        return
      }

      recordedChunksRef.current = []

      try {
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          setIsRecording(false)
          if (shouldNavigateAfterRecordRef.current) {
            shouldNavigateAfterRecordRef.current = false
            returnToRegister('audio', {
              capturedEntry: {
                section: 'audio',
                entry: {
                  id: `audio-capture-${Date.now()}`,
                  label: '녹음 완료',
                  mediaType: 'audio',
                },
              },
            })
          }
        }

        mediaRecorder.start()
        setIsRecording(true)
      } catch {
        setCameraError('녹음을 시작할 수 없어요. 마이크 권한을 확인해주세요.')
      }

      return
    }

    if (mode === 'photo') {
      const preview = capturePhotoPreview()

      if (!preview) {
        setCameraError('사진을 저장할 수 없어요. 잠시 후 다시 시도해주세요.')
        return
      }

      if (isEditFlow) {
        returnToRegister('photo', {
          pendingEdit: {
            section: 'photo',
            src: preview,
            mediaType: 'image',
            label: '사진 편집본',
          },
        })
        return
      }

      returnToRegister('photo', {
        capturedEntry: {
          section: 'photo',
          entry: {
            id: `photo-capture-${Date.now()}`,
            preview,
            label: '사진 촬영 완료',
            mediaType: 'image',
          },
        },
      })
      return
    }

    if (mode !== 'video') {
      return
    }

    if (isRecording) {
      shouldNavigateAfterRecordRef.current = true
      mediaRecorderRef.current?.stop()
      return
    }

    const stream = streamRef.current

    if (!stream) {
      setCameraError('동영상 촬영을 시작할 수 없어요. 잠시 후 다시 시도해주세요.')
      return
    }

    recordedChunksRef.current = []

    try {
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

        mediaRecorder.onstop = () => {
          setIsRecording(false)
          const videoUrl =
            recordedChunksRef.current.length > 0
              ? URL.createObjectURL(new Blob(recordedChunksRef.current, { type: 'video/webm' }))
              : undefined

          if (shouldNavigateAfterRecordRef.current) {
            shouldNavigateAfterRecordRef.current = false
            if (isEditFlow && videoUrl) {
              returnToRegister('video', {
                pendingEdit: {
                  section: 'video',
                  src: videoUrl,
                  mediaType: 'video',
                  label: '동영상 편집본',
                },
              })
              return
            }

            returnToRegister('video', {
              capturedEntry: {
                section: 'video',
                entry: {
                  id: `video-capture-${Date.now()}`,
                  preview: videoUrl,
                  label: '동영상 촬영 완료',
                  mediaType: 'video',
                },
              },
            })
          }
        }

      mediaRecorder.start()
      setIsRecording(true)
    } catch {
      setCameraError('동영상 녹화를 시작할 수 없어요. 기기 설정을 확인해주세요.')
    }
  }

  useEffect(() => {
    if (showGuide || (!isCaptureMode && !isAudioMode)) {
      return
    }

    let mounted = true

    const startCamera = async () => {
      try {
        setCameraError('')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isAudioMode ? false : { facingMode: cameraFacingMode },
          audio: mode === 'video' || isAudioMode,
        })

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        if (!isAudioMode && videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        if (mounted) {
          setCameraError('카메라 권한을 허용해 주세요.')
        }
      }
    }

    startCamera()

    return () => {
      const currentRecorder = mediaRecorderRef.current

      if (currentRecorder && currentRecorder.state !== 'inactive') {
        shouldNavigateAfterRecordRef.current = false
        currentRecorder.stop()
      }
      mediaRecorderRef.current = null
      recordedChunksRef.current = []
      setIsRecording(false)
      mounted = false
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [mode, showGuide, isCaptureMode, isAudioMode, navigate, cameraFacingMode])

  useEffect(() => {
    const videoTrack = streamRef.current?.getVideoTracks()[0]

    if (!videoTrack) return

    const capabilities = videoTrack.getCapabilities?.() as MediaTrackCapabilities & {
      zoom?: { min?: number; max?: number }
    }
    const zoomCapability = capabilities?.zoom

    if (!zoomCapability) return

    const minZoom = zoomCapability.min ?? cameraZoom
    const maxZoom = zoomCapability.max ?? cameraZoom
    const nextZoom = Math.min(Math.max(cameraZoom, minZoom), maxZoom)

    videoTrack.applyConstraints?.({
      advanced: [{ zoom: nextZoom } as MediaTrackConstraintSet],
    }).catch(() => undefined)
  }, [cameraZoom, cameraFacingMode])

  if (showGuide) {
    return (
      <>
        <PageHeader
          title="AI 건강 체크"
          leftContent={<BackButton to="/health" />}
          rightContent={
            <>
              <Button type="button" aria-label="캘린더" onClick={() => navigate('/mission')}>
                <HeaderIcon type="calendar" />
              </Button>
              <Button type="button" aria-label="알림">
                <HeaderIcon type="notification" />
              </Button>
            </>
          }
        />

        <main
          className={`page health_page health_camera_page health_camera_page_guide health_camera_page_guide_${mode}`}
        >
          <section className="health_camera_guide" aria-label="촬영 안내">
            <div className="health_camera_guide_copy">
              <div className="health_camera_guide_copy_top">
                <p>{guideConfig.label}</p>
                <button type="button" className="health_camera_guide_skip" onClick={continueAfterGuide}>
                  건너뛰기
                </button>
              </div>
              <h1>
                <span>{guideConfig.highlight}</span>{' '}
                {guideConfig.title.replace(guideConfig.highlight, '').trim()}
              </h1>
            </div>

            <section className="health_camera_guide_panel" aria-label={`${guideConfig.actionLabel} 안내`}>
              {mode === 'photo' ? (
                <div className="health_camera_example">
                  <span>예시 이미지</span>
                  <img src={guideExampleImage} alt="피부 상태 촬영 예시" />
                </div>
              ) : null}

              {mode === 'audio' ? (
                <div className="health_camera_audio_visual" aria-hidden="true">
                  <div className="health_camera_audio_bubble">"밥을 잘 안 먹어요"</div>
                  <div className="health_camera_audio_wave">
                    {Array.from({ length: 34 }).map((_, index) => (
                      <span
                      key={index}
                      style={{
                        '--wave-h': `${18 + (index % 7) * 10}px`,
                        '--wave-h-sm': `${12 + (index % 7) * 6}px`,
                        '--wave-op': 0.36 + (index % 5) * 0.1,
                      } as CSSProperties}
                    />
                    ))}
                  </div>
                  <div className="health_camera_audio_meter">
                    <GuideIcon type="mic" />
                    <strong>00:12</strong>
                  </div>
                  <div className="health_camera_audio_recording">
                    <span />
                    녹음 중
                  </div>
                </div>
              ) : null}

              {mode === 'memo' ? (
                <div className="health_camera_memo_example" aria-hidden="true">
                  <span className="health_camera_memo_example_label">예시 메모</span>
                  <div className="health_camera_memo_example_cards">
                    {memoExamples.map((item) => (
                      <article className="health_camera_memo_example_card" key={item.title}>
                        <span className="health_camera_memo_example_icon">
                          <GuideAssetIcon type={item.icon} />
                        </span>
                        <div>
                          <h2>{item.title}</h2>
                          <p>{item.description}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {mode === 'video' ? (
                <div className="health_camera_video_visual" aria-hidden="true">
                  <div className="health_camera_video_preview">
                    <span>예시 이미지</span>
                    <img src={guideVideoImage} alt="동영상 촬영 가이드 예시" />
                  </div>
                  <div className="health_camera_video_notice">
                    <GuideIcon type="info" />
                    <strong>문제가 보이는 순간을 촬영해주세요</strong>
                  </div>
                </div>
              ) : null}

              <div className="health_camera_guide_list">
                    {guideConfig.items.map((item) => (
                      <article className="health_camera_guide_item" key={item.title}>
                        <span className="health_camera_guide_card_icon">
                          <GuideAssetIcon type={item.icon} />
                        </span>
                    <div>
                      <h2>{item.title}</h2>
                      <p>{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>
        </main>
        {memoSheet}
        <StatusMessageBar />
        {isSaveCompleteDialogOpen ? (
          <ConfirmDialog
            message="캘린더에 등록되었습니다"
            onCancel={() => setIsSaveCompleteDialogOpen(false)}
            onConfirm={() => setIsSaveCompleteDialogOpen(false)}
            confirmLabel="확인"
            hideCancel
          />
        ) : null}
      </>
    )
  }

  return (
    <main className="page health_page health_camera_page">
      <div className="health_camera_topbar">
        <button
          type="button"
          className="health_camera_icon_button health_camera_back"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
        >
          <ChevronIcon direction="left" size="lg" />
        </button>
        <button type="button" className="health_camera_icon_button health_camera_caret" aria-label="카메라 옵션">
          <span />
        </button>
        <div className="health_camera_tool_group">
          <button type="button" className="health_camera_icon_button health_camera_raw" aria-label="RAW">
            RAW
          </button>
          <button type="button" className="health_camera_icon_button health_camera_exposure" aria-label="노출">
            <span />
          </button>
        </div>
      </div>

      <section className="health_camera_view" aria-label={actionLabel}>
        {cameraError && !isAudioMode ? (
          <>
            <img className="health_camera_placeholder" src={guideVideoImage} alt="" aria-hidden="true" />
            <div className="health_camera_error">{cameraError}</div>
          </>
        ) : isAudioMode ? (
          <div className="health_camera_audio_capture" aria-hidden="true">
            <div className="health_camera_audio_wave">
              {Array.from({ length: 34 }).map((_, index) => (
                <span
                  key={index}
                  style={{
                    '--wave-h': `${18 + (index % 7) * 10}px`,
                    '--wave-h-sm': `${12 + (index % 7) * 6}px`,
                    '--wave-op': 0.36 + (index % 5) * 0.1,
                  } as CSSProperties}
                />
              ))}
            </div>
            <div className="health_camera_audio_meter">
              <GuideIcon type="mic" />
              <strong>{isRecording ? 'REC' : 'READY'}</strong>
            </div>
            <div className="health_camera_audio_recording">
              <span />
              {isRecording ? '녹음 중' : '녹음 준비'}
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ '--camera-zoom': cameraZoom } as CSSProperties}
          />
        )}
      </section>

      <div className="health_camera_actions">
        <div className="health_camera_zoom" aria-label="카메라 배율">
          {zoomOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              className={cameraZoom === option.value ? 'is_active' : undefined}
              aria-pressed={cameraZoom === option.value}
              onPointerDown={(event) => {
                event.preventDefault()
                handleCameraZoomChange(option.value)
              }}
              onClick={() => handleCameraZoomChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="health_camera_modes" aria-label="촬영 모드">
          {cameraModes.map((cameraMode) => (
            <button
              key={cameraMode.label}
              type="button"
              className={cameraMode.mode === mode ? 'is_active' : undefined}
              disabled={!cameraMode.mode}
              onClick={() => {
                if (!cameraMode.mode || cameraMode.mode === mode) return
                navigate(`/health/camera/capture?mode=${cameraMode.mode}${isEditFlow ? '&edit=true' : ''}`)
              }}
            >
              {cameraMode.label}
            </button>
          ))}
        </div>
        <div className="health_camera_control_row">
          <input
            ref={albumInputRef}
            type="file"
            className="health_camera_album_input"
            accept={getAlbumAcceptType()}
            onChange={handleAlbumChange}
          />
          <button
            type="button"
            className="health_camera_side_button"
            aria-label="사진첩"
            onClick={handleAlbumClick}
          >
            <span className="health_camera_gallery_icon" />
          </button>
        <Button
          type="button"
          className="health_camera_shutter"
          aria-label={actionLabel}
          onClick={handleCapture}
        >
          {isRecording ? (
            <span className="health_camera_shutter_recording" />
          ) : (
            <span className="health_camera_shutter_inner" />
          )}
        </Button>
          <button type="button" className="health_camera_side_button" aria-label="카메라 전환" onClick={handleCameraSwitch}>
            <span className="health_camera_switch_icon" />
          </button>
        </div>
        <div className="health_cam_tabs_wrapper">
          <div className="health_cam_tabs" role="tablist" aria-label="건강 체크 입력 방식">
            <button type="button" className="health_cam_tab is_active">
              카메라
            </button>
            <button type="button" className="health_cam_tab" onClick={openMemoSheet}>
              메모
            </button>
          </div>
        </div>
      </div>
      {memoSheet}
      <StatusMessageBar />
      {isSaveCompleteDialogOpen ? (
        <ConfirmDialog
          message="캘린더에 등록되었습니다"
          onCancel={() => setIsSaveCompleteDialogOpen(false)}
          onConfirm={() => setIsSaveCompleteDialogOpen(false)}
          confirmLabel="확인"
          hideCancel
        />
      ) : null}
    </main>
  )
}

export default HealthCamera
