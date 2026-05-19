import './CommunityShared.css'
import './CommunityVote.css'
import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { useSwipeNav } from '../../hooks/useSwipeNav'
import { useNavigate, useSearchParams } from 'react-router'
import { ChevronRight, MoreVertical } from 'lucide-react'
import CommunityPageHeader from '../../components/CommunityPageHeader'
import Title from '../../components/Title'
import Button from '../../components/html/Button'
import Alert from '../../components/Alert'
import ConfirmDialog from '../../components/ConfirmDialog'
import FloatingWriteButton from '../../components/FloatingWriteButton'
import VoteMissionBanner from '../../components/VoteMissionBanner'
import OxVoteOptions from '../../components/OxVoteOptions'
import voteOIcon from '../../svg/vote_o.svg'
import voteXIcon from '../../svg/vote_x.svg'
import crownIcon from '../../svg/crown.svg'
import timerIcon from '../../svg/timer.svg'
import timerClosedIcon from '../../svg/timer_closed.svg'
import boneImage from '../../img/bone.png'
import voteGoodImage from '../../img/vote-good.png'
import voteBannerImage from '../../img/vote/vote_banner_img.png'
import { readVotedMissionIds } from '../../utils/communityVoteStatus'
import { isChallengeDayClaimed, markChallengeVoteCompleted, readCurrentDay } from '../../utils/challengeStatus'
import { readProfilePoints, writeProfilePoints } from '../../utils/profilePoints'
import { showStateBarMessage } from '../../utils/stateBarMessage'
import { addUserNotification } from '../../utils/userNotifications'
import { missionVotes, regularVoteItems } from './CommunityVoteData'
import { SUBSCRIBER_TIMER_DURATION, formatTimer, getOrCreateEndTime, getRemainingSeconds, resetEndTime } from '../../utils/subscriberTimer'
import VoteConfettiEffect from '../../components/effect/VoteConfettiEffect'
import { deleteUserVote, readUserVotes, calcDeadlineText, type UserVote } from '../../utils/savedVotes'
import { readModifiedVoteIds, writeModifiedVoteId } from '../../utils/userCommunityVoteModified'
import { readDefaultCommunityVotes, writeDefaultCommunityVotes } from '../../utils/defaultCommunityVotes'
import {
  deleteUserCommunityVoteSelection,
  readUserCommunityVoteSelections,
  writeUserCommunityVoteSelections,
} from '../../utils/userCommunityVoteSelections'
import {
  addCommunityVoteResult,
  deleteCommunityVoteResults,
  getVotePercentage,
  getVoteTotal,
  readCommunityVoteResults,
  type CommunityVoteResults,
} from '../../utils/communityVoteResults'

const topTabs = ['전체', '펫스토리', '챌린지', '투표'] as const
const topTabRoutes: Record<string, string> = {
  전체: '/community/overview',
  펫스토리: '/community/petstory',
  챌린지: '/community/challenge',
  투표: '/community/vote',
}

type VoteSort = 'latest' | 'popular' | 'deadline'

const VOTE_REWARD_AMOUNT = 60
const VOTE_REWARD_CLAIMED_KEY_PREFIX = 'jibsalife.community.voteRewardClaimed'

function parseDeadline(deadline: string) {
  const match = deadline.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/)
  if (!match) return Number.POSITIVE_INFINITY

  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
}

function formatParticipants(count: number) {
  return count.toLocaleString('ko-KR')
}


