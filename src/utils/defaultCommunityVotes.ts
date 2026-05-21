import { getUserScopedStorageKey } from './userScopedStorage'

const DEFAULT_COMMUNITY_VOTES_KEY = 'jibsalife.community.defaultVoteSelections'

export type DefaultCommunityVoteSelections = Record<number, number>

export function readDefaultCommunityVotes(): DefaultCommunityVoteSelections {
  try {
    const raw = localStorage.getItem(getUserScopedStorageKey(DEFAULT_COMMUNITY_VOTES_KEY))
    return raw ? (JSON.parse(raw) as DefaultCommunityVoteSelections) : {}
  } catch {
    return {}
  }
}

export function writeDefaultCommunityVotes(selections: DefaultCommunityVoteSelections): void {
  try {
    localStorage.setItem(getUserScopedStorageKey(DEFAULT_COMMUNITY_VOTES_KEY), JSON.stringify(selections))
  } catch { /* noop */ }
}
