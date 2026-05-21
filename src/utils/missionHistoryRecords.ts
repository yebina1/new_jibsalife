import type { MissionActivityRecord } from './missionActivityRecords'
import { readSelectedPetProfileId } from './petProfiles'
import { getUserScopedStorageKey, isCurrentDemoUser } from './userScopedStorage'

export type MissionHistoryRecord = {
  id: number
  title: string
  detail: string
  time: string
  color: string
  date: string
  source?: 'chat' | 'health'
  media?: {
    type: 'image' | 'video'
    src: string
    label?: string
  }[]
}

type MissionRecordSeed = {
  idBase: number
  mealDetails: string[]
  poopDetails: string[]
  walkDetails: string[]
  activityDetails: string[]
  symptomDetails: string[]
}

const MEAL_TITLE = '식사 기록'
const ACTIVITY_TITLE = '활동 기록'
const WALK_TITLE = '산책 기록'
const POOP_TITLE = '배변 · 배뇨 기록'
const SYMPTOM_TITLE = '증상 기록'
const HEALTH_CHECK_TITLE = '건강 체크 기록'

const MEAL_COLOR = '#F2B472'
const ACTIVITY_COLOR = '#162447'
const WALK_COLOR = '#A4CE95'
const POOP_COLOR = '#BEE3F8'
const SYMPTOM_COLOR = '#A28BFA'
const HEALTH_CHECK_COLOR = '#A08DFF'

const DEFAULT_START_DATE = '2026-05-01'
const DEFAULT_END_DATE = '2027-12-31'

export const MISSION_HISTORY_RECORDS_STORAGE_KEY = 'jibsalife.mission.historyRecords'
export const MISSION_HISTORY_RECORDS_CHANGE_EVENT = 'mission-history-records-change'

function createUtcDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00Z`)
}

function formatDateKey(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function createRecord(
  id: number,
  title: string,
  detail: string,
  hour: number,
  minute: number,
  color: string,
  date: string,
): MissionHistoryRecord {
  return {
    id,
    title,
    detail,
    time: formatTime(hour, minute),
    color,
    date,
  }
}

function generateMissionHistoryRecords(seed: MissionRecordSeed) {
  const records: MissionHistoryRecord[] = []
  const startDate = createUtcDate(DEFAULT_START_DATE)
  const endDate = createUtcDate(DEFAULT_END_DATE)
  let nextId = seed.idBase
  let dayIndex = 0

  for (let cursor = new Date(startDate); cursor <= endDate; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const dateKey = formatDateKey(cursor)

    records.push(
      createRecord(
        nextId++,
        MEAL_TITLE,
        seed.mealDetails[dayIndex % seed.mealDetails.length],
        8,
        (dayIndex * 7) % 40,
        MEAL_COLOR,
        dateKey,
      ),
    )

    records.push(
      createRecord(
        nextId++,
        POOP_TITLE,
        seed.poopDetails[dayIndex % seed.poopDetails.length],
        9,
        10 + ((dayIndex * 5) % 35),
        POOP_COLOR,
        dateKey,
      ),
    )

    records.push(
      createRecord(
        nextId++,
        WALK_TITLE,
        seed.walkDetails[dayIndex % seed.walkDetails.length],
        18,
        (dayIndex * 9) % 50,
        WALK_COLOR,
        dateKey,
      ),
    )

    if (dayIndex % 3 === 0) {
      records.push(
        createRecord(
          nextId++,
          ACTIVITY_TITLE,
          seed.activityDetails[dayIndex % seed.activityDetails.length],
          14,
          (dayIndex * 6) % 45,
          ACTIVITY_COLOR,
          dateKey,
        ),
      )
    }

    if (dayIndex % 9 === 4) {
      records.push(
        createRecord(
          nextId++,
          SYMPTOM_TITLE,
          seed.symptomDetails[dayIndex % seed.symptomDetails.length],
          20,
          (dayIndex * 4) % 40,
          SYMPTOM_COLOR,
          dateKey,
        ),
      )
    }

    dayIndex += 1
  }

  return records
}

const DEFAULT_MISSION_HISTORY_RECORDS = generateMissionHistoryRecords({
  idBase: 101,
  mealDetails: ['사료 90g', '사료 100g', '사료 110g', '사료 120g'],
  poopDetails: ['정상 변', '정상 변', '단단한 변', '평소와 다름'],
  walkDetails: ['산책 25분', '산책 30분', '산책 35분', '산책 40분'],
  activityDetails: ['공놀이 15분', '노즈워크 12분', '장난감 놀이 18분'],
  symptomDetails: ['가벼운 헐떡임', '식사 속도 느림', '피곤해 보임'],
})

const LEEYORI_MISSION_HISTORY_RECORDS = generateMissionHistoryRecords({
  idBase: 201,
  mealDetails: ['건식 사료 38g', '건식 사료 40g', '습식 파우치 28g', '건식 사료 42g'],
  poopDetails: ['모래 화장실 정상 변', '정상 변', '소변 잦음', '평소와 다름'],
  walkDetails: ['하네스 적응 산책 7분', '산책 10분', '산책 12분', '산책 15분'],
  activityDetails: ['캣타워 놀이 10분', '레이저 놀이 12분', '장난감 추적 8분'],
  symptomDetails: ['그루밍 증가', '낮잠 시간 증가', '예민한 반응'],
})

const PUNGPUNGI_MISSION_HISTORY_RECORDS = generateMissionHistoryRecords({
  idBase: 301,
  mealDetails: ['사료 95g', '사료 100g', '사료 105g', '사료 110g'],
  poopDetails: ['정상 변', '단단한 변', '정상 변', '평소보다 배변 적음'],
  walkDetails: ['산책 30분', '산책 35분', '산책 40분', '산책 45분'],
  activityDetails: ['공원 놀이 20분', '실내 장난감 놀이 15분', '공놀이 25분'],
  symptomDetails: ['산책 후 헐떡임', '가벼운 기침', '식사량 감소'],
})

const DEFAULT_MISSION_HISTORY_RECORD_MAP = new Map(
  DEFAULT_MISSION_HISTORY_RECORDS.map((record) => [record.id, record]),
)

const LEGACY_DEFAULT_MISSION_HISTORY_RECORD_IDS = new Set(
  [1, 2, 3, ...Array.from({ length: 1000 }, (_, index) => index + 101)],
)

const LEGACY_DEFAULT_MISSION_HISTORY_COLORS = new Set([
  '#ffd1a8',
  '#428fe6',
  '#527ca3',
  '#b9dfe3',
  MEAL_COLOR.toLowerCase(),
  ACTIVITY_COLOR.toLowerCase(),
  WALK_COLOR.toLowerCase(),
  POOP_COLOR.toLowerCase(),
  SYMPTOM_COLOR.toLowerCase(),
])

function getMissionHistoryStorageKey() {
  return `${getUserScopedStorageKey(MISSION_HISTORY_RECORDS_STORAGE_KEY)}.${readSelectedPetProfileId()}`
}

function getDefaultMissionHistoryRecords() {
  const selectedPetId = readSelectedPetProfileId()

  if (selectedPetId === 1) return LEEYORI_MISSION_HISTORY_RECORDS
  if (selectedPetId === 2) return PUNGPUNGI_MISSION_HISTORY_RECORDS

  return DEFAULT_MISSION_HISTORY_RECORDS
}

function getDefaultMissionHistoryRecordIds() {
  return new Set(getDefaultMissionHistoryRecords().map((record) => record.id))
}

function getDefaultMissionHistoryRecordMap() {
  return new Map(getDefaultMissionHistoryRecords().map((record) => [record.id, record]))
}

function isMissionHistoryRecord(record: unknown): record is MissionHistoryRecord {
  if (!record || typeof record !== 'object') return false

  const candidate = record as Partial<MissionHistoryRecord>

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.title === 'string' &&
    typeof candidate.detail === 'string' &&
    typeof candidate.time === 'string' &&
    typeof candidate.color === 'string' &&
    typeof candidate.date === 'string'
  )
}

function normalizeMissionHistoryRecord(record: MissionHistoryRecord): MissionHistoryRecord {
  if (record.source === 'health' || record.title === HEALTH_CHECK_TITLE) {
    const recordWithoutMedia = { ...record }
    delete recordWithoutMedia.media

    return {
      ...recordWithoutMedia,
      title: HEALTH_CHECK_TITLE,
      detail: 'AI 건강 기록',
      source: 'health',
    }
  }

  return record
}

export function readStoredMissionHistoryRecords() {
  if (typeof window === 'undefined') return []

  try {
    const savedValue = window.localStorage.getItem(getMissionHistoryStorageKey())
    if (!savedValue) return []

    const parsedValue = JSON.parse(savedValue)
    if (!Array.isArray(parsedValue)) return []

    return parsedValue.filter(isMissionHistoryRecord).map(normalizeMissionHistoryRecord)
  } catch {
    return []
  }
}

export function readMissionHistoryRecordsWithDefaults() {
  const storedRecords = readStoredMissionHistoryRecords()
  const defaultRecords = getDefaultMissionHistoryRecords()
  const defaultRecordIds = getDefaultMissionHistoryRecordIds()
  const defaultRecordMap = getDefaultMissionHistoryRecordMap()

  if (storedRecords.length === 0) return isCurrentDemoUser() ? defaultRecords : []

  const hasCurrentDefaults = storedRecords.some((record) => defaultRecordIds.has(record.id))
  const hasLegacyDefaults = storedRecords.some(
    (record) =>
      LEGACY_DEFAULT_MISSION_HISTORY_RECORD_IDS.has(record.id) &&
      LEGACY_DEFAULT_MISSION_HISTORY_COLORS.has(record.color.toLowerCase()),
  )

  if (!hasCurrentDefaults && hasLegacyDefaults) {
    const customRecords = storedRecords.filter(
      (record) => !LEGACY_DEFAULT_MISSION_HISTORY_RECORD_IDS.has(record.id),
    )

    return [...defaultRecords, ...customRecords]
  }

  const storedIds = new Set(storedRecords.map((record) => record.id))
  const missingDefaults = defaultRecords.filter((record) => !storedIds.has(record.id))
  const mapped = storedRecords.map(
    (record) => defaultRecordMap.get(record.id) ?? DEFAULT_MISSION_HISTORY_RECORD_MAP.get(record.id) ?? record,
  )

  return [...mapped, ...missingDefaults]
}

export function writeStoredMissionHistoryRecords(records: MissionHistoryRecord[]) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(
    getMissionHistoryStorageKey(),
    JSON.stringify(records.filter((record) => record.source !== 'chat')),
  )
}

export function toMissionHistoryRecord(record: MissionActivityRecord): MissionHistoryRecord {
  return record
}

function getTodayDateKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function getCurrentTime() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

export function writeHealthCheckMissionHistoryRecord(
  detail: string,
  media: MissionHistoryRecord['media'] = [],
) {
  if (typeof window === 'undefined') return null

  const nextRecord: MissionHistoryRecord = {
    id: Date.now(),
    title: HEALTH_CHECK_TITLE,
    detail,
    time: getCurrentTime(),
    color: HEALTH_CHECK_COLOR,
    date: getTodayDateKey(),
    source: 'health',
    media,
  }
  const nextRecords = [nextRecord, ...readMissionHistoryRecordsWithDefaults()].slice(0, 120)

  window.localStorage.setItem(getMissionHistoryStorageKey(), JSON.stringify(nextRecords))
  window.dispatchEvent(new CustomEvent(MISSION_HISTORY_RECORDS_CHANGE_EVENT, { detail: nextRecord }))

  return nextRecord
}
