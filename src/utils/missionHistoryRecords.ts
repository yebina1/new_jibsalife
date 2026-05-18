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

export const MISSION_HISTORY_RECORDS_STORAGE_KEY = 'jibsalife.mission.historyRecords'
export const MISSION_HISTORY_RECORDS_CHANGE_EVENT = 'mission-history-records-change'
const HEALTH_CHECK_TITLE = '건강 체크 기록'
const HEALTH_CHECK_COLOR = '#A08DFF'

export const DEFAULT_MISSION_HISTORY_RECORDS: MissionHistoryRecord[] = [
  { id: 101, title: '식사 기록', detail: '사료 90g', time: '08:00', color: '#F2B472', date: '2026-05-01' },
  { id: 102, title: '활동 기록', detail: '활발함', time: '13:20', color: '#162447', date: '2026-05-01' },
  { id: 103, title: '산책 기록', detail: '산책 30분', time: '18:40', color: '#A4CE95', date: '2026-05-02' },
  { id: 104, title: '식사 기록', detail: '사료 90g', time: '08:20', color: '#F2B472', date: '2026-05-02' },
  { id: 105, title: '배변 · 배뇨 기록', detail: '정상 변', time: '09:15', color: '#BEE3F8', date: '2026-05-03' },
  { id: 106, title: '배변 · 배뇨 기록', detail: '소변 잦음', time: '16:30', color: '#BEE3F8', date: '2026-05-03' },
  { id: 107, title: '증상 기록', detail: '기침', time: '14:10', color: '#A28BFA', date: '2026-05-04' },
  { id: 108, title: '활동 기록', detail: '보통', time: '17:45', color: '#162447', date: '2026-05-04' },
  { id: 109, title: '식사 기록', detail: '사료 90g', time: '07:50', color: '#F2B472', date: '2026-05-05' },
  { id: 110, title: '증상 기록', detail: '헐떡', time: '18:10', color: '#A28BFA', date: '2026-05-05' },
  { id: 111, title: '활동 기록', detail: '활동 적음', time: '16:46', color: '#162447', date: '2026-05-06' },
  { id: 112, title: '산책 기록', detail: '산책 30분', time: '19:20', color: '#A4CE95', date: '2026-05-06' },
  { id: 113, title: '배변 · 배뇨 기록', detail: '묽은 변', time: '08:40', color: '#BEE3F8', date: '2026-05-12' },
  { id: 114, title: '증상 기록', detail: '무기력', time: '19:36', color: '#A28BFA', date: '2026-05-12' },
  { id: 115, title: '배변 · 배뇨 기록', detail: '평소와 다름', time: '10:10', color: '#BEE3F8', date: '2026-05-13' },
  { id: 116, title: '식사 기록', detail: '사료 90g', time: '16:00', color: '#F2B472', date: '2026-05-13' },
  { id: 117, title: '식사 기록', detail: '사료 120g', time: '08:00', color: '#F2B472', date: '2026-05-13' },
  { id: 118, title: '산책 기록', detail: '산책 30분', time: '18:30', color: '#A4CE95', date: '2026-05-13' },
  { id: 119, title: '배변 · 배뇨 기록', detail: '정상 변', time: '09:30', color: '#BEE3F8', date: '2026-05-13' },
  { id: 120, title: '식사 기록', detail: '사료 120g', time: '08:00', color: '#F2B472', date: '2026-05-14' },
  { id: 121, title: '활동 기록', detail: '활발함', time: '15:00', color: '#162447', date: '2026-05-14' },
  { id: 122, title: '배변 · 배뇨 기록', detail: '정상 변', time: '09:30', color: '#BEE3F8', date: '2026-05-14' },
  { id: 123, title: '식사 기록', detail: '사료 120g', time: '08:00', color: '#F2B472', date: '2026-05-15' },
  { id: 124, title: '활동 기록', detail: '활발함', time: '15:00', color: '#162447', date: '2026-05-15' },
  { id: 125, title: '증상 기록', detail: '재채기', time: '14:00', color: '#A28BFA', date: '2026-05-15' },
  { id: 126, title: '식사 기록', detail: '사료 110g', time: '08:10', color: '#F2B472', date: '2026-05-16' },
  { id: 127, title: '산책 기록', detail: '산책 25분', time: '17:20', color: '#A4CE95', date: '2026-05-16' },
  { id: 128, title: '배변 · 배뇨 기록', detail: '정상 변', time: '09:20', color: '#BEE3F8', date: '2026-05-17' },
  { id: 129, title: '활동 기록', detail: '활동 보통', time: '15:40', color: '#162447', date: '2026-05-17' },
]

