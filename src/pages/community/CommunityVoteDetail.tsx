import './CommunityVoteDetail.css'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import Alert from '../../components/Alert'
import VoteMissionBanner from '../../components/VoteMissionBanner'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import PointAlertContent from '../../components/PointAlertContent'
import { hasVotedMission, readVotedCandidate, writeVotedCandidate, writeVotedMissionId } from '../../utils/communityVoteStatus'
import { isChallengeDayClaimed, markChallengeVoteCompleted, readCurrentDay } from '../../utils/challengeStatus'
import { readProfilePoints, writeProfilePoints } from '../../utils/profilePoints'
import { showStateBarMessage } from '../../utils/stateBarMessage'
import { addUserNotification } from '../../utils/userNotifications'
import { voteDetails, type CommunityVoteId } from './CommunityVoteData'

const VOTE_REWARD_AMOUNT = 60
const VOTE_REWARD_CLAIMED_KEY_PREFIX = 'jibsalife.community.voteDetailRewardClaimed'

function CommunityVoteDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const requestedVoteId = searchParams.get('voteId') ?? (location.state as { voteId?: string } | null)?.voteId
  const vote = voteDetails.find((item) => item.id === requestedVoteId) ?? voteDetails[0]
  const voteId: CommunityVoteId = vote.id
  const isEditMode = hasVotedMission(voteId)
  const [selectedId, setSelectedId] = useState<number | null>(() => readVotedCandidate(voteId))
  const [isVoteCompleteOpen, setIsVoteCompleteOpen] = useState(false)
  const [isEditAlertOpen, setIsEditAlertOpen] = useState(false)
  const [currentPoints, setCurrentPoints] = useState(() => readProfilePoints())
  const [isVoteRewardClaimed, setIsVoteRewardClaimed] = useState(() => (
    window.localStorage.getItem(`${VOTE_REWARD_CLAIMED_KEY_PREFIX}.${voteId}`) === 'true'
  ))

  const selectCandidate = (candidateId: number) => {
    setSelectedId(candidateId)
  }

  const handleVote = () => {
    if (selectedId === null) return
    if (isEditMode) {
      if (selectedId === readVotedCandidate(voteId)) {
        navigate(-1)
      } else {
        setIsEditAlertOpen(true)
      }
    } else {
      writeVotedMissionId(voteId)
      writeVotedCandidate(voteId, selectedId)
      if (markChallengeVoteCompleted()) {
        showChallengeMissionCompleteToast()
      }
      claimVoteReward()
      setIsVoteCompleteOpen(true)
    }
  }

  const showChallengeMissionCompleteToast = () => {
    const currentDay = readCurrentDay()
    if (currentDay !== 2 || isChallengeDayClaimed(currentDay)) return

    addUserNotification({
      title: '챌린지',
      content: '오늘의 챌린지가 참여되었습니다. 포인트 받아주세요.',
      path: '/community/challenge',
    })
    showStateBarMessage('오늘의 챌린지가 참여되었습니다.\n포인트 받아주세요.', 5000, {
      actionLabel: '이동하기',
      onAction: () => navigate('/community/challenge'),
      closeButton: false,
    })
  }

  const claimVoteReward = () => {
    if (isVoteRewardClaimed) {
      setCurrentPoints(readProfilePoints())
      return
    }

    const nextPoints = readProfilePoints() + VOTE_REWARD_AMOUNT
    writeProfilePoints(nextPoints)
    window.localStorage.setItem(`${VOTE_REWARD_CLAIMED_KEY_PREFIX}.${voteId}`, 'true')
    setCurrentPoints(nextPoints)
    setIsVoteRewardClaimed(true)
  }

  const handleEditConfirm = () => {
    if (selectedId === null) return
    writeVotedMissionId(voteId)
    writeVotedCandidate(voteId, selectedId)
    setIsEditAlertOpen(false)
    navigate(-1)
  }

  const goToResult = () => {
    setIsVoteCompleteOpen(false)
    navigate(`/community/vote?sub=all&voted=${voteId}`, { replace: true })
  }

  return (
    <>
      <PageHeader
        title="투표"
        leftContent={<BackButton />}
        rightContent={
          <>
            <Button type="button" aria-label="notification" onClick={() => navigate('/notification')}>
              <HeaderIcon type="notification" />
            </Button>
          </>
        }
      />

      <main className="page cvd_page">
        {/* 탭 바 */}
        <section className="community_tab_bar" aria-label="커뮤니티 상위 카테고리">
          {(['전체', '펫스토리', '챌린지', '투표'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={tab === '투표' ? 'active' : ''}
              onClick={() => {
                if (tab === '전체') navigate('/community/overview')
                else if (tab === '펫스토리') navigate('/community/petstory')
                else if (tab === '챌린지') navigate('/community/challenge')
                else navigate('/community/vote')
              }}
            >
              {tab}
            </button>
          ))}
        </section>

        <VoteMissionBanner
          timeText={vote.timeText}
          title={
            <>
              {vote.bannerTitleLines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </>
          }
          description={vote.bannerDescription}
          backgroundColor={vote.bannerBackgroundColor}
          imageSrc={vote.bannerImage}
        />

        {/* 투표 후보 목록 */}
        <section className="cvd_vote_section">
          <div className="cvd_grid">
            {vote.candidates.map((item) => {
              const isSelected = selectedId === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`cvd_candidate${isSelected ? ' selected' : ''}`}
                  onClick={() => selectCandidate(item.id)}
                >
                  <div className="cvd_candidate_img_wrap">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cvd_candidate_img"
                      style={{ objectPosition: item.objectPosition }}
                    />
                  </div>
                  <div className="cvd_candidate_footer">
                    <span className="cvd_candidate_name">{item.name}</span>
                    <span className={`cvd_candidate_check${isSelected ? ' checked' : ''}`} aria-hidden="true">
                      <svg viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="10" fill={isSelected ? '#6D59F8' : '#E5E5EC'} />
                        <path d="M6 10.5l3 3 5-5.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {isEditMode ? (
          <div className="cvd_vote_submit_row">
            <Button type="button" className="white_btn" onClick={() => navigate(-1)}>취소</Button>
            <Button
              type="button"
              className="purple_btn cvd_vote_submit"
              disabled={selectedId === null}
              onClick={handleVote}
            >
              수정하기
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            className="purple_btn cvd_vote_submit"
            disabled={selectedId === null}
            onClick={handleVote}
          >
            투표하기
          </Button>
        )}
      </main>

      {isEditAlertOpen && (
        <Alert onClose={() => setIsEditAlertOpen(false)}>
          <p className="cvd_edit_alert_msg">수정하시겠습니까?</p>
          <div className="cvd_edit_alert_btns">
            <Button type="button" className="white_btn" onClick={() => setIsEditAlertOpen(false)}>아니요</Button>
            <Button type="button" className="purple_btn" onClick={handleEditConfirm}>네</Button>
          </div>
        </Alert>
      )}

      {isVoteCompleteOpen ? (
        <Alert onClose={goToResult}>
          <PointAlertContent
            currentPoints={currentPoints}
            rewardAmount={VOTE_REWARD_AMOUNT}
            onRewardCardClick={() => navigate('/mypage')}
            onConfirm={goToResult}
          />
        </Alert>
      ) : null}
    </>
  )
}

export default CommunityVoteDetail
