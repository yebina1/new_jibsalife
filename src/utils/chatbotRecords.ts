import { getUserScopedStorageKey } from './userScopedStorage'

export type ChatbotRecordCategory = '식사' | '배변' | '증상' | '활동'
export type ChatbotFeedbackType = 'like' | 'dislike'

export type ChatbotRecord = {
  id: string
  date: string
  category: ChatbotRecordCategory
  value: string
  createdAt: string
  walkTime?: string
}

export type ChatbotFeedback = {
  id: string
  messageId: string
  type: ChatbotFeedbackType
  createdAt: string
}

export type ChatbotDataStore = {
  records: ChatbotRecord[]
  feedbacks: ChatbotFeedback[]
}

export const CHATBOT_DATA_STORAGE_KEY = 'jibsalife.chatbot.data'

const EMPTY_CHATBOT_DATA_STORE: ChatbotDataStore = {
  records: [],
  feedbacks: [],
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function buildStorageId(prefix: 'record' | 'feedback') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`
}

function getNow() {
  return new Date()
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function readChatbotDataStore(): ChatbotDataStore {
  if (typeof window === 'undefined') return EMPTY_CHATBOT_DATA_STORE

  try {
    const savedValue = window.localStorage.getItem(getUserScopedStorageKey(CHATBOT_DATA_STORAGE_KEY))
    if (!savedValue) return EMPTY_CHATBOT_DATA_STORE

    const parsedValue = JSON.parse(savedValue)
    const records = Array.isArray(parsedValue?.records)
      ? parsedValue.records.filter((record: unknown): record is ChatbotRecord => (
          isObject(record) &&
          typeof record.id === 'string' &&
          typeof record.date === 'string' &&
          typeof record.category === 'string' &&
          typeof record.value === 'string' &&
          typeof record.createdAt === 'string'
        ))
      : []

    const feedbacks = Array.isArray(parsedValue?.feedbacks)
      ? parsedValue.feedbacks.filter((feedback: unknown): feedback is ChatbotFeedback => (
          isObject(feedback) &&
          typeof feedback.id === 'string' &&
          typeof feedback.messageId === 'string' &&
          (feedback.type === 'like' || feedback.type === 'dislike') &&
          typeof feedback.createdAt === 'string'
        ))
      : []

    return { records, feedbacks }
  } catch {
    return EMPTY_CHATBOT_DATA_STORE
  }
}

function writeChatbotDataStore(nextStore: ChatbotDataStore) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(getUserScopedStorageKey(CHATBOT_DATA_STORAGE_KEY), JSON.stringify(nextStore))
}

export function appendChatbotRecord(
  input: Omit<ChatbotRecord, 'id' | 'date' | 'createdAt'>,
) {
  const now = getNow()
  const nextRecord: ChatbotRecord = {
    id: buildStorageId('record'),
    date: formatDate(now),
    createdAt: now.toISOString(),
    ...input,
  }
  const currentStore = readChatbotDataStore()
  const nextStore: ChatbotDataStore = {
    ...currentStore,
    records: [nextRecord, ...currentStore.records],
  }

  writeChatbotDataStore(nextStore)

  return nextRecord
}

export function upsertChatbotFeedback(
  input: Omit<ChatbotFeedback, 'id' | 'createdAt'>,
) {
  const now = getNow()
  const nextFeedback: ChatbotFeedback = {
    id: buildStorageId('feedback'),
    createdAt: now.toISOString(),
    ...input,
  }
  const currentStore = readChatbotDataStore()
  const nextStore: ChatbotDataStore = {
    ...currentStore,
    feedbacks: [
      nextFeedback,
      ...currentStore.feedbacks.filter((feedback) => feedback.messageId !== input.messageId),
    ],
  }

  writeChatbotDataStore(nextStore)

  return nextFeedback
}