const LEEYORI_MISSION_HISTORY_RECORDS: MissionHistoryRecord[] = [
  { id: 201, title: '식사 기록', detail: '건식 사료 42g', time: '07:45', color: '#F2B472', date: '2026-05-01' },
  { id: 202, title: '활동 기록', detail: '캣타워 놀이 12분', time: '13:30', color: '#162447', date: '2026-05-01' },
  { id: 203, title: '배변 · 배뇨 기록', detail: '모래 화장실 정상 변', time: '09:20', color: '#BEE3F8', date: '2026-05-02' },
  { id: 204, title: '식사 기록', detail: '습식 파우치 28g', time: '18:15', color: '#F2B472', date: '2026-05-02' },
  { id: 205, title: '증상 기록', detail: '헤어볼 토함', time: '21:10', color: '#A28BFA', date: '2026-05-03' },
  { id: 206, title: '활동 기록', detail: '낚싯대 놀이 8분', time: '15:40', color: '#162447', date: '2026-05-04' },
  { id: 207, title: '배변 · 배뇨 기록', detail: '소변 잦음', time: '10:05', color: '#BEE3F8', date: '2026-05-05' },
  { id: 208, title: '식사 기록', detail: '건식 사료 38g', time: '19:00', color: '#F2B472', date: '2026-05-06' },
  { id: 209, title: '증상 기록', detail: '귀 주변 긁음', time: '16:25', color: '#A28BFA', date: '2026-05-12' },
  { id: 210, title: '활동 기록', detail: '창가 휴식 많음', time: '17:50', color: '#162447', date: '2026-05-13' },
  { id: 211, title: '산책 기록', detail: '하네스 적응 산책 7분', time: '18:20', color: '#A4CE95', date: '2026-05-13' },
  { id: 212, title: '식사 기록', detail: '사료 120g', time: '08:00', color: '#F2B472', date: '2026-05-13' },
  { id: 213, title: '배변 · 배뇨 기록', detail: '정상 변', time: '09:30', color: '#BEE3F8', date: '2026-05-13' },
  { id: 214, title: '식사 기록', detail: '사료 120g', time: '08:00', color: '#F2B472', date: '2026-05-14' },
  { id: 215, title: '활동 기록', detail: '활발함', time: '15:00', color: '#162447', date: '2026-05-14' },
  { id: 216, title: '배변 · 배뇨 기록', detail: '정상 변', time: '09:30', color: '#BEE3F8', date: '2026-05-14' },
  { id: 217, title: '식사 기록', detail: '사료 120g', time: '08:00', color: '#F2B472', date: '2026-05-15' },
  { id: 218, title: '활동 기록', detail: '활발함', time: '15:00', color: '#162447', date: '2026-05-15' },
  { id: 219, title: '증상 기록', detail: '재채기', time: '14:00', color: '#A28BFA', date: '2026-05-15' },
  { id: 220, title: '식사 기록', detail: '건식 사료 40g', time: '08:10', color: '#F2B472', date: '2026-05-16' },
  { id: 221, title: '산책 기록', detail: '실내 놀이 12분', time: '18:00', color: '#A4CE95', date: '2026-05-16' },
  { id: 222, title: '배변 · 배뇨 기록', detail: '정상 변', time: '09:00', color: '#BEE3F8', date: '2026-05-17' },
  { id: 223, title: '활동 기록', detail: '캣타워 놀이 10분', time: '19:10', color: '#162447', date: '2026-05-17' },
]

