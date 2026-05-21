import './CommunityVoteResult.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import PageHeader from '../../components/PageHeader'
import BackButton from '../../components/html/BackButton'
import HeaderIcon from '../../components/HeaderIcon'
import Alert from '../../components/Alert'
import Button from '../../components/html/Button'
import ChevronIcon from '../../components/ChevronIcon'
import ConfettiEffect from '../../components/effect/ConfettiEffect'
import GoldConfettiEffect from '../../components/effect/GoldConfettiEffect'
import RewardHero from '../../components/RewardHero'
import RewardPointCard from '../../components/RewardPointCard'
import Title from '../../components/Title'
import ProfileImage from '../../components/ProfileImage'
import {
  COMMUNITY_VOTE_REWARD_POINTS,
  readCommunityVoteRewardClaimed,
  readProfilePoints,
  writeCommunityVoteRewardClaimed,
  writeProfilePoints,
} from '../../utils/profilePoints'
import instaIcon from '../../svg/Instagram_icon.svg'
import icon1st from '../../img/home/1st-icon.png'
import icon2nd from '../../img/home/2nd-icon.png'
import icon3rd from '../../img/home/3rd-icon.png'
import voting1 from '../../img/vote/vote_result/voting1.jpg'
import votingProfile from '../../img/vote/vote_result/voting_istagram_profile.jpg'
import voting2 from '../../img/vote/vote_result/voting2.jpg'
import voting3 from '../../img/vote/vote_result/voting3.jpg'
import voting4 from '../../img/vote/vote_result/voting4.jpg'
import voting5 from '../../img/vote/vote_result/voting5.jpg'
import voting6 from '../../img/vote/vote_result/voting6.jpg'
import instagramImg1 from '../../img/vote/vote_result/instagram_img_1.jpg'
import instagramImg2 from '../../img/vote/vote_result/instagram_img_2.jpg'
import instagramImg3 from '../../img/vote/vote_result/instagram_img_3.jpg'

const top2Rankings = [
  { rank: 2, name: '콩냥이', image: voting2, votes: 842, percentage: 26.1, medal: icon2nd },
  { rank: 3, name: '모카', image: voting3, votes: 615, percentage: 19.1, medal: icon3rd },
]

const otherRankings = [
  { rank: 4, image: voting4, name: '초코' },
  { rank: 5, image: voting5, name: '레오' },
  { rank: 6, image: voting6, name: '보리' },
]

