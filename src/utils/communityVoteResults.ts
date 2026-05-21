import { getUserScopedStorageKey } from './userScopedStorage'

const COMMUNITY_VOTE_RESULTS_KEY = 'jibsalife.community.voteResults'

export type CommunityVoteResults = Record<number, Record<number, number>>

export function readCommunityVoteResults(): CommunityVoteResults {
  try {
    const raw = localStorage.getItem(getUserScopedStorageKey(COMMUNITY_VOTE_RESULTS_KEY))
    return raw ? (JSON.parse(raw) as CommunityVoteResults) : {}
  } catch {
    return {}
  }
}

export function writeCommunityVoteResults(results: CommunityVoteResults): void {
  try {
    localStorage.setItem(getUserScopedStorageKey(COMMUNITY_VOTE_RESULTS_KEY), JSON.stringify(results))
  } catch { /* noop */ }
}

export function addCommunityVoteResult(voteId: number, optionId: number): CommunityVoteResults {
  const current = readCommunityVoteResults()
  const voteResults = current[voteId] ?? {}
  const next = {
    ...current,
    [voteId]: {
      ...voteResults,
      [optionId]: (voteResults[optionId] ?? 0) + 1,
    },
  }
  writeCommunityVoteResults(next)
  return next
}

export function deleteCommunityVoteResults(voteId: number): CommunityVoteResults {
  const current = readCommunityVoteResults()
  const { [voteId]: _deleted, ...next } = current
  writeCommunityVoteResults(next)
  return next
}

export function getVoteTotal(results: Record<number, number> | undefined): number {
  if (!results) return 0
  return Object.values(results).reduce((sum, count) => sum + count, 0)
}

export function getVotePercentage(
  results: Record<number, number> | undefined,
  optionId: number,
) {
  const total = getVoteTotal(results)
  if (total === 0) return 0
  return Math.round(((results?.[optionId] ?? 0) / total) * 100)
}
