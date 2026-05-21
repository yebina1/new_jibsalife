import { AUTH_CURRENT_USER_STORAGE_KEY, isDemoAccount } from './authAccounts'
import { readVotedMissionIds } from './communityVoteStatus'
import { getCommunityCreatedPostsStorageKey } from './communityCreatedPosts'

export const CHALLENGE_STATUS_CHANGED_EVENT = 'challenge-status-changed'

export const CURRENT_DAY_KEY = 'jibsalife.challenge.currentDay'
const TOTAL_DAYS = 7

const WALK_RECORDED_KEY = 'jibsalife.challenge.walkRecorded'
const COMMENT_COUNT_KEY = 'jibsalife.challenge.commentCount'
const VOTE_COMPLETED_KEY = 'jibsalife.challenge.voteCompleted'
const HEALTH_REPORT_KEY = 'jibsalife.challenge.healthReportViewed'
const KNOWLEDGE_LIKED_KEY = 'jibsalife.challenge.knowledgeLiked'
const MEAL_RECORDED_KEY = 'jibsalife.challenge.mealRecorded'
const PARTICIPATED_DAYS_KEY = 'jibsalife.challenge.participatedDays'

function getCurrentUserId() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(AUTH_CURRENT_USER_STORAGE_KEY)
}

function getChallengeStorageKey(key: string) {
  const currentUserId = getCurrentUserId()
  return currentUserId ? `${key}.${currentUserId}` : key
}

export function isDemoChallengeAccount() {
  return isDemoAccount(getCurrentUserId())
}

function getDefaultCurrentDay() {
  return isDemoChallengeAccount() ? 2 : 0
}

function getDefaultCompletedDayCutoff() {
  return isDemoChallengeAccount() ? 2 : 0
}

function todayKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function dispatch() {
  window.dispatchEvent(new CustomEvent(CHALLENGE_STATUS_CHANGED_EVENT))
}

function readClaimedChallengeDays() {
  try {
    const stored = typeof window !== 'undefined'
      ? window.localStorage.getItem(getChallengeStorageKey(PARTICIPATED_DAYS_KEY))
      : null
    const parsed = stored ? JSON.parse(stored) : []
    return new Set<number>(Array.isArray(parsed) ? parsed.filter((day) => typeof day === 'number') : [])
  } catch {
    return new Set<number>()
  }
}

export function readCurrentDay(): number {
  try {
    const stored = typeof window !== 'undefined'
      ? window.localStorage.getItem(getChallengeStorageKey(CURRENT_DAY_KEY))
      : null
    if (stored !== null) {
      const parsed = parseInt(stored, 10)
      if (Number.isFinite(parsed) && parsed >= 0 && parsed < TOTAL_DAYS) return parsed
    }
  } catch {
    // Fall through to the account-specific default.
  }

  return getDefaultCurrentDay()
}

export function saveCurrentDay(day: number) {
  if (typeof window === 'undefined') return
  const normalizedDay = Math.min(Math.max(day, 0), TOTAL_DAYS - 1)
  window.localStorage.setItem(getChallengeStorageKey(CURRENT_DAY_KEY), String(normalizedDay))
}

export function markWalkRecorded() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getChallengeStorageKey(WALK_RECORDED_KEY), 'true')
  dispatch()
}

function checkDay0(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(getChallengeStorageKey(WALK_RECORDED_KEY)) === 'true'
}

export function incrementChallengeCommentCount() {
  if (typeof window === 'undefined') return
  const today = todayKey()
  let count = 0

  try {
    const stored = window.localStorage.getItem(getChallengeStorageKey(COMMENT_COUNT_KEY))
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.date === today) count = parsed.count
    }
  } catch {
    // Keep count at zero.
  }

  window.localStorage.setItem(getChallengeStorageKey(COMMENT_COUNT_KEY), JSON.stringify({ date: today, count: count + 1 }))
  dispatch()
}

function checkDay1(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const stored = window.localStorage.getItem(getChallengeStorageKey(COMMENT_COUNT_KEY))
    if (!stored) return false
    const parsed = JSON.parse(stored)
    return parsed.date === todayKey() && parsed.count >= 3
  } catch {
    return false
  }
}

export function markChallengeVoteCompleted() {
  if (typeof window === 'undefined') return false
  const today = todayKey()
  const storageKey = getChallengeStorageKey(VOTE_COMPLETED_KEY)
  const isNewCompletion = window.localStorage.getItem(storageKey) !== today

  window.localStorage.setItem(storageKey, today)
  dispatch()

  return isNewCompletion
}

function checkDay2(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(getChallengeStorageKey(VOTE_COMPLETED_KEY)) === todayKey() || readVotedMissionIds().length > 0
}

export function markHealthReportViewed() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getChallengeStorageKey(HEALTH_REPORT_KEY), todayKey())
  dispatch()
}

function checkDay3(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(getChallengeStorageKey(HEALTH_REPORT_KEY)) === todayKey()
}

export function markKnowledgeLiked() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getChallengeStorageKey(KNOWLEDGE_LIKED_KEY), 'true')
  dispatch()
}

function checkDay4(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(getChallengeStorageKey(KNOWLEDGE_LIKED_KEY)) === 'true'
}

export function markMealRecorded() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getChallengeStorageKey(MEAL_RECORDED_KEY), 'true')
  dispatch()
}

function checkDay5(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(getChallengeStorageKey(MEAL_RECORDED_KEY)) === 'true'
}

function checkDay6(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const stored = window.localStorage.getItem(getCommunityCreatedPostsStorageKey())
    if (!stored) return false
    const posts = JSON.parse(stored)
    return Array.isArray(posts) && posts.length > 0
  } catch {
    return false
  }
}

const checks = [checkDay0, checkDay1, checkDay2, checkDay3, checkDay4, checkDay5, checkDay6]

export function calculateChallengeRewardPoints(): number {
  const currentDay = getCurrentChallengeDay()

  try {
    const claimed = readClaimedChallengeDays()
    const defaultCompletedCutoff = getDefaultCompletedDayCutoff()
    let consecutive = 0

    for (let i = currentDay - 1; i >= 0; i--) {
      if (i < defaultCompletedCutoff || claimed.has(i)) consecutive++
      else break
    }

    const completingDay = consecutive + 1
    if (completingDay === 7) return 360
    if (completingDay === 3) return 160
  } catch {
    // Fall through to the base reward.
  }

  return 60
}

export function claimChallengeDay(day: number) {
  if (typeof window === 'undefined') return

  try {
    const storageKey = getChallengeStorageKey(PARTICIPATED_DAYS_KEY)
    const stored = window.localStorage.getItem(storageKey)
    const claimed: number[] = stored ? JSON.parse(stored) : []

    if (!claimed.includes(day)) {
      window.localStorage.setItem(storageKey, JSON.stringify([...claimed, day]))
    }
  } catch {
    // Ignore malformed local state.
  }
}

export function getCurrentChallengeDay(): number {
  try {
    const claimed = readClaimedChallengeDays()

    for (let i = getDefaultCompletedDayCutoff(); i < checks.length; i++) {
      if (!claimed.has(i)) return i
    }
  } catch {
    // Fall through to the account-specific default.
  }

  return getDefaultCurrentDay()
}

export function checkChallengeDayDone(dayIndex: number): boolean {
  return checks[dayIndex]?.() ?? false
}

export function isChallengeDayClaimed(dayIndex: number): boolean {
  return readClaimedChallengeDays().has(dayIndex)
}
