import dogStarBanner from '../../img/2026_05_3weeks_vote/2026_05_3_weeks_dog_star_vote.png'
import dogStarVote1 from '../../img/2026_05_3weeks_vote/2026_05_3weeks_vote_1.jpg'
import dogStarVote2 from '../../img/2026_05_3weeks_vote/2026_05_3weeks_vote_2.jpg'
import dogStarVote3 from '../../img/2026_05_3weeks_vote/2026_05_3weeks_vote_3.jpg'
import dogStarVote4 from '../../img/2026_05_3weeks_vote/2026_05_3weeks_vote_4.jpg'
import dogStarVote5 from '../../img/2026_05_3weeks_vote/2026_05_3weeks_vote_5.jpg'
import dogStarVote6 from '../../img/2026_05_3weeks_vote/2026_05_3weeks_vote_6.jpg'
import bestPoseBanner from '../../img/vote/pose_vote/best_pose_vote.png'
import poseVote1 from '../../img/vote/pose_vote/pose_vote1.png'
import poseVote2 from '../../img/vote/pose_vote/pose_vote2.png'
import poseVote3 from '../../img/vote/pose_vote/pose_vote3.png'
import poseVote4 from '../../img/vote/pose_vote/pose_vote4.png'
import poseVote5 from '../../img/vote/pose_vote/pose_vote5.png'
import poseVote6 from '../../img/vote/pose_vote/pose_vote6.png'
import birthPhoto1 from '../../img/birth-01.png'
import birthPhoto2 from '../../img/birth-02.png'

export type CommunityVoteId = 'mission' | 'subscriber' | 'best-pose'

type VoteCandidate = {
  id: number
  name: string
  image: string
  objectPosition?: string
}

export type MissionVote = {
  id: CommunityVoteId
  sectionTitle: string
  title: string
  participants: number
  timeText: string
  organizer: string
  buttonType?: 'vote' | 'notify' | 'result'
  subText?: string
}

export type DefaultVoteOption = {
  id: number
  label: string
  color?: string
  image?: string
  icon?: string
  percentage?: number
  votes?: number
}

export type RegularVoteItem = {
  id: number
  title: string
  description: string
  deadline: string
  participants: number
  voteType: 'photo' | 'ox' | 'bone-result'
  options: DefaultVoteOption[]
  modified?: boolean
  done?: boolean
  resultOnly?: boolean
}

export type VoteDetail = {
  id: CommunityVoteId
  timeText: string
  bannerTitleLines: string[]
  bannerDescription: string
  bannerBackgroundColor: string
  bannerImage: string
  candidates: readonly VoteCandidate[]
}

export const missionVotes: MissionVote[] = [
  {
    id: 'best-pose',
    sectionTitle: '멍스터 미션 투표',
    title: '이달의 BEST 포즈상',
    participants: 22,
    timeText: '7시간 남음',
    organizer: '운영자',
  },
  {
    id: 'subscriber',
    sectionTitle: '멍스터 미션 투표',
    title: '집사일기 멍스타 모델 도전하기',
    participants: 10,
    timeText: '02:18:35 남음',
    organizer: '운영자',
    buttonType: 'notify',
    subText: '선착순 6명 지정 오픈 예정',
  },
]

export const regularVoteItems: RegularVoteItem[] = [
  {
    id: 1,
    title: '이번 생일파티 때 찍은 사진 골라주세요',
    description: '우리 꼬미 어떤 사진이 더 귀여울까요?',
    deadline: '2026년 7월 30일까지',
    participants: 325984,
    voteType: 'photo',
    modified: true,
    options: [
      { id: 1, label: '생일파티 실내 사진', color: '#FFD6D9', image: birthPhoto1, votes: 65197 },
      { id: 2, label: '생일파티 실외 사진', color: '#C7E9F8', image: birthPhoto2, votes: 260787 },
    ],
  },
  {
    id: 2,
    title: '반려동물은 보호자 퇴근 시간을 기억한다?',
    description: '',
    deadline: '2026년 7월 30일까지',
    participants: 325984,
    voteType: 'ox',
    options: [
      { id: 1, label: 'O', votes: 221670 },
      { id: 2, label: 'X', votes: 104314 },
    ],
  },
  {
    id: 3,
    title: '좋아하는 간식 재료는?',
    description: '',
    deadline: '2026년 7월 30일까지',
    participants: 325984,
    voteType: 'bone-result',
    options: [
      { id: 1, label: '닭가슴살', votes: 130394, icon: '🍗' },
      { id: 2, label: '고구마', votes: 195590, icon: '🍠' },
    ],
  },
]

const dogStarCandidates = [
  { id: 1, name: '콩이', image: dogStarVote1 },
  { id: 2, name: '공심이', image: dogStarVote2 },
  { id: 3, name: '뽀뽀', image: dogStarVote3 },
  { id: 4, name: '도라', image: dogStarVote4 },
  { id: 5, name: '봉이', image: dogStarVote5 },
  { id: 6, name: '바둑이', image: dogStarVote6 },
] as const

const poseCandidates = [
  { id: 1, name: '쿠키', image: poseVote1 },
  { id: 2, name: '몽두', image: poseVote2 },
  { id: 3, name: '해피', image: poseVote3 },
  { id: 4, name: '다운이', image: poseVote4 },
  { id: 5, name: '보이', image: poseVote5 },
  { id: 6, name: '바둑이', image: poseVote6 },
] as const

export const voteDetails: VoteDetail[] = [
  {
    id: 'mission',
    timeText: '7시간 남음',
    bannerTitleLines: ['5월 3주차', '멍스터 미션 투표'],
    bannerDescription: '밥 먹는 사진 중 BEST를 골라주세요!',
    bannerBackgroundColor: '#FFE9BB',
    bannerImage: dogStarBanner,
    candidates: dogStarCandidates,
  },
  {
    id: 'subscriber',
    timeText: '7시간 남음',
    bannerTitleLines: ['5월 3주차', '멍스터 도전하기'],
    bannerDescription: '우리 아이도 멍스터 시간에 도전해보세요!',
    bannerBackgroundColor: '#FFE9BB',
    bannerImage: dogStarBanner,
    candidates: dogStarCandidates,
  },
  {
    id: 'best-pose',
    timeText: '7시간 남음',
    bannerTitleLines: ['이달의', 'Best 포즈상'],
    bannerDescription: '포즈가 돋보이는 BEST를 골라주세요!',
    bannerBackgroundColor: '#A7D8F8',
    bannerImage: bestPoseBanner,
    candidates: poseCandidates,
  },
]
