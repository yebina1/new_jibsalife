import { getUserScopedStorageKey } from './userScopedStorage'

export type MissionActivityRecord = {
  id: number
  title: string
  detail: string
  time: string
  color: string
  date: string
  source: 'chat'
}

export const MISSION_ACTIVITY_RECORDS_STORAGE_KEY = 'jibsalife.mission.activityRecords'
export const MISSION_ACTIVITY_RECORDS_CHANGE_EVENT = 'mission-activity-records-change'

const ACTIVITY_TITLE = '활동 기록'
const ACTIVITY_COLOR = '#428fe6'
const MEAL_TITLE = '식사 기록'
const MEAL_COLOR = '#ffd1a8'
const MEAL_KEYWORDS = ['밥', '사료', '간식', '식사']
const SYMPTOM_TITLE = '증상 기록'
const SYMPTOM_COLOR = '#b9dfe3'
const POOP_TITLE = '배변 기록'
const POOP_COLOR = '#527ca3'
const SYMPTOM_KEYWORDS = [
  '식욕 감소',
  '물을 평소보다 많이 마심',
  '물 많이 마심',
  '밥 거부',
  '급하게 먹음',
  '체중 감소',
  '체중 증가',
  '활동량 감소',
  '무기력',
  '잠만 잠',
  '숨기 행동 증가',
  '공격성 증가',
  '불안 행동',
  '평소보다 예민함',
  '보호자 반응 감소',
  '기침',
  '재채기',
  '숨 가쁨',
  '숨가쁨',
  '헐떡임 증가',
  '헐떡임',
  '헐떡',
  '코 분비물',
  '이상 호흡음',
  '털 빠짐 증가',
  '털빠짐 증가',
  '피부 발진',
  '가려움',
  '귀 긁기',
  '눈물 증가',
  '눈 충혈',
  '입 냄새 심화',
  '입냄새 심화',
  '피부 붉어짐',
  '절뚝거림',
  '계단 거부',
  '산책 거부',
  '관절 뻣뻣함',
  '점프 안 함',
  '점프 안함',
  '통증 반응',
]
const POOP_KEYWORDS = [
  '구토',
  '설사',
  '혈변',
  '변비',
  '배변 횟수 증가',
  '배변횟수 증가',
  '배변 실수',
  '배변실수',
  '소변 색 변화',
  '소변색 변화',
  '소변 냄새 변화',
  '소변냄새 변화',
]
let recordSequence = 0

function getTodayDateKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function getCurrentTime() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

export function readMissionActivityRecords(): MissionActivityRecord[] {
  if (typeof window === 'undefined') return []

  try {
    const savedValue = window.localStorage.getItem(getUserScopedStorageKey(MISSION_ACTIVITY_RECORDS_STORAGE_KEY))
    if (!savedValue) return []

    const parsedValue = JSON.parse(savedValue)
    if (!Array.isArray(parsedValue)) return []

    return parsedValue.filter((record): record is MissionActivityRecord => (
      typeof record?.id === 'number' &&
      typeof record.title === 'string' &&
      typeof record.detail === 'string' &&
      typeof record.time === 'string' &&
      typeof record.color === 'string' &&
      typeof record.date === 'string' &&
      record.source === 'chat'
    ))
  } catch {
    return []
  }
}

function writeMissionRecord(title: string, detail: string, color: string) {
  if (typeof window === 'undefined') return null

  recordSequence = (recordSequence + 1) % 1000
  const nextRecord: MissionActivityRecord = {
    id: Date.now() * 1000 + recordSequence,
    title,
    detail,
    time: getCurrentTime(),
    color,
    date: getTodayDateKey(),
    source: 'chat',
  }
  const nextRecords = [nextRecord, ...readMissionActivityRecords()].slice(0, 100)

  window.localStorage.setItem(getUserScopedStorageKey(MISSION_ACTIVITY_RECORDS_STORAGE_KEY), JSON.stringify(nextRecords))
  window.dispatchEvent(new CustomEvent(MISSION_ACTIVITY_RECORDS_CHANGE_EVENT, { detail: nextRecord }))

  return nextRecord
}

export function writeMissionActivityRecord(detail: string) {
  return writeMissionRecord(ACTIVITY_TITLE, detail, ACTIVITY_COLOR)
}