function CommunityVote() {
  useSwipeNav(undefined, '/community/challenge')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sort = (searchParams.get('sort') ?? 'latest') as VoteSort
  const sub = searchParams.get('sub') ?? 'all'
  const showMission = sub === 'all' || sub === 'mission'
  const showRegular = sub === 'all' || sub === 'regular'
  const showResult = sub === 'all' || sub === 'result'
  const [votedIds] = useState(() => readVotedMissionIds())
  const [savedVotes, setSavedVotes] = useState<UserVote[]>(() => readUserVotes())
  const [voteSelections, setVoteSelections] = useState<Record<number, number>>(() => ({
    ...readDefaultCommunityVotes(),
    ...readUserCommunityVoteSelections(),
  }))
  const [localVotedIds, setLocalVotedIds] = useState<Set<number>>(() => new Set([
    ...Object.keys(readDefaultCommunityVotes()).map(Number),
    ...Object.keys(readUserCommunityVoteSelections()).map(Number),
  ]))
  const [voteResults, setVoteResults] = useState<CommunityVoteResults>(() => readCommunityVoteResults())
  const [editingVoteId, setEditingVoteId] = useState<number | null>(null)
  const [modifiedVoteIds, setModifiedVoteIds] = useState<Set<number>>(() => new Set(readModifiedVoteIds()))
  const [modifyBlockedVoteId, setModifyBlockedVoteId] = useState<number | null>(null)
  const [voteAnimKeys, setVoteAnimKeys] = useState<Record<string, number>>({})
  const [deleteVoteId, setDeleteVoteId] = useState<number | null>(null)
  const [isVoteCompleteOpen, setIsVoteCompleteOpen] = useState(false)
  const [completedVoteId, setCompletedVoteId] = useState<number | null>(null)
  const [claimedVoteRewardIds, setClaimedVoteRewardIds] = useState<Set<number>>(() => new Set())
  const [notifiedVoteIds, setNotifiedVoteIds] = useState<Set<string>>(() => new Set())
  const [subscriberTimer, setSubscriberTimer] = useState(() => getRemainingSeconds(getOrCreateEndTime()))
  const pendingDefaultVoteSelection = useRef<{ voteId: number; optionId: number } | null>(null)
  const pendingUserVoteSelection = useRef<{ voteId: number; optionId: number } | null>(null)

  useEffect(() => {
    let currentEndTime = getOrCreateEndTime()
    const interval = setInterval(() => {
      const remaining = getRemainingSeconds(currentEndTime)
      if (remaining <= 0) {
        showStateBarMessage(
          '멍스타 모델 지원 오픈!\n지금 바로 우리 아이를 지원해보세요.',
          5000,
          { placement: 'footer' },
        )
        currentEndTime = resetEndTime()
        setSubscriberTimer(SUBSCRIBER_TIMER_DURATION)
      } else {
        setSubscriberTimer(remaining)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  const sortedRegularVoteItems = useMemo(() => {
    return [...regularVoteItems].sort((a, b) => {
      if (sort === 'popular') {
        return b.participants - a.participants || b.id - a.id
      }

      if (sort === 'deadline') {
        return parseDeadline(a.deadline) - parseDeadline(b.deadline) || b.id - a.id
      }

      return a.id - b.id
    })
  }, [sort])

  const activeMissionVotes = missionVotes.filter(v => v.buttonType !== 'result')
  const resultMissionVotes = missionVotes.filter(v => v.buttonType === 'result')
  const activeRegularItems = sortedRegularVoteItems
  const resultRegularItems = sub === 'result'
    ? sortedRegularVoteItems.filter(item => 'resultOnly' in item && item.resultOnly)
    : []

  const isRegularTab = sub === 'regular'
  const MAX_REGULAR = 3
  const visibleSavedVotes = isRegularTab ? savedVotes : savedVotes.slice(0, MAX_REGULAR)
  const visibleActiveItems = isRegularTab
    ? activeRegularItems
    : activeRegularItems.slice(0, Math.max(0, MAX_REGULAR - visibleSavedVotes.length))
  const hasMoreRegular = !isRegularTab && savedVotes.length + activeRegularItems.length > MAX_REGULAR

  const openMissionVote = (voteId: string) => {
    navigate(`/community/vote/detail?voteId=${voteId}`)
  }

  const showChallengeMissionCompleteToast = () => {
    const currentDay = readCurrentDay()
    if (currentDay !== 2 || isChallengeDayClaimed(currentDay)) return

    showStateBarMessage('오늘의 챌린지가 참여되었습니다.\n포인트 받아주세요.', 5000, {
      actionLabel: '이동하기',
      onAction: () => navigate('/community/challenge'),
      closeButton: false,
    })
  }

  const openVoteCompleteDialog = (voteId: number) => {
    if (markChallengeVoteCompleted()) {
      showChallengeMissionCompleteToast()
    }
    if (window.localStorage.getItem(`${VOTE_REWARD_CLAIMED_KEY_PREFIX}.${voteId}`) === 'true') {
      setClaimedVoteRewardIds(prev => new Set([...prev, voteId]))
    }
    setCompletedVoteId(voteId)
    setIsVoteCompleteOpen(true)
  }

  const saveDefaultVoteSelection = (voteId: number, optionId: number) => {
    setVoteSelections(prev => {
      const next = { ...prev, [voteId]: optionId }
      const nextDefaultSelections = {
        ...readDefaultCommunityVotes(),
        [voteId]: optionId,
      }
      writeDefaultCommunityVotes(nextDefaultSelections)
      return next
    })
    setLocalVotedIds(prev => new Set([...prev, voteId]))
  }

  const saveUserVoteSelection = (voteId: number, optionId: number) => {
    setVoteSelections(prev => {
      const next = { ...prev, [voteId]: optionId }
      const nextUserSelections = {
        ...readUserCommunityVoteSelections(),
        [voteId]: optionId,
      }
      writeUserCommunityVoteSelections(nextUserSelections)
      return next
    })
    setLocalVotedIds(prev => new Set([...prev, voteId]))
  }

  const submitUserVoteSelection = (voteId: number, optionId: number) => {
    saveUserVoteSelection(voteId, optionId)
    setVoteResults(addCommunityVoteResult(voteId, optionId))
    openVoteCompleteDialog(voteId)
  }

  const handleDeleteUserVote = () => {
    if (deleteVoteId === null) return
    deleteUserVote(deleteVoteId)
    setSavedVotes(readUserVotes())
    setVoteResults(deleteCommunityVoteResults(deleteVoteId))
    deleteUserCommunityVoteSelection(deleteVoteId)
    setVoteSelections(prev => {
      const { [deleteVoteId]: _deleted, ...next } = prev
      return next
    })
    setLocalVotedIds(prev => {
      const next = new Set(prev)
      next.delete(deleteVoteId)
      return next
    })
    setDeleteVoteId(null)
  }

  const closeVoteCompleteDialog = () => {
    setIsVoteCompleteOpen(false)
    if (pendingDefaultVoteSelection.current) {
      saveDefaultVoteSelection(
        pendingDefaultVoteSelection.current.voteId,
        pendingDefaultVoteSelection.current.optionId,
      )
      pendingDefaultVoteSelection.current = null
    }
  }

  const claimVoteReward = () => {
    if (completedVoteId === null || claimedVoteRewardIds.has(completedVoteId)) return

    const storageKey = `${VOTE_REWARD_CLAIMED_KEY_PREFIX}.${completedVoteId}`
    if (window.localStorage.getItem(storageKey) === 'true') {
      setClaimedVoteRewardIds(prev => new Set([...prev, completedVoteId]))
      return
    }

    const nextPoints = readProfilePoints() + VOTE_REWARD_AMOUNT
    writeProfilePoints(nextPoints)
    window.localStorage.setItem(storageKey, 'true')
    setClaimedVoteRewardIds(prev => new Set([...prev, completedVoteId]))
    closeVoteCompleteDialog()
  }

  return (
    <>
      <CommunityPageHeader />

      <main className="page cv2_page">
        {sub === 'all' && (
          <VoteMissionBanner
            className="cps_vote_banner"
            backgroundColor="#FFD6D9"
            timerColor="#BB0600"
            timeText={formatTimer(subscriberTimer)}
            title={<>멍스타 모델 도전</>}
            description="내 반려동물을 스타로 만들어 보세요!"
            imageSrc={voteBannerImage}
          />
        )}
        {/* 탭 바 */}
        <section className="community_tab_bar" aria-label="커뮤니티 상위 카테고리">
          {topTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={tab === '투표' ? 'active' : ''}
              onClick={() => navigate(topTabRoutes[tab])}
            >
              {tab}
            </button>
          ))}
        </section>

        {showMission && <section className="cv2_section">
          <Title
            as="h4"
            className="cv2_section_title"
            beforeTitle={<img src={crownIcon} alt="" className="cv2_crown" aria-hidden="true" />}
            title={missionVotes[0].sectionTitle}
          />
          <div className="cv2_mission_cards">
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
        </section>}

        {showResult && <section className="cv2_section cv2_past_section">
          <Title as="h4" className="cv2_section_title" title="투표 결과" />
          <div className="cv2_past_cards">
          <div className="cv2_mission_card">
            <Title
              as="h5"
              className="cv2_mission_card_body"
              beforeTitle={
                <span className="cv2_timer cv2_timer_closed">
                  <img src={timerIcon} alt="" aria-hidden="true" />
                  투표 종료
                </span>
              }
              title="밥 먹는 사진 중 BEST를 골라주세요!"
            >
              <p>운영자 <span className="cv2_divider">|</span> 참여자 수 22명</p>
            </Title>
            <button type="button" className="cv2_result_btn" onClick={() => navigate('/community/vote/result')}>
              결과보기
            </button>
          </div>
          {resultMissionVotes.map((vote) => (
            <div key={vote.id} className="cv2_mission_card">
              <Title
                as="h5"
                className="cv2_mission_card_body"
                beforeTitle={
                  <span className="cv2_timer cv2_timer_closed">
                    <img src={timerIcon} alt="" aria-hidden="true" />
                    {vote.timeText}
                  </span>
                }
                title={vote.title}
              >
                <p>
                  {vote.organizer} <span className="cv2_divider">|</span>{' '}
                  {vote.subText ?? `참여자 수 ${vote.participants}명`}
                </p>
              </Title>
              <button type="button" className="cv2_result_btn">결과보기</button>
            </div>
          ))}
          <div className="cv2_regular_list">
            {resultRegularItems.map((item) => (
              <div key={item.id} className="uvote_card uvote_default_card">
                <div className="uvote_card_header">
                  <p className="uvote_card_title">{item.title}</p>
                  {item.description && <p className="uvote_card_desc">{item.description}</p>}
                </div>
                {item.voteType === 'bone-result' && (() => {
                  const totalVotes = item.options.reduce((sum, o) => sum + (o.votes ?? 0), 0)
                  const leftPct = totalVotes > 0 ? Math.round((item.options[0]?.votes ?? 0) / totalVotes * 100) : (item.options[0]?.percentage ?? 50)
                  const rightPct = totalVotes > 0 ? Math.round((item.options[1]?.votes ?? 0) / totalVotes * 100) : (item.options[1]?.percentage ?? 50)
                  return (
                    <div className="uvote_bone_result is_revealed is_right_selected" aria-label={`${item.options[0]?.label} ${leftPct}%, ${item.options[1]?.label} ${rightPct}%`}>
                      <div
                        className="uvote_bone_track"
                        style={{
                          '--uvote-bone-left': `${leftPct}%`,
                          '--uvote-bone-right': `${rightPct}%`,
                        } as CSSProperties}
                      >
                        <span className="uvote_bone_base" aria-hidden="true" />
                        <span className="uvote_bone_left_fill" aria-hidden="true" />
                        <span className="uvote_bone_right_fill" aria-hidden="true" />
                        <span className="uvote_bone_percent uvote_bone_percent_left">{leftPct}%</span>
                        <span className="uvote_bone_percent uvote_bone_percent_right">{rightPct}%</span>
                      </div>
                      <div className="uvote_bone_result_labels">
                        <span className="uvote_bone_result_label_item">
                          <span className="uvote_bone_result_label_text">{item.options[0]?.label}{item.options[0]?.icon}</span>
                        </span>
                        <span className="uvote_bone_result_label_item">
                          <span className="uvote_bone_result_label_text">{item.options[1]?.label}{item.options[1]?.icon}</span>
                        </span>
                      </div>
                    </div>
                  )
                })()}
                <p className="uvote_meta">
                  {item.deadline} <span className="cv2_divider">|</span> 참여자 수 {formatParticipants(item.participants)}명
                </p>
              </div>
            ))}
          </div>
          </div>
        </section>}

        {showRegular && <section className="cv2_section">
          <div className="cv2_section_header">
            <Title as="h4" className="cv2_section_title" title="집사 투표" />
            {hasMoreRegular && (
              <button
                type="button"
                className="cv2_more_btn"
                onClick={() => navigate('/community/vote?sub=regular')}
              >
                더보기 <ChevronRight size={16} />
              </button>
            )}
          </div>
          <div className="cv2_regular_list">
            {visibleSavedVotes.map((vote) => {
              const sel = voteSelections[vote.id]
              const voted = localVotedIds.has(vote.id)
              const deadline = calcDeadlineText(vote.createdAt, vote.voteDuration)
              const storedResult = voteResults[vote.id]
              const resultForDisplay = getVoteTotal(storedResult) > 0
                ? storedResult
                : sel !== undefined
                  ? { [sel]: 1 }
                  : undefined
              const participantCount = getVoteTotal(resultForDisplay)

              const handleDirectVote = (itemId: number) => {
                if (voted) {
                  pendingUserVoteSelection.current = { voteId: vote.id, optionId: itemId }
                  if (modifiedVoteIds.has(vote.id)) {
                    setModifyBlockedVoteId(vote.id)
                  } else {
                    setEditingVoteId(vote.id)
                  }
                  return
                }
                submitUserVoteSelection(vote.id, itemId)
              }

              return (
                <div key={vote.id} className="uvote_card uvote_user_card">
                  <button
                    type="button"
                    className="uvote_more_btn"
                    aria-label="투표 더보기"
                    onClick={() => setDeleteVoteId(vote.id)}
                  >
                    <MoreVertical size={22} strokeWidth={2.5} />
                  </button>
                  <div className="uvote_card_header">
                    <p className="uvote_card_title">{vote.title}</p>
                    {vote.content && <p className="uvote_card_desc">{vote.content}</p>}
                  </div>

                  {/* 사진 투표 → 사진 그리드 */}
                  {vote.voteType === '사진 투표' && (
                    <div className={`uvote_photo_grid${sel ? ' is_revealed' : ''}`}>
                      {vote.voteItems.map(item => {
                        const isSelected = sel === item.id
                        const percentage = getVotePercentage(resultForDisplay, item.id)
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`uvote_photo_option${isSelected ? ' selected' : ''}`}
                            onClick={() => {
                              handleDirectVote(item.id)
                            }}
                          >
                            <img src={item.image ?? boneImage} alt={item.label} className="uvote_photo_img" />
                            {item.label.trim() !== '' && (
                              <span className="uvote_photo_label_row">
                                <span className="uvote_photo_label">{item.label}</span>
                                <span className={`uvote_photo_radio${isSelected ? ' checked' : ''}`} />
                              </span>
                            )}
                            {sel && (
                              <span className="uvote_photo_result_bar" aria-label={`${item.label} ${percentage}%`}>
                                <span key={voteAnimKeys[item.id] ?? 0} className="uvote_photo_result_fill" style={{ '--fill-width': `${percentage}%` } as CSSProperties}>
                                  {percentage}%
                                </span>
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {vote.voteType === 'OX' && (
                    <OxVoteOptions
                      selectedId={sel === 1 || sel === 2 ? sel : null}
                      onSelect={handleDirectVote}
                    />
                  )}

                  {vote.voteType === '일반 투표' && (
                    voted ? (
                      <div
                        className={`uvote_bone_result is_revealed${sel === vote.voteItems[0]?.id ? ' is_left_selected' : ''}${sel === vote.voteItems[1]?.id ? ' is_right_selected' : ''}`}
                        aria-label={`${vote.voteItems[0]?.label} ${getVotePercentage(resultForDisplay, vote.voteItems[0]?.id)}%, ${vote.voteItems[1]?.label} ${getVotePercentage(resultForDisplay, vote.voteItems[1]?.id)}%`}
                      >
                        <div
                          className="uvote_bone_track"
                          style={{
                            '--uvote-bone-left': `${getVotePercentage(resultForDisplay, vote.voteItems[0]?.id)}%`,
                            '--uvote-bone-right': `${getVotePercentage(resultForDisplay, vote.voteItems[1]?.id)}%`,
                          } as CSSProperties}
                        >
                          <span className="uvote_bone_base" aria-hidden="true" />
                          <span key={`left-${voteAnimKeys[`${vote.id}-${vote.voteItems[0]?.id}`] ?? 0}`} className="uvote_bone_left_fill" aria-hidden="true" />
                          <span key={`right-${voteAnimKeys[`${vote.id}-${vote.voteItems[1]?.id}`] ?? 0}`} className="uvote_bone_right_fill" aria-hidden="true" />
                          <span className="uvote_bone_percent uvote_bone_percent_left">{getVotePercentage(resultForDisplay, vote.voteItems[0]?.id)}%</span>
                          <span className="uvote_bone_percent uvote_bone_percent_right">{getVotePercentage(resultForDisplay, vote.voteItems[1]?.id)}%</span>
                          <button type="button" className="uvote_bone_hit uvote_bone_hit_left" onClick={() => handleDirectVote(vote.voteItems[0].id)} aria-label={`${vote.voteItems[0]?.label} 수정`} />
                          <button type="button" className="uvote_bone_hit uvote_bone_hit_right" onClick={() => handleDirectVote(vote.voteItems[1].id)} aria-label={`${vote.voteItems[1]?.label} 수정`} />
                        </div>
                        <div className="uvote_bone_result_labels">
                          <span className="uvote_bone_result_label_item">
                            <span className="uvote_bone_result_label_text">{vote.voteItems[0]?.label}</span>
                            {sel === vote.voteItems[0]?.id && <span className="uvote_bone_my_vote">내 투표</span>}
                          </span>
                          <span className="uvote_bone_result_label_item">
                            <span className="uvote_bone_result_label_text">{vote.voteItems[1]?.label}</span>
                            {sel === vote.voteItems[1]?.id && <span className="uvote_bone_my_vote">내 투표</span>}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="vw_text_items_list">
                        {vote.voteItems.map(item => (
                          <button
                            key={item.id}
                            type="button"
                            className="vw_text_item"
                            onClick={() => handleDirectVote(item.id)}
                          >
                            <span className="vw_text_item_circle" aria-hidden="true" />
                            <span className="vw_text_item_label">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )
                  )}

                  <p className="uvote_meta">{deadline} <span className="cv2_divider">|</span> 참여자 수 {formatParticipants(participantCount)}명</p>
                </div>
              )
            })}

            {visibleActiveItems.map((item) => {
              const sel = voteSelections[item.id]
              const voted = localVotedIds.has(item.id)
              const selectDefaultVote = (optionId: number) => {
                if (voted) {
                  pendingDefaultVoteSelection.current = { voteId: item.id, optionId }
                  if (modifiedVoteIds.has(item.id)) {
                    setModifyBlockedVoteId(item.id)
                  } else {
                    setEditingVoteId(item.id)
                  }
                  return
                }
                pendingDefaultVoteSelection.current = { voteId: item.id, optionId }
                openVoteCompleteDialog(item.id)
              }
              const selectBoneVote = (optionId: number) => {
                if (voted) {
                  pendingDefaultVoteSelection.current = { voteId: item.id, optionId }
                  if (modifiedVoteIds.has(item.id)) {
                    setModifyBlockedVoteId(item.id)
                  } else {
                    setEditingVoteId(item.id)
                  }
                  return
                }
                pendingDefaultVoteSelection.current = { voteId: item.id, optionId }
                openVoteCompleteDialog(item.id)
              }

              return (
                <div key={item.id} className="uvote_card uvote_default_card">
                  <div className="uvote_card_header">
                    <p className="uvote_card_title">{item.title}</p>
                    {item.description && <p className="uvote_card_desc">{item.description}</p>}
                  </div>

                  {item.voteType === 'photo' && (() => {
                    const totalVotes = item.options.reduce((sum, o) => sum + (o.votes ?? 0), 0)
                    return (
                      <div className={`uvote_photo_grid${sel ? ' is_revealed' : ''}`}>
                        {item.options.map((option, index) => {
                          const isSelected = sel === option.id
                          const pct = totalVotes > 0
                            ? Math.round((option.votes ?? 0) / totalVotes * 100)
                            : (option.percentage ?? 0)
                          return (
                            <button
                              key={option.id}
                              type="button"
                              className={`uvote_photo_option${isSelected ? ' selected' : ''}`}
                              onClick={() => selectDefaultVote(option.id)}
                            >
                              <span className="uvote_photo_fill" style={{ backgroundColor: option.color }}>
                                {option.image && <img src={option.image} alt="" aria-hidden="true" />}
                                <span className="uvote_photo_rank">{index + 1}</span>
                              </span>
                              <span className="uvote_photo_label_row">
                                <span className="uvote_photo_label">{option.label}</span>
                                <span className={`uvote_photo_radio${isSelected ? ' checked' : ''}`} />
                              </span>
                              {sel && (
                                <span className="uvote_photo_result_bar" aria-label={`${option.label} ${pct}%`}>
                                  <span
                                    key={`${option.id}-${voteAnimKeys[`${item.id}-${option.id}`] ?? 0}`}
                                    className="uvote_photo_result_fill"
                                    style={{ '--fill-width': `${pct}%` } as CSSProperties}
                                  >
                                    {pct}%
                                  </span>
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )
                  })()}

                  {item.voteType === 'ox' && (
                    sel ? (
                      <div className="uvote_ox_result_grid">
                        {(() => {
                          const totalVotes = item.options.reduce((sum, o) => sum + (o.votes ?? 0), 0)
                          return item.options.map((option) => {
                            const isO = option.id === 1
                            const pct = totalVotes > 0
                              ? Math.round((option.votes ?? 0) / totalVotes * 100)
                              : (option.percentage ?? 0)
                            return (
                              <button
                                key={option.id}
                                type="button"
                                className={`uvote_ox_result_card ${isO ? 'is_o' : 'is_x'}${sel === option.id ? ' selected' : ''}`}
                                onClick={() => selectDefaultVote(option.id)}
                              >
                                <span
                                  key={`${option.id}-${voteAnimKeys[`${item.id}-${option.id}`] ?? 0}`}
                                  className="uvote_ox_wave"
                                  style={{ height: `${pct}%` }}
                                  aria-hidden="true"
                                />
                                <img src={isO ? voteOIcon : voteXIcon} alt={option.label} className="uvote_ox_result_icon" />
                                <span className="uvote_ox_percent">{pct}%</span>
                              </button>
                            )
                          })
                        })()}
                      </div>
                    ) : (
                      <OxVoteOptions
                        selectedId={null}
                        onSelect={selectDefaultVote}
                      />
                    )
                  )}

                  {item.voteType === 'bone-result' && (() => {
                    const totalVotes = item.options.reduce((sum, o) => sum + (o.votes ?? 0), 0)
                    const leftPct = totalVotes > 0 ? Math.round((item.options[0]?.votes ?? 0) / totalVotes * 100) : (item.options[0]?.percentage ?? 50)
                    const rightPct = totalVotes > 0 ? Math.round((item.options[1]?.votes ?? 0) / totalVotes * 100) : (item.options[1]?.percentage ?? 50)
                    if (!sel) {
                      return (
                        <div className="vw_text_items_list">
                          {item.options.map(option => (
                            <button
                              key={option.id}
                              type="button"
                              className="vw_text_item"
                              onClick={() => selectBoneVote(option.id)}
                              aria-label={`${option.label} 선택`}
                            >
                              <span className="vw_text_item_circle" aria-hidden="true" />
                              <span className="vw_text_item_label">{option.label}{option.icon}</span>
                            </button>
                          ))}
                        </div>
                      )
                    }
                    return (
                      <div
                        className={`uvote_bone_result is_revealed${sel === item.options[0]?.id ? ' is_left_selected' : ''}${sel === item.options[1]?.id ? ' is_right_selected' : ''}`}
                        aria-label={`${item.options[0]?.label} ${leftPct}%, ${item.options[1]?.label} ${rightPct}%`}
                      >
                        <div
                          className="uvote_bone_track"
                          style={{
                            '--uvote-bone-left': `${leftPct}%`,
                            '--uvote-bone-right': `${rightPct}%`,
                          } as CSSProperties}
                        >
                          <span className="uvote_bone_base" aria-hidden="true" />
                          <span key={`left-${voteAnimKeys[`${item.id}-${item.options[0]?.id}`] ?? 0}`} className="uvote_bone_left_fill" aria-hidden="true" />
                          <span key={`right-${voteAnimKeys[`${item.id}-${item.options[1]?.id}`] ?? 0}`} className="uvote_bone_right_fill" aria-hidden="true" />
                          <span className="uvote_bone_percent uvote_bone_percent_left">{leftPct}%</span>
                          <span className="uvote_bone_percent uvote_bone_percent_right">{rightPct}%</span>
                          <button type="button" className="uvote_bone_hit uvote_bone_hit_left" onClick={() => selectBoneVote(item.options[0].id)} aria-label={`${item.options[0]?.label} 수정`} />
                          <button type="button" className="uvote_bone_hit uvote_bone_hit_right" onClick={() => selectBoneVote(item.options[1].id)} aria-label={`${item.options[1]?.label} 수정`} />
                        </div>
                        <div className="uvote_bone_result_labels">
                          <span className="uvote_bone_result_label_item">
                            <span className="uvote_bone_result_label_text">{item.options[0]?.label}{item.options[0]?.icon}</span>
                            {sel === item.options[0]?.id && <span className="uvote_bone_my_vote">내 투표</span>}
                          </span>
                          <span className="uvote_bone_result_label_item">
                            <span className="uvote_bone_result_label_text">{item.options[1]?.label}{item.options[1]?.icon}</span>
                            {sel === item.options[1]?.id && <span className="uvote_bone_my_vote">내 투표</span>}
                          </span>
                        </div>
                      </div>
                    )
                  })()}

                  <p className="uvote_meta">
                    {item.deadline} <span className="cv2_divider">|</span> 참여자 수 {formatParticipants(item.participants + (voted ? 1 : 0))}명
                  </p>
                </div>
              )
            })}
          </div>
        </section>}
      </main>
      {editingVoteId !== null ? (
        <ConfirmDialog
          message="투표를 수정할까요?"
          description={(
            <>
              투표는 기간 내 1회만 수정할 수 있어요.
              <br />
              정말 수정하시겠어요?
            </>
          )}
          cancelLabel="취소"
          confirmLabel="수정"
          accentColor="#FF88C5"
          cancelButtonStyle={{ backgroundColor: '#D9D9D9', border: 'none', color: '#111111' }}
          dialogClassName="confirm_dialog_vote_edit"
          onCancel={() => {
            pendingDefaultVoteSelection.current = null
            pendingUserVoteSelection.current = null
            setEditingVoteId(null)
          }}
          onConfirm={() => {
            if (editingVoteId !== null) {
              const pending = pendingDefaultVoteSelection.current
              if (pending) {
                saveDefaultVoteSelection(pending.voteId, pending.optionId)
                pendingDefaultVoteSelection.current = null
                const animKey = `${editingVoteId}-${pending.optionId}`
                setVoteAnimKeys(prev => ({ ...prev, [animKey]: (prev[animKey] ?? 0) + 1 }))
              }
              const pendingUser = pendingUserVoteSelection.current
              if (pendingUser) {
                deleteCommunityVoteResults(pendingUser.voteId)
                setVoteResults(addCommunityVoteResult(pendingUser.voteId, pendingUser.optionId))
                saveUserVoteSelection(pendingUser.voteId, pendingUser.optionId)
                pendingUserVoteSelection.current = null
                const animKey = `${editingVoteId}-${pendingUser.optionId}`
                setVoteAnimKeys(prev => ({ ...prev, [animKey]: (prev[animKey] ?? 0) + 1 }))
              }
              writeModifiedVoteId(editingVoteId)
              setModifiedVoteIds(prev => new Set([...prev, editingVoteId]))
            }
            setEditingVoteId(null)
          }}
        />
      ) : null}
      {modifyBlockedVoteId !== null ? (
        <ConfirmDialog
          message="수정이 불가해요"
          description={(
            <>
              투표는 기간 내 1회만
              <br />
              수정할 수 있어요.
            </>
          )}
          confirmLabel="확인"
          hideCancel
          accentColor="#FF88C5"
          dialogClassName="confirm_dialog_vote_edit"
          onCancel={() => setModifyBlockedVoteId(null)}
          onConfirm={() => setModifyBlockedVoteId(null)}
        />
      ) : null}
      {deleteVoteId !== null ? (
        <ConfirmDialog
          message="투표를 삭제할까요?"
          description={(
            <>
              투표 게시글은 작성 후
              <br />
              수정할 수 없고 삭제만 가능해요.
            </>
          )}
          cancelLabel="취소"
          confirmLabel="확인"
          accentColor="#FC7B9B"
          cancelButtonStyle={{ backgroundColor: '#D9D9D9', border: 'none', color: '#111111' }}
          dialogClassName="confirm_dialog_vote_delete"
          onCancel={() => setDeleteVoteId(null)}
          onConfirm={handleDeleteUserVote}
        />
      ) : null}
      {isVoteCompleteOpen ? (
        <Alert dialogClassName="uvote_complete_dialog" onClose={closeVoteCompleteDialog}>
          <div className="uvote_complete_content">
            <VoteConfettiEffect />
            <strong className="uvote_complete_title">투표 완료!</strong>
            <span className="uvote_complete_desc">소중한 의견 감사합니다 💗</span>
            <img src={voteGoodImage} alt="" className="uvote_complete_image" />
            <Button
              type="button"
              className="purple_btn uvote_complete_reward_btn"
              onClick={claimVoteReward}
              disabled={completedVoteId !== null && claimedVoteRewardIds.has(completedVoteId)}
            >
              {completedVoteId !== null && claimedVoteRewardIds.has(completedVoteId) ? '포인트 받기 완료' : '포인트 받기'}
            </Button>
          </div>
        </Alert>
      ) : null}
      <FloatingWriteButton showMenu />
    </>
  )
}

export default CommunityVote