function CommunityVoteResult() {
  const navigate = useNavigate()
  const [isCompleteAlertOpen, setIsCompleteAlertOpen] = useState(false)
  const [profilePoints, setProfilePoints] = useState(() => readProfilePoints())
  const [isRewardClaimed, setIsRewardClaimed] = useState(() => readCommunityVoteRewardClaimed())

  useEffect(() => {
    setProfilePoints(readProfilePoints())
    setIsRewardClaimed(readCommunityVoteRewardClaimed())
  }, [])

  const handleRewardClick = () => {
    if (isRewardClaimed) return
    setIsCompleteAlertOpen(true)
  }

  const confirmReward = () => {
    if (isRewardClaimed) {
      setIsCompleteAlertOpen(false)
      return
    }
    const nextPoints = profilePoints + COMMUNITY_VOTE_REWARD_POINTS
    writeProfilePoints(nextPoints)
    writeCommunityVoteRewardClaimed()
    setProfilePoints(nextPoints)
    setIsRewardClaimed(true)
    setIsCompleteAlertOpen(false)
  }

  return (
    <div className="cv_wrap">
      <GoldConfettiEffect />
      <PageHeader 
      title="투표 결과" 
      leftContent={<BackButton />} 
      rightContent={
        <Button type="button" aria-label="notification" onClick={() => navigate('/notification')}>
          <HeaderIcon type="notification" />
        </Button>
        }
      />

      {/* 1위 */}
      <section className="cv_first_section">
        <div className="cv_first_top">
          <Title
            as="h2"
            className="cv_first_title_row"
            beforeTitle={<img src={icon1st} alt="1위" className="cv_medal_title_icon" />}
            title="루루"
          />
          <div className="cv_first_stats">
            <div className="cv_stats_row">
              <span className="cv_votes_label">득표수 <strong>1,248표</strong></span>
              <span className="cv_percent_label">(88.7%)</span>
            </div>
            <div className="cv_progress_bar">
              <div className="cv_progress_fill" style={{ width: '88.7%' }} />
            </div>
          </div>
        </div>
        <div className="cv_first_img_wrap">
          <img src={voting1} alt="1위 루루" className="cv_first_img" />
        </div>
      </section>

      <div className="cv_content_wrap">
      {/* SNS 프로필 카드 */}
      <div className="cv_profile_card">
        <div className="cv_profile_row">
          <ProfileImage src={votingProfile} alt="콩이" className="cv_profile_avatar" />
          <div className="cv_profile_right">
            <div className="cv_profile_info">
              <Title
                as="h4"
                title="@insta_wlqtk"
                className="cv_profile_username_row"
                beforeTitle={<img src={instaIcon} alt="" aria-hidden="true" className="cv_profile_insta_icon" />}
              />
              <p className="cv_profile_desc p_regular">콩이의 일상 보러가기 #멍팔</p>
            </div>
            <Button type="button" className="cv_follow_btn" disabled>팔로우</Button>
          </div>
        </div>

        {/* 최근 게시물 미리보기 */}
        <section className="cv_preview_section">
          <Title as="h5" title="최근 게시물 미리보기" className="cv_preview_label" />
          <div className="cv_preview_grid">
            <img src={instagramImg1} alt="" aria-hidden="true" className="cv_preview_img" />
            <img src={instagramImg2} alt="" aria-hidden="true" className="cv_preview_img" />
            <img src={instagramImg3} alt="" aria-hidden="true" className="cv_preview_img" />
          </div>
        </section>
      </div>

      {/* 다른순위 (2위~3위) */}
      <section className="cv_other_ranks_section">
        <div className="section_header">
          <Title as="h4" title="다른순위 (2위~3위)" />
        </div>
        {top2Rankings.map((item) => (
          <div key={item.rank} className="cv_rank_item">
            <img src={item.medal} alt={`${item.rank}위 메달`} className="cv_rank_medal" />
            <img src={item.image} alt={item.name} className="cv_rank_photo" />
            <div className="cv_rank_body">
              <span className="cv_rank_name">{item.rank}위 {item.name}</span>
              <div className="cv_stats_row">
                <span className="cv_votes_label">득표수 <strong>{item.votes.toLocaleString()}표</strong></span>
                <span className="cv_percent_label">({item.percentage}%)</span>
              </div>
              <div className="cv_progress_bar">
                <div className="cv_progress_fill" style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 기타 순위 (4위~10위) */}
      <section className="cv_others_section">
        <Title as="h4" title="기타 순위 (4위~10위)" className="section_header">
          <Button type="button" className="cv_others_more_btn" disabled>
            더보기
            <ChevronIcon direction="right" size="sm" />
          </Button>
        </Title>
        <div className="cv_others_grid">
          {otherRankings.map((item) => (
            <div key={item.rank} className="cv_others_item">
              <img src={item.image} alt={`${item.rank}위 ${item.name}`} className="cv_others_img" />
              <span className="cv_others_label p_regular">{item.rank}위 {item.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 하단 */}
      <div className="cv_bottom">
        <p className="cv_share_hint">공유하면 포인트 <strong>+300P 적립</strong></p>
        <Button
          type="button"
          className="purple_btn"
          onClick={handleRewardClick}
          disabled={isRewardClaimed}
        >
          결과 공유하기
        </Button>
      </div>
      </div>

      {isCompleteAlertOpen ? (
        <Alert onClose={() => setIsCompleteAlertOpen(false)}>
          <ConfettiEffect contained />
          <div className="cvd_reward_alert">
            <RewardHero rewardAmount={COMMUNITY_VOTE_REWARD_POINTS} />
            <RewardPointCard
              currentPoints={profilePoints}
              rewardAmount={COMMUNITY_VOTE_REWARD_POINTS}
              onClick={() => navigate('/mypage')}
            />
            <Button type="button" className="purple_btn cvd_reward_confirm" onClick={confirmReward}>
              확인
            </Button>
          </div>
        </Alert>
      ) : null}
    </div>
  )
}

export default CommunityVoteResult
