import './CommunityShared.css'
import './CommunityOverview.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useSwipeNav } from '../../hooks/useSwipeNav'
import { checkChallengeDayDone, readCurrentDay, saveCurrentDay, claimChallengeDay, isChallengeDayClaimed, CHALLENGE_STATUS_CHANGED_EVENT } from '../../utils/challengeStatus'
import { challengeDays, getChallengeMissionPath } from './CommunityChallenge'
import CommunityPageHeader from '../../components/CommunityPageHeader'
import Title from '../../components/Title'
import WeeklyChallengeCard from '../../components/WeeklyChallengeCard'
import VoteMissionBanner from '../../components/VoteMissionBanner'
import MissionVoteSection from '../../components/MissionVoteSection'
import PetStoryPreviewSection from '../../components/PetStoryPreviewSection'
import FloatingWriteButton from '../../components/FloatingWriteButton'
import bannerImg from '../../img/Community_Overview_banner_img.png'
import { showStateBarMessage } from '../../utils/stateBarMessage'
import { addUserNotification } from '../../utils/userNotifications'


function CommunityOverview() {
  useSwipeNav('/community/petstory')
  const navigate = useNavigate()
  const [currentDay, setCurrentDay] = useState(() => readCurrentDay())
  const [missionDone, setMissionDone] = useState(() => checkChallengeDayDone(readCurrentDay()))
  const [completed, setCompleted] = useState(() => isChallengeDayClaimed(readCurrentDay()))

  useEffect(() => {
    // currentDay 변경과 외부 완료 이벤트를 반영해 카드 상태를 갱신한다.
    const refresh = () => {
      setMissionDone(checkChallengeDayDone(currentDay))
      setCompleted(isChallengeDayClaimed(currentDay))
    }
    window.addEventListener(CHALLENGE_STATUS_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener(CHALLENGE_STATUS_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [currentDay])

  return (
    <>
      <CommunityPageHeader />
      <main className="page co_page">
        <VoteMissionBanner
          timeText="7시간 남음"
          title="챌린지 완료 보상"
          description="챌린지 참여하고 포인트 받자!"
          backgroundColor="#FFE27A"
          imageSrc={bannerImg}
        />
        <WeeklyChallengeCard
          showTimer={false}
          showImage={false}
          day={challengeDays[Math.min(currentDay, challengeDays.length - 1)].day}
          description={challengeDays[Math.min(currentDay, challengeDays.length - 1)].description}
          missionDone={missionDone}
          completed={completed}
          onDayEnd={() => {
            setCurrentDay(prev => {
              const next = Math.min(prev + 1, challengeDays.length - 1)
              saveCurrentDay(next)
              return next
            })
          }}
          onParticipate={() => {
            navigate(getChallengeMissionPath(currentDay))
          }}
          onComplete={() => {
            claimChallengeDay(currentDay)
            addUserNotification({ title: '챌린지', content: '오늘의 챌린지가 참여되었습니다. 포인트 받아주세요.', path: '/community/challenge' })
            showStateBarMessage('오늘의 챌린지가 참여되었습니다.\n포인트 받아주세요.', 5000, {
              actionLabel: '이동하기',
              onAction: () => navigate('/community/challenge'),
              closeButton: false,
            })
          }}
        />
        <section className="co_challenge_card">
          <div className="co_vote_header">
            <Title as="h4" title="투표">
              <p>멋진 반려동물에게 투표해주세요!</p>
            </Title>
            <button type="button" className="co_vote_more_btn" onClick={() => navigate('/community/vote')}>
              더보기&gt;
            </button>
          </div>
          <MissionVoteSection />
        </section>
        <section className="co_challenge_card co_petstory_card">
          <div className="co_vote_header">
            <Title as="h4" title="펫스토리">
              <p>반려 일상을 공유해요</p>
            </Title>
            <button type="button" className="co_vote_more_btn" onClick={() => navigate('/community/petstory')}>
              더보기&gt;
            </button>
          </div>
          <PetStoryPreviewSection />
        </section>
      </main>
      <FloatingWriteButton showMenu />
    </>
  )
}

export default CommunityOverview
