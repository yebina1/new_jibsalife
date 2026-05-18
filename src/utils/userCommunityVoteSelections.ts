import { getUserScopedStorageKey } from './userScopedStorage'

const USER_COMMUNITY_VOTE_SELECTIONS_KEY = 'jibsalife.community.userVoteSelections'

export type UserCommunityVoteSelections = Record<number, number>

export function readUserCommunityVoteSelections(): UserCommunityVoteSelections {
  try {
    const raw = localStorage.getItem(getUserScopedStorageKey(USER_COMMUNITY_VOTE_SELECTIONS_KEY))
    return raw ? (JSON.parse(raw) as UserCommunityVoteSelections) : {}
  } catch {
    return {}
  }
}

export function writeUserCommunityVoteSelections(selections: UserCommunityVoteSelections): void {
  try {
    localStorage.setItem(getUserScopedStorageKey(USER_COMMUNITY_VOTE_SELECTIONS_KEY), JSON.stringify(selections))
  } catch { /* noop */ }
}

export function deleteUserCommunityVoteSelection(voteId: number): UserCommunityVoteSelections {
  const current = readUserCommunityVoteSelections()
  const { [voteId]: _deleted, ...next } = current
  writeUserCommunityVoteSelections(next)
  return next
}
