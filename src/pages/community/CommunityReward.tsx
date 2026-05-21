import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import PageHeader from '../../components/PageHeader'
import Title from '../../components/Title'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import ConfettiEffect from '../../components/effect/ConfettiEffect'
import RewardHero from '../../components/RewardHero'
import RewardPointCard from '../../components/RewardPointCard'
import {
  addCompletedChallengeCardId,
  APPLIED_REWARD_EVENTS_STORAGE_KEY,
  CHALLENGE_REWARD_CLAIMED_STORAGE_KEY,
} from '../../constants/points'
import { readProfilePoints, writeProfilePoints } from '../../utils/profilePoints'
import './CommunityReward.css'

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.25" y="9" width="15.5" height="10.75" rx="1.9" />
      <path d="M3.5 8.9h17v3.2h-17z" />
      <path d="M12 8.9v10.85" />
      <path d="M12 8.9H9.1a2.15 2.15 0 1 1 0-4.3c1.67 0 2.9 1.76 2.9 4.3Z" />
      <path d="M12 8.9h2.9a2.15 2.15 0 1 0 0-4.3c-1.67 0-2.9 1.76-2.9 4.3Z" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20.2 5.2 13.8a4.55 4.55 0 0 1 6.43-6.43L12 7.74l.37-.37a4.55 4.55 0 1 1 6.43 6.43Z" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 5.2 1.86 3.78 4.17.6-3.01 2.93.71 4.14L12 14.72l-3.73 1.95.71-4.14-3.01-2.93 4.17-.6Z" />
    </svg>
  )
}

function CommunityReward() {
  const [currentPoints, setCurrentPoints] = useState(() => readProfilePoints())
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const rewardAmount = Number(searchParams.get('amount') ?? '60')
  const isChallengeRewardClaim = [60, 160, 360].includes(rewardAmount)
  const rewardEventId =
    typeof location.state === 'object' && location.state && 'rewardEventId' in location.state
      ? String(location.state.rewardEventId)
      : undefined
  const rewardSourceItemId =
    typeof location.state === 'object' && location.state && 'rewardSourceItemId' in location.state
      ? Number(location.state.rewardSourceItemId)
      : undefined

  const readAppliedRewardEvents = () => {
    try {
      const saved = window.localStorage.getItem(APPLIED_REWARD_EVENTS_STORAGE_KEY)
      const parsed = saved ? (JSON.parse(saved) as string[]) : []
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
    } catch {
      return []
    }
  }

  const applyReward = () => {
    // 챌린지 보상: rewardEventId 없이 claimed 키로 중복 방지
    if (isChallengeRewardClaim) {
      const alreadyClaimed = window.localStorage.getItem(CHALLENGE_REWARD_CLAIMED_STORAGE_KEY) === 'true'
      if (alreadyClaimed) return readProfilePoints()
      const nextPoints = readProfilePoints() + Math.max(0, rewardAmount)
      writeProfilePoints(nextPoints)
      return nextPoints
    }

    // 투표/기타 보상: rewardEventId로 중복 방지
    if (!rewardEventId) return readProfilePoints()

    const appliedRewardEvents = readAppliedRewardEvents()
    if (appliedRewardEvents.includes(rewardEventId)) return readProfilePoints()

    const nextPoints = readProfilePoints() + Math.max(0, rewardAmount)
    writeProfilePoints(nextPoints)
    window.localStorage.setItem(
      APPLIED_REWARD_EVENTS_STORAGE_KEY,
      JSON.stringify([...appliedRewardEvents, rewardEventId].slice(-30)),
    )

    return nextPoints
  }

  const confirmReward = () => {
    const nextPoints = applyReward()
    setCurrentPoints(nextPoints)

    if (isChallengeRewardClaim) {
      window.localStorage.setItem(CHALLENGE_REWARD_CLAIMED_STORAGE_KEY, 'true')
    } else if (Number.isFinite(rewardSourceItemId)) {
      addCompletedChallengeCardId(Number(rewardSourceItemId))
    }
    navigate('/community/challenge')
  }

  return (
    <>
      <ConfettiEffect />
      <PageHeader title="포인트 받기" leftContent={<BackButton />} />
      <main className="page community_reward_page">
        <RewardHero rewardAmount={rewardAmount} />

        <RewardPointCard
          currentPoints={currentPoints}
          rewardAmount={rewardAmount}
          onClick={() => navigate('/mypage')}
        />

        <section className="community_reward_usage">
          <Title as="h5" title="포인트는 이렇게 사용할 수 있어요!" />
          <ul>
            <li>
              <span className="community_reward_usage_icon" aria-hidden="true">
                <GiftIcon />
              </span>
              <span className="p_regular">사료/간식 교환</span>
            </li>
            <li>
              <span className="community_reward_usage_icon" aria-hidden="true">
                <HeartIcon />
              </span>
              <span className="p_regular">기부 하기</span>
            </li>
            <li>
              <span className="community_reward_usage_icon is_star_circle" aria-hidden="true">
                <span className="community_reward_usage_icon_inner">
                  <StarIcon />
                </span>
              </span>
              <span className="p_regular">특별한 리워드</span>
            </li>
          </ul>
        </section>

        <div className="community_reward_actions">
          <Button
            type="button"
            className="purple_btn square_btn community_reward_confirm"
            onClick={confirmReward}
          >
            확인
          </Button> 
        </div>
      </main>
    </>
  )
}

export default CommunityReward
