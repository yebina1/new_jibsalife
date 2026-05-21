import '../pages/community/CommunityVote.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Title from './Title'
import crownIcon from '../svg/crown.svg'
import timerIcon from '../svg/timer.svg'
import timerClosedIcon from '../svg/timer_closed.svg'
import { missionVotes } from '../pages/community/CommunityVoteData'
import { readVotedMissionIds } from '../utils/communityVoteStatus'
import { showStateBarMessage } from '../utils/stateBarMessage'
import { addUserNotification } from '../utils/userNotifications'
import { formatTimer, getOrCreateEndTime, getRemainingSeconds } from '../utils/subscriberTimer'

function MissionVoteSection() {
  const navigate = useNavigate()
  const [votedIds] = useState(() => readVotedMissionIds())
  const [notifiedVoteIds, setNotifiedVoteIds] = useState<Set<string>>(() => new Set())
  const [subscriberTimer, setSubscriberTimer] = useState(() => getRemainingSeconds(getOrCreateEndTime()))
  const activeMissionVotes = missionVotes.filter((v) => v.buttonType !== 'result')

  useEffect(() => {
    const interval = setInterval(() => {
      setSubscriberTimer(getRemainingSeconds(getOrCreateEndTime()))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const openMissionVote = (voteId: string) => {
    navigate(`/community/vote/detail?voteId=${voteId}`)
  }

  return (
    <div className="cv2_mission_cards">
      <Title
        as="h4"
        className="cv2_section_title"
        beforeTitle={<img src={crownIcon} alt="" className="cv2_crown" aria-hidden="true" />}
        title={missionVotes[0].sectionTitle}
      />
      {activeMissionVotes.map((vote) => (
        <div key={vote.id} className="cv2_mission_card">
          <Title
            as="h5"
            className="cv2_mission_card_body"
            beforeTitle={
              <span className={`cv2_timer ${vote.buttonType === 'notify' ? 'cv2_timer_closed' : 'cv2_timer_active'}`}>
                <img src={vote.buttonType === 'notify' ? timerClosedIcon : timerIcon} alt="" aria-hidden="true" />
                {vote.id === 'subscriber' ? formatTimer(subscriberTimer) : vote.timeText}
              </span>
            }
            title={vote.title}
          >
            <p>
              {vote.organizer} <span className="cv2_divider">|</span>{' '}
              {vote.subText ?? `참여자 수 ${vote.participants}명`}
            </p>
          </Title>
          {vote.buttonType === 'notify' ? (
            <button
              type="button"
              className={`cv2_notify_btn${notifiedVoteIds.has(vote.id) ? ' notified' : ''}`}
              onClick={() => {
                if (notifiedVoteIds.has(vote.id)) {
                  setNotifiedVoteIds(prev => {
                    const next = new Set(prev)
                    next.delete(vote.id)
                    return next
                  })
                  showStateBarMessage('투표 알림이 해제되었습니다.', 3000, { placement: 'footer' })
                  addUserNotification({ title: '투표', content: '투표 알림이 해제되었습니다.', path: '/community/vote' })
                } else {
                  showStateBarMessage('투표 알림이 설정되었습니다.', 3000, { placement: 'footer' })
                  addUserNotification({ title: '투표', content: '투표 알림이 설정되었습니다.', path: '/community/vote' })
                  setNotifiedVoteIds(prev => new Set([...prev, vote.id]))
                }
              }}
            >
              알림받기
            </button>
          ) : (
            <button
              type="button"
              className={votedIds.includes(vote.id) ? 'cv2_outline_btn' : 'cv2_vote_btn'}
              onClick={() => openMissionVote(vote.id)}
            >
              {votedIds.includes(vote.id) ? '수정하기' : '투표하기'}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default MissionVoteSection
