import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import EntryShell from '../components/EntryShell'
import OnboardingDailyRecordCat from '../components/OnboardingDailyRecordCat'
import OnboardingLayout from '../components/OnboardingLayout'
import Input from '../components/html/Input'
import onboardingWelcomeImage from '../img/onboarding/onboarding1.png'
import onboardingDogLoverSvg from '../svg/onboarding/onboarding2_doglover.svg?raw'
import onboardingCatLoverSvg from '../svg/onboarding/onboarding2_catlover.svg?raw'
import onboardingDogNameImage from '../img/onboarding/onboarding3_dog.png'
import onboardingCatNameImage from '../img/onboarding/onboarding3_cat.png'
import onboardingShareImage from '../img/onboarding/onboarding5.png'
import onboardingDogChatImage from '../img/onboarding/onboarding6_dog.png'
import onboardingCatChatImage from '../img/onboarding/onboarding6_cat.png'
import onboardingCompleteImage from '../img/onboarding/onboarding7.png'
import { markCurrentUserProfileSetupDone } from '../utils/authAccounts'
import { writeMyProfile } from '../utils/myProfile'
import { writePetProfile } from '../utils/petProfile'
import { defaultPetProfiles, writePetProfiles, writeSelectedPetProfileId } from '../utils/petProfiles'
import { writeSignupProfileDraft } from '../utils/signupProfileDraft'
import { voteDetails } from './community/CommunityVoteData'
import knowledge1 from '../img/petstory/Knowledge/knowledge1.png'
import knowledge2 from '../img/petstory/Knowledge/knowledge2.png'
import knowledge3 from '../img/petstory/Knowledge/knowledge3.png'
import knowledge4 from '../img/petstory/Knowledge/knowledge4.png'
import animalCardImage from '../img/animal_card.png'
import bannerIcon2Image from '../img/banner_icon2.png'
import weeklyRankFirstImage from '../img/home_lanking/lank1.png'
import weeklyRankSecondImage from '../img/home_lanking/lank2.png'
import weeklyRankThirdImage from '../img/home_lanking/lank3.png'
import lankGoldIcon from '../svg/home/lank_gold.svg'
import heartMessageImage from '../svg/heart_message.svg'
import cameraMessageImage from '../svg/camera_message.svg'
import onboardingDecoration1 from '../svg/onboarding/paw1.svg'
import onboardingDecoration2 from '../svg/onboarding/paw2.svg'
import onboardingDecoration3 from '../svg/onboarding/paw3.svg'
import onboardingDecoration4 from '../svg/onboarding/paw4.svg'
import onboardingDecoration5 from '../svg/onboarding/paw5.svg'
import onboardingDecoration6 from '../svg/onboarding/paw6.svg'
import foodBowlImage from '../img/food_bowl.png'
import defaultPetThumbnail from '../img/petstory/daily/daily_thumbnail.jpg'
import './onboarding.css'

type GuardianType = 'dog' | 'cat'
type OnboardingStep = 'welcome' | 'daily' | 'community' | 'ai' | 'profile' | 'petName' | 'complete'

const ONBOARDING_DONE_KEY = 'jibsalife.onboarding.done'

const guardianOptions = [
  {
    type: 'dog' as const,
    label: '멍멍 집사',
    figureSvg: onboardingDogLoverSvg,
  },
  {
    type: 'cat' as const,
    label: '냥냥 집사',
    figureSvg: onboardingCatLoverSvg,
  },
] as const

