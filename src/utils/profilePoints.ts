import { isDemoAccount } from './authAccounts'
import { readCurrentUserId } from './userScopedStorage'

export const PROFILE_POINTS_STORAGE_KEY = 'profile-points'
export const COMMUNITY_VOTE_REWARD_CLAIMED_KEY = 'community-vote-reward-claimed'
export const DEFAULT_PROFILE_POINTS = 1200
export const DEFAULT_SIGNUP_PROFILE_POINTS = 0
export const COMMUNITY_VOTE_REWARD_POINTS = 60
export const SIGNUP_WELCOME_REWARD_POINTS = 1000
const SIGNUP_WELCOME_REWARD_PENDING_KEY = 'jibsalife.points.signupWelcome.pending'

export function formatProfilePoints(points: number) {
  return `${points.toLocaleString()}P`
}

function getProfilePointsStorageKey() {
  const currentUserId = readCurrentUserId()
  return currentUserId ? `${PROFILE_POINTS_STORAGE_KEY}.${currentUserId}` : PROFILE_POINTS_STORAGE_KEY
}

function getDefaultProfilePoints() {
  return isDemoAccount(readCurrentUserId()) ? DEFAULT_PROFILE_POINTS : DEFAULT_SIGNUP_PROFILE_POINTS
}

function normalizeUserId(userId: string) {
  return userId.trim().toLowerCase()
}

function getSignupWelcomeRewardPendingKey(userId?: string | null) {
  const normalizedUserId = typeof userId === 'string' ? normalizeUserId(userId) : readCurrentUserId()
  return normalizedUserId
    ? `${SIGNUP_WELCOME_REWARD_PENDING_KEY}.${normalizedUserId}`
    : SIGNUP_WELCOME_REWARD_PENDING_KEY
}

export function readProfilePoints() {
  const storageKey = getProfilePointsStorageKey()
  const savedPoints = window.localStorage.getItem(storageKey)
  const defaultPoints = getDefaultProfilePoints()
  const parsedPoints = savedPoints ? Number(savedPoints) : defaultPoints

  return Number.isFinite(parsedPoints) ? parsedPoints : defaultPoints
}

export function writeProfilePoints(points: number) {
  window.localStorage.setItem(getProfilePointsStorageKey(), String(points))
  window.dispatchEvent(new CustomEvent('profile-points-change', { detail: points }))
}

export function markSignupWelcomeRewardPending(userId: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getSignupWelcomeRewardPendingKey(userId), 'true')
}

export function consumeSignupWelcomeReward() {
  if (typeof window === 'undefined') return null

  const storageKey = getSignupWelcomeRewardPendingKey()
  if (window.localStorage.getItem(storageKey) !== 'true') {
    return null
  }

  window.localStorage.removeItem(storageKey)
  const nextPoints = readProfilePoints() + SIGNUP_WELCOME_REWARD_POINTS
  writeProfilePoints(nextPoints)

  return {
    currentPoints: nextPoints,
    rewardAmount: SIGNUP_WELCOME_REWARD_POINTS,
  }
}

export function readCommunityVoteRewardClaimed() {
  return window.localStorage.getItem(COMMUNITY_VOTE_REWARD_CLAIMED_KEY) === 'true'
}

export function writeCommunityVoteRewardClaimed() {
  window.localStorage.setItem(COMMUNITY_VOTE_REWARD_CLAIMED_KEY, 'true')
}