const PUNGPUNGI_MISSION_HISTORY_RECORDS: MissionHistoryRecord[] = [
  { id: 301, title: '식사 기록', detail: '사료 95g', time: '08:00', color: '#F2B472', date: '2026-05-01' },
  { id: 302, title: '활동 기록', detail: '공놀이 25분', time: '13:20', color: '#162447', date: '2026-05-01' },
  { id: 303, title: '산책 기록', detail: '산책 35분', time: '18:40', color: '#A4CE95', date: '2026-05-02' },
  { id: 304, title: '식사 기록', detail: '사료 110g', time: '08:20', color: '#F2B472', date: '2026-05-02' },
  { id: 305, title: '배변 · 배뇨 기록', detail: '단단한 변', time: '09:15', color: '#BEE3F8', date: '2026-05-03' },
  { id: 306, title: '배변 · 배뇨 기록', detail: '산책 후 정상 배뇨', time: '16:30', color: '#BEE3F8', date: '2026-05-03' },
  { id: 307, title: '증상 기록', detail: '가벼운 기침', time: '14:10', color: '#A28BFA', date: '2026-05-04' },
  { id: 308, title: '활동 기록', detail: '터그 놀이 18분', time: '17:45', color: '#162447', date: '2026-05-04' },
  { id: 309, title: '식사 기록', detail: '사료 100g', time: '07:50', color: '#F2B472', date: '2026-05-05' },
  { id: 310, title: '증상 기록', detail: '산책 후 헐떡임', time: '18:10', color: '#A28BFA', date: '2026-05-05' },
  { id: 311, title: '활동 기록', detail: '활동 적음', time: '16:46', color: '#162447', date: '2026-05-06' },
  { id: 312, title: '산책 기록', detail: '산책 45분', time: '19:20', color: '#A4CE95', date: '2026-05-06' },
  { id: 313, title: '배변 · 배뇨 기록', detail: '묽은 변', time: '08:40', color: '#BEE3F8', date: '2026-05-12' },
  { id: 314, title: '증상 기록', detail: '식욕 감소', time: '19:36', color: '#A28BFA', date: '2026-05-12' },
  { id: 315, title: '배변 · 배뇨 기록', detail: '평소보다 배변 적음', time: '10:10', color: '#BEE3F8', date: '2026-05-13' },
  { id: 316, title: '식사 기록', detail: '사료 80g', time: '16:00', color: '#F2B472', date: '2026-05-13' },
  { id: 317, title: '식사 기록', detail: '사료 120g', time: '08:00', color: '#F2B472', date: '2026-05-13' },
  { id: 318, title: '산책 기록', detail: '산책 30분', time: '18:30', color: '#A4CE95', date: '2026-05-13' },
  { id: 319, title: '배변 · 배뇨 기록', detail: '정상 변', time: '09:30', color: '#BEE3F8', date: '2026-05-13' },
  { id: 320, title: '식사 기록', detail: '사료 120g', time: '08:00', color: '#F2B472', date: '2026-05-14' },
  { id: 321, title: '활동 기록', detail: '활발함', time: '15:00', color: '#162447', date: '2026-05-14' },
  { id: 322, title: '배변 · 배뇨 기록', detail: '정상 변', time: '09:30', color: '#BEE3F8', date: '2026-05-14' },
  { id: 323, title: '식사 기록', detail: '사료 120g', time: '08:00', color: '#F2B472', date: '2026-05-15' },
  { id: 324, title: '활동 기록', detail: '활발함', time: '15:00', color: '#162447', date: '2026-05-15' },
  { id: 325, title: '증상 기록', detail: '재채기', time: '14:00', color: '#A28BFA', date: '2026-05-15' },
  { id: 326, title: '식사 기록', detail: '사료 105g', time: '08:15', color: '#F2B472', date: '2026-05-16' },
  { id: 327, title: '산책 기록', detail: '산책 35분', time: '17:10', color: '#A4CE95', date: '2026-05-16' },
  { id: 328, title: '배변 · 배뇨 기록', detail: '정상 변', time: '09:25', color: '#BEE3F8', date: '2026-05-17' },
  { id: 329, title: '활동 기록', detail: '활동 좋음', time: '16:10', color: '#162447', date: '2026-05-17' },
]

const DEFAULT_MISSION_HISTORY_RECORD_MAP = new Map(
  DEFAULT_MISSION_HISTORY_RECORDS.map((record) => [record.id, record]),
)
const LEGACY_DEFAULT_MISSION_HISTORY_RECORD_IDS = new Set([
  1,
  2,
  3,
  101,
  102,
  103,
  104,
  105,
  106,
  107,
])
const LEGACY_DEFAULT_MISSION_HISTORY_COLORS = new Set([
  '#ffd1a8',
  '#428fe6',
  '#527ca3',
  '#b9dfe3',
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

  const hasCurrentDefaults = storedRecords.some((record) =>
    defaultRecordIds.has(record.id)
  )
  const hasLegacyDefaults = storedRecords.some((record) =>
    LEGACY_DEFAULT_MISSION_HISTORY_RECORD_IDS.has(record.id) &&
    LEGACY_DEFAULT_MISSION_HISTORY_COLORS.has(record.color.toLowerCase())
  )

  if (!hasCurrentDefaults && hasLegacyDefaults) {
    const customRecords = storedRecords.filter(
      (record) => !LEGACY_DEFAULT_MISSION_HISTORY_RECORD_IDS.has(record.id),
    )

    return [...defaultRecords, ...customRecords]
  }

  const storedIds = new Set(storedRecords.map((r) => r.id))
  const missingDefaults = defaultRecords.filter((r) => !storedIds.has(r.id))
  const mapped = storedRecords.map((record) =>
    defaultRecordMap.get(record.id) ?? DEFAULT_MISSION_HISTORY_RECORD_MAP.get(record.id) ?? record
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
