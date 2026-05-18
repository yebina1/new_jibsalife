export const communityVoteStatusChangedEvent = 'jibsalife:community-vote-status-changed'

const votedIdsStorageKey = 'jibsalife.community.votedMissionIds'
const legacyVotedIdsStorageKey = 'jibsalife.community.missionVotedIds'

function getLegacyVotedItemStorageKey(voteId: string) {
  return `jibsalife.community.missionVoted.${voteId}`
}

function parseSavedIds(value: string | null) {
  const parsed = value ? JSON.parse(value) : []
  return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
}

export function readVotedMissionIds() {
  if (typeof window === 'undefined') return []

  try {
    const savedIds = parseSavedIds(window.localStorage.getItem(votedIdsStorageKey))
    const legacyIds = parseSavedIds(window.localStorage.getItem(legacyVotedIdsStorageKey))
    const legacyItemIds = ['mission', 'subscriber'].filter(
      (id) => window.localStorage.getItem(getLegacyVotedItemStorageKey(id)) === 'true',
    )

    return Array.from(new Set([...savedIds, ...legacyIds, ...legacyItemIds]))
  } catch {
    return []
  }
}

export function hasVotedMission(voteId: string) {
  return readVotedMissionIds().includes(voteId)
}

export function writeVotedMissionId(voteId: string) {
  if (typeof window === 'undefined') return

  const current = readVotedMissionIds()
  const next = current.includes(voteId) ? current : [...current, voteId]

  window.localStorage.setItem(votedIdsStorageKey, JSON.stringify(next))
  window.dispatchEvent(new Event(communityVoteStatusChangedEvent))
}

const votedCandidatesStorageKey = 'jibsalife.community.votedCandidates'

export function readVotedCandidate(voteId: string): number | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = window.localStorage.getItem(votedCandidatesStorageKey)
    const parsed = saved ? JSON.parse(saved) : {}
    const val = parsed[voteId]
    return typeof val === 'number' ? val : null
  } catch {
    return null
  }
}

export function writeVotedCandidate(voteId: string, candidateId: number) {
  if (typeof window === 'undefined') return
  try {
    const saved = window.localStorage.getItem(votedCandidatesStorageKey)
    const parsed = saved ? JSON.parse(saved) : {}
    parsed[voteId] = candidateId
    window.localStorage.setItem(votedCandidatesStorageKey, JSON.stringify(parsed))
  } catch {
    // localStorage can fail in private browsing or when storage is full.
  }
}