const introSlides = [
  {
    step: 'welcome' as const,
    title: '집사인생에\n오신 것을 환영해요!',
    subtitle: '우리 아이의 하루를 기록하고,\nAI와 함께 작은 변화도 살펴보세요.',
    image: onboardingWelcomeImage,
    alt: '온보딩 환영 일러스트',
    decorated: true,
  },
  {
    step: 'daily' as const,
    progress: 1,
    title: '우리 아이의\n일상을 기록해보세요',
    subtitle: '식사, 활동, 배변 기록 등으로\n건강 변화를 쉽게 확인할 수 있어요.',
    dogImage: '',
    catImage: '',
    alt: '일상 기록 안내 일러스트',
  },
  {
    step: 'community' as const,
    progress: 2,
    title: '다른 집사들과\n일상을 나눠보세요',
    subtitle: '같은 고민도 함께 나누면\n더 든든해요.',
    image: onboardingShareImage,
    alt: '커뮤니티 안내 일러스트',
  },
  {
    step: 'ai' as const,
    progress: 3,
    title: 'AI와 함께\n건강 변화를 살펴보세요',
    subtitle: '기록을 바탕으로\n이상 신호를 빠르게 확인할 수 있어요.',
    dogImage: onboardingDogChatImage,
    catImage: onboardingCatChatImage,
    alt: 'AI 건강 안내 일러스트',
  },
] as const

const introStepOrder = introSlides.map((slide) => slide.step)
const introSlideByStep = Object.fromEntries(introSlides.map((slide) => [slide.step, slide])) as Record<
  (typeof introStepOrder)[number],
  (typeof introSlides)[number]
>

const nicknameSuggestions = [
  '두근두근하루',
  '오늘의집사',
  '포근한기록',
  '말랑발바닥',
  '해피집사',
  '몽글몽글',
  '꼬리별집사',
  '간식요정',
  '캣워마스터',
  '댕냥친구',
  '우리집막내',
  '기록하는하루',
] as const

const petNameSuggestions = {
  dog: ['몽글이', '코코', '두부', '초코', '콩이', '보리', '구름이', '하루', '밤비', '토리'],
  cat: ['나비', '모찌', '루루', '치즈', '쿠키', '라떼', '별이', '먼지', '고미', '냥이'],
} as const

const onboardingDecorations = [
  onboardingDecoration1,
  onboardingDecoration2,
  onboardingDecoration3,
  onboardingDecoration4,
  onboardingDecoration5,
  onboardingDecoration6,
] as const

const bestPoseVoteImages =
  voteDetails.find((voteDetail) => voteDetail.id === 'best-pose')?.candidates.map((candidate) => candidate.image) ?? []

const onboardingCriticalImageSources = [
  onboardingWelcomeImage,
  onboardingDogNameImage,
  onboardingCatNameImage,
  onboardingCompleteImage,
  ...onboardingDecorations,
] as const

const onboardingDeferredImageSources = [
  onboardingShareImage,
  onboardingDogChatImage,
  onboardingCatChatImage,
] as const

const homePreloadImages = [
  ...defaultPetProfiles.map((profile) => profile.image),
  weeklyRankFirstImage,
  weeklyRankSecondImage,
  weeklyRankThirdImage,
  lankGoldIcon,
  ...bestPoseVoteImages,
  bannerIcon2Image,
  knowledge1,
  knowledge2,
  knowledge3,
  knowledge4,
  animalCardImage,
] as const

const homeCriticalImageSources = [
  defaultPetProfiles[0]?.image,
  defaultPetProfiles[1]?.image,
  weeklyRankFirstImage,
  weeklyRankSecondImage,
  weeklyRankThirdImage,
  bannerIcon2Image,
  knowledge1,
  knowledge2,
] as const

const homeDeferredImageSources = homePreloadImages.filter(
  (src): src is string => Boolean(src) && !homeCriticalImageSources.includes(src as (typeof homeCriticalImageSources)[number]),
)

const preloadedImages = new Set<string>()

function getRandomNicknameSuggestion() {
  return nicknameSuggestions[Math.floor(Math.random() * nicknameSuggestions.length)]
}

function getRandomPetNameSuggestion(type: GuardianType = 'dog') {
  const suggestions = petNameSuggestions[type]
  return suggestions[Math.floor(Math.random() * suggestions.length)]
}