export function writeMissionMealRecord(detail: string) {
  return writeMissionRecord(MEAL_TITLE, detail, MEAL_COLOR)
}

export function writeMissionSymptomRecord(detail: string) {
  return writeMissionRecord(SYMPTOM_TITLE, detail, SYMPTOM_COLOR)
}

export function writeMissionPoopRecord(detail: string) {
  return writeMissionRecord(POOP_TITLE, detail, POOP_COLOR)
}

export function parseWalkActivityDetail(message: string) {
  const normalizedMessage = message.replace(/\s+/g, ' ').trim()
  if (!/산책/.test(normalizedMessage)) return null

  const hourMinuteMatch = normalizedMessage.match(/(\d+)\s*시간\s*(\d+)?\s*분?/)
  if (hourMinuteMatch) {
    const hours = Number(hourMinuteMatch[1])
    const minutes = hourMinuteMatch[2] ? Number(hourMinuteMatch[2]) : 0
    const totalMinutes = hours * 60 + minutes
    if (totalMinutes > 0) return `산책 ${totalMinutes}분`
  }

  const rangeMinuteMatch = normalizedMessage.match(/(\d+)\s*[-~]\s*(\d+)\s*분/)
  if (rangeMinuteMatch) {
    return `산책 ${rangeMinuteMatch[1]}-${rangeMinuteMatch[2]}분`
  }

  const minuteMatch = normalizedMessage.match(/(\d+)\s*분/)
  if (minuteMatch) {
    return `산책 ${Number(minuteMatch[1])}분`
  }

  return null
}

export function parseMealRecordDetail(message: string) {
  const normalizedMessage = message.replace(/\s+/g, ' ').trim()
  const keyword = MEAL_KEYWORDS.find((item) => normalizedMessage.includes(item))
  if (!keyword) return null

  const gramMatch = normalizedMessage.match(/(\d+(?:\.\d+)?)\s*(g|G|그램)/)
  if (gramMatch) {
    const amount = Number(gramMatch[1])
    if (amount > 0) return `${keyword} ${gramMatch[1]}g`
  }

  const countMatch = normalizedMessage.match(/(\d+)\s*개/)
  if (countMatch) {
    const amount = Number(countMatch[1])
    if (amount > 0) return `${keyword} ${amount}개`
  }

  return null
}

export function parseSymptomRecordDetail(message: string) {
  const normalizedMessage = message.replace(/\s+/g, ' ').trim()
  const compactMessage = normalizedMessage.replace(/\s+/g, '')
  const matchedSymptoms = SYMPTOM_KEYWORDS.filter((keyword) => {
    if (normalizedMessage.includes(keyword)) return true

    return compactMessage.includes(keyword.replace(/\s+/g, ''))
  })

  const uniqueSymptoms = [...new Set(matchedSymptoms.map((symptom) => (
    symptom === '숨가쁨'
      ? '숨 가쁨'
      : symptom === '털빠짐 증가'
        ? '털 빠짐 증가'
        : symptom === '입냄새 심화'
          ? '입 냄새 심화'
          : symptom === '점프 안함'
            ? '점프 안 함'
            : symptom
  )))]

  const filteredSymptoms = uniqueSymptoms.filter((symptom) => (
    !uniqueSymptoms.some((otherSymptom) => (
      otherSymptom !== symptom && otherSymptom.includes(symptom)
    ))
  ))

  if (filteredSymptoms.length === 0) return null

  return filteredSymptoms.join(', ')
}

export function parsePoopRecordDetail(message: string) {
  const normalizedMessage = message.replace(/\s+/g, ' ').trim()
  const compactMessage = normalizedMessage.replace(/\s+/g, '')
  const matchedPoopRecords = POOP_KEYWORDS.filter((keyword) => {
    if (normalizedMessage.includes(keyword)) return true

    return compactMessage.includes(keyword.replace(/\s+/g, ''))
  })

  const uniquePoopRecords = [...new Set(matchedPoopRecords.map((record) => (
    record === '배변횟수 증가'
      ? '배변 횟수 증가'
      : record === '배변실수'
        ? '배변 실수'
        : record === '소변색 변화'
          ? '소변 색 변화'
          : record === '소변냄새 변화'
            ? '소변 냄새 변화'
            : record
  )))]

  if (uniquePoopRecords.length === 0) return null

  return uniquePoopRecords.join(', ')
}
