import './Home.css'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import ChevronIcon from '../components/ChevronIcon'
import PageHeader from '../components/PageHeader'
import HeaderIcon from '../components/HeaderIcon'
import ContentSection from '../components/ContentSection'
import SummaryProfileCard, { SummaryProfileAddCard } from '../components/SummaryProfileCard'
import Button from '../components/html/Button'
import pungpungiImage from '../img/pungpungi.png'
import leeyoriImage from '../img/leeyori.png'
import contents1 from '../img/contents1.png'
import contents2 from '../img/contents2.png'
import contents3 from '../img/contents3.png'
import contents4 from '../img/contents4.png'
import kongyiImage from '../img/kongyi.png'
import gongnangyiImage from '../img/gongnangyi.png'
import mocaImage from '../img/moca.png'
import goldIcon from '../img/gold.png'
import silverIcon from '../img/silver.png'
import bronzeIcon from '../img/bronze.png'

const rankingData = {
  subscribers: [
    { id: 1, name: '콩이', image: kongyiImage, icon: goldIcon, rank: '1위' },
    { id: 2, name: '공냥이', image: gongnangyiImage, icon: silverIcon, rank: '2위' },
    { id: 3, name: '모카', image: mocaImage, icon: bronzeIcon, rank: '3위' },
  ],
  points: [
    { id: 1, name: '콩이', image: kongyiImage, icon: goldIcon, rank: '1위' },
    { id: 2, name: '공냥이', image: gongnangyiImage, icon: silverIcon, rank: '2위' },
    { id: 3, name: '모카', image: mocaImage, icon: bronzeIcon, rank: '3위' },
  ],
} as const

const contentItems = [
  { id: 1, title: '활동량이 줄어든 아이를 위한 추천 장난감', image: contents1 },
  { id: 2, title: '우리 아이 상태별 추천 혜택', image: contents2 },
  { id: 3, title: '우리 아이 상태별 추천 혜택', image: contents3 },
  { id: 4, title: '반려견을 위한 케어 아이템 3종', image: contents4 },
]

const summarySlides = [
  {
    id: 1,
    type: 'profile',
    name: '이요리',
    breed: '코리안 쇼트 헤어',
    image: leeyoriImage,
    details: '나이: 5살 · 몸무게: 3 kg · 성별: 남아',
    stats: [
      { label: '식사', value: '1회' },
      { label: '배변', value: '2회' },
      { label: '산책', value: '10분' },
    ],
  },
  {
    id: 2,
    type: 'profile',
    name: '뿡뿡이',
    breed: '포메라니안',
    image: pungpungiImage,
    details: '나이: 2살 · 몸무게: 5 kg · 성별: 남아',
    stats: [
      { label: '식사', value: '3회' },
      { label: '배변', value: '1회' },
      { label: '산책', value: '100분' },
    ],
  },
  {
    id: 3,
    type: 'add',
  },
] as const

function formatTodaySummaryDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}년 ${month}월 ${day}일`
}

function Home() {
  const navigate = useNavigate()
  const [rankingType, setRankingType] = useState<'subscribers' | 'points'>('subscribers')
  const [rankingSlideDirection, setRankingSlideDirection] = useState<'left' | 'right' | null>(null)
  const [summarySlideIndex, setSummarySlideIndex] = useState(1)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStateRef = useRef({ startX: 0 })

  const rankingItems = rankingData[rankingType]
  const todaySummaryDate = formatTodaySummaryDate()

  const toggleRankingType = () => {
    setRankingType((current) => {
      const next = current === 'subscribers' ? 'points' : 'subscribers'
      setRankingSlideDirection(next === 'points' ? 'left' : 'right')
      return next
    })
  }

  const handleDragStart = (clientX: number) => {
    dragStateRef.current.startX = clientX
    setIsDragging(true)
    setDragOffset(0)
  }

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return
    setDragOffset(clientX - dragStateRef.current.startX)
  }

  const handleDragEnd = () => {
    if (!isDragging) return

    const threshold = 56

    if (dragOffset <= -threshold && summarySlideIndex < summarySlides.length - 1) {
      setSummarySlideIndex((current) => current + 1)
    } else if (dragOffset >= threshold && summarySlideIndex > 0) {
      setSummarySlideIndex((current) => current - 1)
    }

    setIsDragging(false)
    setDragOffset(0)
  }

  return (
    <>
      <PageHeader
        title="집사인생"
        rightContent={
          <>
            <Button type="button" aria-label="캘린더" onClick={() => navigate('/mission')}>
              <HeaderIcon type="calendar" />
            </Button>
            <Button type="button" aria-label="알림" className="home_header_notification">
              <HeaderIcon type="notification" />
            </Button>
          </>
        }
      />

      <main className="page home_page">
        <ContentSection
          className="home_section home_summary_section"
          headerClassName="home_summary_header"
          title="오늘의 요약"
          subtitle={todaySummaryDate}
        >
          <div
            className="summary_slider"
            aria-label="오늘의 요약 슬라이드"
            onPointerDown={(event) => {
              handleDragStart(event.clientX)
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerMove={(event) => handleDragMove(event.clientX)}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId)
              }
              handleDragEnd()
            }}
            onPointerCancel={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId)
              }
              handleDragEnd()
            }}
          >
            <div
              className={`summary_slider_track ${isDragging ? 'dragging' : ''}`}
              style={{
                transform: `translateX(calc(-${summarySlideIndex * 100}% - ${summarySlideIndex * 8}px + ${dragOffset}px))`,
              }}
            >
              {summarySlides.map((slide) =>
                slide.type === 'add' ? (
                  <SummaryProfileAddCard key={slide.id} onClick={() => navigate('/mypage')} />
                ) : (
                  <SummaryProfileCard
                    key={slide.id}
                    image={slide.image}
                    name={slide.name}
                    breed={slide.breed}
                    details={slide.details}
                    stats={slide.stats}
                  />
                ),
              )}
            </div>

            <div className="summary_slider_dots" aria-label="요약 슬라이드 페이지">
              {summarySlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  className={index === summarySlideIndex ? 'active' : ''}
                  aria-label={`${index + 1}번 요약 보기`}
                  aria-pressed={index === summarySlideIndex}
                  onClick={() => setSummarySlideIndex(index)}
                />
              ))}
            </div>
          </div>
        </ContentSection>

        <ContentSection
          className="home_section"
          title="이달의 랭킹"
          subtitle="참여할수록 순위가 올라가요"
          action={
            <button
              type="button"
              className={`ranking_switch ${rankingType === 'points' ? 'points' : ''}`}
              aria-label="랭킹 기준 전환"
              onClick={toggleRankingType}
            >
              <span className="ranking_switch_track" aria-hidden="true">
                <span className="ranking_switch_thumb" />
              </span>
              <span
                className={`ranking_switch_label ${rankingType === 'subscribers' ? 'active' : ''}`}
              >
                구독자
              </span>
              <span className={`ranking_switch_label ${rankingType === 'points' ? 'active' : ''}`}>
                포인트
              </span>
            </button>
          }
        >

          <div
            className={`ranking_grid ${
              rankingSlideDirection ? `slide_${rankingSlideDirection}` : ''
            }`}
            key={rankingType}
            onAnimationEnd={() => setRankingSlideDirection(null)}
          >
            {rankingItems.map((item) => (
              <article key={item.id} className="ranking_card">
                <img className="ranking_card_image" src={item.image} alt={`${item.name} 프로필`} />
                <p>
                  <span className="ranking_card_icon" aria-hidden="true">
                    <img src={item.icon} alt="" />
                  </span>
                  {item.rank}: {item.name}
                </p>
              </article>
            ))}
          </div>

          <Button type="button" className="more_button">
            더보기
            <ChevronIcon direction="right" size="md" />
          </Button>
        </ContentSection>

        <ContentSection className="home_section home_content_section" title="추천 콘텐츠">
          <div className="content_grid">
            {contentItems.map((item) => (
              <article key={item.id} className="content_card">
                <img src={item.image} alt={item.title} />
                <div className="content_overlay">
                  <p>{item.title}</p>
                </div>
              </article>
            ))}
          </div>

          <Button type="button" className="more_button">
            더보기
            <ChevronIcon direction="right" size="md" />
          </Button>
        </ContentSection>
      </main>
    </>
  )
}

export default Home