function preloadImages(srcs: readonly string[], highPriority = false) {
  if (typeof window === 'undefined') return

  srcs.forEach((src) => {
    if (!src || preloadedImages.has(src)) return
    preloadedImages.add(src)

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    if (highPriority) {
      link.setAttribute('fetchpriority', 'high')
    }
    document.head.appendChild(link)

    const image = new Image()
    image.decoding = 'async'
    image.src = src
    image.decode?.().catch(() => {
      // Preload still warms the cache even if decoding is skipped.
    })
  })
}

function InlineGuardianFigure({ svg, type }: { svg: string; type: GuardianType }) {
  return (
    <span
      className={`onboarding_guardian_card_svg onboarding_guardian_card_svg_${type}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

function DecoratedOnboardingImage({
  src,
  alt,
  variant,
  imageClassName,
}: {
  src: string
  alt: string
  variant: 'welcome' | 'complete'
  imageClassName: string
}) {
  return (
    <div className={`onboarding_decorated_image onboarding_decorated_image_${variant}`}>
      {onboardingDecorations.map((decoration, index) => (
        <img
          key={`${variant}-${decoration}`}
          className={`onboarding_decoration onboarding_decoration_${index + 1}`}
          src={decoration}
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      ))}
      {variant === 'welcome' && (
        <>
          <img
            className="onboarding_welcome_float onboarding_welcome_float_heart"
            src={heartMessageImage}
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <img
            className="onboarding_welcome_float onboarding_welcome_float_camera"
            src={cameraMessageImage}
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </>
      )}
      <img
        className={`onboarding_visual_image ${imageClassName}`}
        src={src}
        alt={alt}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
    </div>
  )
}

function Onboarding() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const onboardingParams = new URLSearchParams(search)
  const isProfileSetup = onboardingParams.get('setup') === 'profile'
  const isSignupFlow = onboardingParams.get('flow') === 'signup'
  const pageRef = useRef<HTMLElement>(null)
  const [step, setStep] = useState<OnboardingStep>(() => ((isProfileSetup || isSignupFlow) ? 'profile' : 'welcome'))
  const [guardianType, setGuardianType] = useState<GuardianType | null>(null)
  const [profileName, setProfileName] = useState<string>(getRandomNicknameSuggestion)
  const [petName, setPetName] = useState('')

  const selectedType = guardianType ?? 'dog'
  const trimmedProfileName = profileName.trim()
  const trimmedPetName = petName.trim()

  useEffect(() => {
    document.documentElement.classList.add('onboarding-active')
    preloadImages([...onboardingCriticalImageSources, ...homeCriticalImageSources], true)

    const deferredTimer = window.setTimeout(() => {
      preloadImages([...onboardingDeferredImageSources, ...homeDeferredImageSources])
    }, 250)

    return () => {
      document.documentElement.classList.remove('onboarding-active')
      window.clearTimeout(deferredTimer)
    }
  }, [])

  useEffect(() => {
    pageRef.current?.scrollTo({ top: 0 })
    pageRef.current?.querySelector('.onboarding_layout')?.scrollTo({ top: 0 })
    window.scrollTo({ top: 0 })
  }, [step])

  const goToLogin = () => {
    localStorage.setItem(ONBOARDING_DONE_KEY, 'true')
    navigate('/login')
  }

  const handleIntroNext = () => {
    const currentIndex = introStepOrder.indexOf(step as (typeof introStepOrder)[number])
    const nextStep = introStepOrder[currentIndex + 1]

    if (nextStep) {
      setStep(nextStep)
      return
    }

    goToLogin()
  }

  const handleProfileNext = () => {
    if (!guardianType || trimmedProfileName.length < 2) return

    writeMyProfile({
      name: trimmedProfileName,
      guardianType,
    })
    setPetName(getRandomPetNameSuggestion(guardianType))
    setStep('petName')
  }

  const handlePetNameNext = () => {
    if (trimmedPetName.length < 1) return

    if (isSignupFlow && !isProfileSetup) {
      writeSignupProfileDraft({
        guardianType: selectedType,
        guardianName: trimmedProfileName,
        petName: trimmedPetName,
      })
      navigate('/signup')
      return
    }

    writePetProfile({ name: trimmedPetName })
    writePetProfiles([
      {
        id: 1,
        type: 'profile',
        name: trimmedPetName,
        breed: '',
        image: defaultPetThumbnail,
        birthDate: '',
        weight: '',
        sex: '',
      },
    ])
    writeSelectedPetProfileId(1)
    setStep('complete')
  }

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_DONE_KEY, 'true')
    markCurrentUserProfileSetupDone()
    navigate('/home')
  }

  const renderIntroStep = () => {
    const slide = introSlideByStep[step as (typeof introStepOrder)[number]]
    const isWelcomeStep = step === 'welcome'
    const progress = 'progress' in slide ? slide.progress : undefined
    const featureImageClassName =
      slide.step === 'daily'
        ? 'onboarding_visual_image onboarding_visual_image_feature onboarding_visual_image_feature_tall'
        : 'onboarding_visual_image onboarding_visual_image_feature onboarding_visual_image_feature_wide'
    const slideImage =
      'dogImage' in slide
        ? selectedType === 'dog'
          ? slide.dogImage
          : slide.catImage
        : slide.image
    const isDailyStep = slide.step === 'daily'

    return (
      <OnboardingLayout
        step={isWelcomeStep ? undefined : progress}
        totalSteps={isWelcomeStep ? undefined : 3}
        topActionLabel={isWelcomeStep ? undefined : '건너뛰기'}
        topActionInline={!isWelcomeStep}
        onTopAction={isWelcomeStep ? undefined : goToLogin}
        title={slide.title}
        subtitle={slide.subtitle}
        bodyGap={isWelcomeStep ? 74 : 39}
        visual={
          <div className="onboarding_intro_visual">
            {'decorated' in slide && slide.decorated ? (
              <DecoratedOnboardingImage
                src={slideImage}
                variant="welcome"
                imageClassName="onboarding_visual_image_welcome"
                alt={slide.alt}
              />
            ) : (
              <div
                className={
                  isDailyStep
                    ? 'onboarding_daily_note_motion'
                    : undefined
                }
              >
                {isDailyStep ? (
                  <>
                    <OnboardingDailyRecordCat className={featureImageClassName} />
                    <span className="onboarding_daily_thought" aria-hidden="true">
                      <span className="onboarding_daily_thought_bubble">
                        <img src={foodBowlImage} alt="" />
                      </span>
                      <span className="onboarding_daily_thought_dot onboarding_daily_thought_dot_1" />
                      <span className="onboarding_daily_thought_dot onboarding_daily_thought_dot_2" />
                    </span>
                  </>
                ) : (
                  <img
                    className={featureImageClassName}
                    src={slideImage}
                    alt={slide.alt}
                    aria-hidden="true"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                )}
              </div>
            )}
          </div>
        }
        actionLabel="다음"
        actionClassName="purple_btn onboarding_action_primary"
        onAction={handleIntroNext}
      />
    )
  }

  const renderProfileStep = () => (
    <OnboardingLayout
      title="집사 프로필 만들기"
      subtitle="캐릭터와 닉네임을 설정해주세요."
      bodyGap={32}
      visual={
        <div className="onboarding_guardian_visual">
          <div className="onboarding_guardian_grid">
            {guardianOptions.map((option) => {
              const isSelected = guardianType === option.type

              return (
                <button
                  key={option.type}
                  type="button"
                  className={`onboarding_guardian_card${isSelected ? ' is_selected' : ''}`}
                  onClick={() => setGuardianType(option.type)}
                >
                  <span className={`onboarding_guardian_card_figure onboarding_guardian_card_figure_${option.type}`} aria-hidden="true">
                    <InlineGuardianFigure svg={option.figureSvg} type={option.type} />
                  </span>
                  <strong className="title_h4_semibold">{option.label}</strong>
                  <span className="onboarding_guardian_card_check" aria-hidden="true">
                    <i className="bx bx-check" />
                  </span>
                </button>
              )
            })}
          </div>
          <p className="onboarding_guardian_select_hint">함께하는 반려동물에 맞는 프로필을 선택해주세요.</p>
        </div>
      }
      actionLabel="이 캐릭터로 시작하기"
      actionClassName="purple_btn onboarding_action_primary"
      actionDisabled={!guardianType || trimmedProfileName.length < 2}
      onAction={handleProfileNext}
    >
      <div className="onboarding_guardian_name_form">
        <Input
          value={profileName}
          placeholder="이름을 입력해 주세요"
          ariaLabel="집사 프로필 닉네임"
          onChange={setProfileName}
        />
        <p className="onboarding_guardian_name_hint">닉네임은 언제든지 수정할 수 있어요.</p>
      </div>
    </OnboardingLayout>
  )

  const renderPetNameStep = () => (
    <OnboardingLayout
      title="우리 아이 이름이 뭐예요?"
      subtitle="아이의 이름을 입력해주세요."
      bodyGap={32}
      visual={
        <div className="onboarding_petname_visual">
          <img
            className="onboarding_visual_image onboarding_visual_image_pet"
          src={selectedType === 'dog' ? onboardingDogNameImage : onboardingCatNameImage}
          alt="반려동물 이름 입력 안내 일러스트"
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          />
          <span className="onboarding_petname_thought" aria-hidden="true">
            <span className="onboarding_petname_thought_bubble">?</span>
            <span className="onboarding_petname_thought_dot onboarding_petname_thought_dot_1" />
            <span className="onboarding_petname_thought_dot onboarding_petname_thought_dot_2" />
          </span>
        </div>
      }
      actionLabel="다음"
      actionClassName="purple_btn onboarding_action_primary"
      actionDisabled={trimmedPetName.length < 1}
      onAction={handlePetNameNext}
    >
      <div className="onboarding_name_form">
        <Input
          value={petName}
          placeholder="이름을 입력해 주세요"
          ariaLabel="반려동물 이름"
          onChange={setPetName}
        />
        <p className="onboarding_name_hint">
          2마리 이상인 경우 대표 아이 이름으로 기록돼요.
          <br />
          추후 반려동물 추가 및 수정이 가능해요.
        </p>
      </div>
    </OnboardingLayout>
  )

  const renderCompleteStep = () => (
    <OnboardingLayout
      title={`${trimmedProfileName || profileName} 집사님,\n준비가 완료됐어요!`}
      subtitle="우리 아이의 소중한 하루를 기록해보세요."
      bodyGap={76}
      visual={
        <DecoratedOnboardingImage
          src={onboardingCompleteImage}
          variant="complete"
          imageClassName="onboarding_visual_image_complete"
          alt="온보딩 완료 일러스트"
        />
      }
      actionLabel="집사인생 시작하기"
      actionClassName="purple_btn onboarding_action_primary onboarding_action_start"
      onAction={handleComplete}
    />
  )

  const renderStep = () => {
    if (introStepOrder.includes(step as (typeof introStepOrder)[number])) return renderIntroStep()
    if (step === 'profile') return renderProfileStep()
    if (step === 'petName') return renderPetNameStep()
    return renderCompleteStep()
  }

  return (
    <EntryShell as="main" ref={pageRef} className="onboarding_page">
      {false ? (
        <button type="button" className="onboarding_skip_button caption_medium" onClick={goToLogin}>
          건너뛰기
        </button>
      ) : null}
      {renderStep()}
    </EntryShell>
  )
}

export default Onboarding
