import { getUserScopedStorageKey } from './userScopedStorage'

export const SAVED_VOTES_KEY = 'jibsalife.community.userVotes'

export type UserVoteItem = {
  id: number
  image: string | null
  label: string
}

export type UserVote = {
  id: number
  title: string
  content: string
  voteType: '사진 투표' | '일반 투표' | 'OX'
  voteDuration: 3 | 7 | 10
  voteItems: UserVoteItem[]
  createdAt: string
}

export function readUserVotes(): UserVote[] {
  try {
    const raw = localStorage.getItem(getUserScopedStorageKey(SAVED_VOTES_KEY))
    return raw ? (JSON.parse(raw) as UserVote[]) : []
  } catch {
    return []
  }
}

export function saveUserVote(vote: UserVote): void {
  try {
    const existing = readUserVotes()
    localStorage.setItem(getUserScopedStorageKey(SAVED_VOTES_KEY), JSON.stringify([vote, ...existing]))
  } catch { /* noop */ }
}

export function deleteUserVote(voteId: number): void {
  try {
    const nextVotes = readUserVotes().filter((vote) => vote.id !== voteId)
    localStorage.setItem(getUserScopedStorageKey(SAVED_VOTES_KEY), JSON.stringify(nextVotes))
  } catch { /* noop */ }
}

export function calcDeadlineText(createdAt: string, voteDuration: number): string {
  const d = new Date(createdAt)
  d.setDate(d.getDate() + voteDuration)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일까지`
}
