import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import './Health.css'
import './HealthQna.css'
import PageHeader from '../../components/PageHeader'
import ChatRoom from '../../components/ChatRoom'
import type { ChatAction, ChatMessage } from '../../components/ChatRoom'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import HeaderIcon from '../../components/HeaderIcon'
import mascotImage from '../../img/onboarding/onboarding3_mascot.png'
import {
  appendChatbotRecord,
  readChatbotDataStore,
  upsertChatbotFeedback,
  type ChatbotRecordCategory,
  type ChatbotFeedbackType,
} from '../../utils/chatbotRecords'
import {
  parseMealRecordDetail,
  parsePoopRecordDetail,
  parseSymptomRecordDetail,
  parseWalkActivityDetail,
  writeMissionActivityRecord,
  writeMissionMealRecord,
  writeMissionPoopRecord,
  writeMissionSymptomRecord,
} from '../../utils/missionActivityRecords'
import { MY_PROFILE_CHANGE_EVENT, readMyProfileName } from '../../utils/myProfile'
import { showStateBarMessage } from '../../utils/stateBarMessage'
import { readSelectedPetProfileName } from '../../utils/petProfiles'
import { addUserNotification } from '../../utils/userNotifications'

type RecordKind = 'meal' | 'poop' | 'symptom' | 'activity'

type RecordDraft = {
  kind: RecordKind
  category: ChatbotRecordCategory
  value: string
  calendarDetail: string
  walkTime?: string
}

type PendingOtherRecord = {
  kind: RecordKind
  category: ChatbotRecordCategory
}

const HEALTH_QNA_STORAGE_KEY = 'jibsalife.health.qna.history'

const DUMMY_RESPONSES = [
  '최근 기록을 보니 식사량이 안정적이에요. 꾸준히 기록해 주시면 더 정확하게 파악할 수 있어요 🐾',
  '산책은 규칙적으로 하고 있군요! 활동량이 유지되면 소화도 잘 되고 스트레스 해소에도 도움이 돼요.',
  '배변 상태가 정상이라면 지금 식단을 유지해 주세요. 변화가 생기면 꼭 기록해 두세요.',
  '오늘 기록해 주신 내용 잘 확인했어요. 이상 신호가 보이면 병원 상담을 권해드려요.',
  '반려동물의 컨디션은 매일 조금씩 다를 수 있어요. 꾸준한 기록이 건강 관리의 시작이에요 🌿',
  '식욕이 평소와 다르다면 하루 이틀 더 지켜보시고, 계속되면 병원에 방문해 보세요.',
  '활동량이 줄었다면 날씨나 환경 변화 때문일 수도 있어요. 며칠 관찰 후 변화가 없으면 상담받아 보세요.',
  '물 섭취량도 함께 체크해 주시면 더 좋아요. 충분한 수분 섭취는 건강 유지에 중요하답니다 💧',
]

let dummyResponseIndex = 0
const RECORD_CHIPS = ['식사', '배변·배뇨', '증상', '활동'] as const
const DEFAULT_CHIPS = ['식사', '배변·배뇨', '증상', '활동', '캘린더', '커뮤니티', '투표', '주변병원'] as const
const WALK_TIME_OPTIONS = ['10분 미만', '10~30분', '30~60분', '60분 이상'] as const

const chipResponses = {
  식사: {
    message: '오늘 식사는 어땠나요? 🍽️',
    options: ['잘 먹음', '보통', '조금 먹음', '안 먹음'],
    kind: 'meal' as const,
    category: '식사' as const,
  },
  '배변·배뇨': {
    message: '오늘 배변 상태는 어땠나요? 🐾',
    options: ['정상', '묽음', '딱딱함', '이상 있음'],
    kind: 'poop' as const,
    category: '배변' as const,
  },
  증상: {
    message: '오늘 눈에 띄는 변화가 있었나요?',
    options: ['무기력', '구토', '설사', '긁음', '기침', '없음'],
    kind: 'symptom' as const,
    category: '증상' as const,
  },
  활동: {
    message: '오늘 활동은 어땠나요? 🐕',
    options: ['활발', '보통', '적음', '거의 없음'],
    kind: 'activity' as const,
    category: '활동' as const,
  },
} as const

const calendarQuickMessageOptions: Record<RecordKind, string[]> = {
  meal: ['사료 30g', '사료 60g', '사료 90g', '사료 120g', '사료 150g', '기타'],
  poop: ['정상 변', '묽은 변', '딱딱한 변', '배변 못함', '소변 잦음', '실수 배뇨', '평소와 다름', '기타'],
  symptom: ['기침', '재채기', '구토', '설사', '헐떡', '무기력', '긁음', '기타'],
  activity: ['활발함', '보통', '활동 적음', '무기력', '평소와 다름', '기타'],
}

function createIntroMessages(profileName: string): ChatMessage[] {
  return [
    {
      id: 1,
      sender: 'bot',
      text:
        `${profileName}님 안녕하세요, 집사님 🐾\n` +
        `오늘 우리 아이 상태를 함께 확인해볼까요?\n\n` +
        `식사·산책·배변 기록을 기반으로\n` +
        `변화를 정리해드릴게요.`,
      chips: [...DEFAULT_CHIPS],
    },
  ]
}

void createIntroMessages

function buildMessageId() {
  return Date.now() + Math.floor(Math.random() * 1000)
}

function buildContinueMessage(): ChatMessage {
  return {
    id: buildMessageId(),
    sender: 'bot',
    text: '좋아요 🐾 오늘 상태를 더 기록해볼까요?',
    chips: [...DEFAULT_CHIPS],
  }
}

function buildRecordCategoryMessage(): ChatMessage {
  return {
    id: buildMessageId(),
    sender: 'bot',
    text: '좋아요! 오늘 상태를 어떤 항목으로 기록해볼까요?',
    chips: [...RECORD_CHIPS],
  }
}

void buildContinueMessage
void buildRecordCategoryMessage

function buildGeneralRecordNudgeMessage(): ChatMessage {
  const nudges: ChatMessage[] = [
    {
      id: buildMessageId(),
      sender: 'bot',
      text:
        '오늘 기록 완료! 🐾 우리 아이 건강 습관, 챌린지로 이어가볼까요?\n\n' +
        '꾸준한 기록이 건강의 시작이에요. 7일 건강 챌린지에 도전해보세요!',
      chips: ['챌린지'],
    },
    {
      id: buildMessageId(),
      sender: 'bot',
      text:
        '오늘 기록 수고하셨어요! 집사님들은 어떻게 생각하실까요? 투표에 참여해보세요\n\n' +
        '우리 아이만 이런 걸까요? 다른 집사님들 의견이 궁금하다면 👇',
      chips: ['투표'],
    },
  ]

  return nudges[Math.floor(Math.random() * nudges.length)]
}

function buildWalkRecordNudgeMessage(): ChatMessage {
  return {
    id: buildMessageId(),
    sender: 'bot',
    text:
      '산책 기록 보니까, 새로운 코스 찾고 계신가요? 근처 추천 장소 확인해보세요!\n\n' +
      '우리 아이가 좋아할 만한 장소, 여기서 찾아보세요',
    chips: ['장소'],
  }
}

function buildDismissNudgeMessage(): ChatMessage {
  return {
    id: buildMessageId(),
    sender: 'bot',
    text:
      '오늘은 패스! 🐾\n' +
      '지금 커뮤니티에서 핫한 소식 구경해볼까요?',
    chips: ['커뮤니티', '챌린지', '투표', '장소'],
  }
}

function writeMissionRecordByKind(kind: RecordKind, detail: string) {
  if (kind === 'meal') return writeMissionMealRecord(detail)
  if (kind === 'poop') return writeMissionPoopRecord(detail)
  if (kind === 'symptom') return writeMissionSymptomRecord(detail)
  return writeMissionActivityRecord(detail)
}

function saveRecordDraft(draft: RecordDraft) {
  appendChatbotRecord({
    category: draft.category,
    value: draft.value,
    walkTime: draft.walkTime,
  })
}

function buildConfirmMessage(draft: RecordDraft, profileName: string, preface?: string): ChatMessage {
  const confirmText = preface
    ? `${preface}\n캘린더에 ${profileName}의 ${draft.calendarDetail}을 등록할까요?`
    : `캘린더에 ${profileName}의 ${draft.calendarDetail}을 등록할까요?`

  return {
    id: buildMessageId(),
    sender: 'bot',
    text: confirmText,
    actions: [
      { label: '아니요', value: 'dismiss' },
      {
        label: '등록하기',
        variant: 'primary',
        value: 'register',
        data: {
          kind: draft.kind,
          category: draft.category,
          value: draft.value,
          calendarDetail: draft.calendarDetail,
          walkTime: draft.walkTime ?? '',
        },
      },
    ],
    showFeedback: true,
  }
}

function buildChipOptionMessage(chip: keyof typeof chipResponses): ChatMessage {
  const response = chipResponses[chip]
  const options = calendarQuickMessageOptions[response.kind]

  return {
    id: buildMessageId(),
    sender: 'bot',
    text: response.message,
    actions: options.map((option) => ({
      label: option,
      value: 'select-option',
      data: {
        kind: response.kind,
        category: response.category,
        value: option,
      },
    })),
  }
}

function buildWalkTimeMessage(activityValue: string): ChatMessage {
  return {
    id: buildMessageId(),
    sender: 'bot',
    text: '산책 시간은 어느 정도였나요? ⏱️',
    actions: WALK_TIME_OPTIONS.map((walkTime) => ({
      label: walkTime,
      value: 'select-walk-time',
      data: {
        kind: 'activity',
        category: '활동',
        value: activityValue,
        walkTime,
      },
    })),
  }
}

void buildWalkTimeMessage

function buildFeedbackSelections() {
  return readChatbotDataStore().feedbacks.reduce<Record<number, ChatbotFeedbackType>>(
    (result, feedback) => {
      const messageId = Number(feedback.messageId)
      if (!Number.isNaN(messageId)) {
        result[messageId] = feedback.type
      }
      return result
    },
    {},
  )
}

function HealthQna() {
  const navigate = useNavigate()
  const [profileName, setProfileName] = useState(() => readMyProfileName())
  const [feedbackSelections, setFeedbackSelections] = useState(buildFeedbackSelections)
  const [pendingOtherRecord, setPendingOtherRecord] = useState<PendingOtherRecord | null>(null)
  const [chatCount, setChatCount] = useState(0)
  const introMessages = useMemo<ChatMessage[]>(() => [
    {
      id: 1,
      sender: 'bot',
      text:
        `${profileName}님 안녕하세요, 집사님 🐾\n` +
        `오늘 우리 아이 상태를 함께 확인해볼까요?\n\n` +
        `식사·산책·배변 기록을 기반으로\n` +
        `변화를 정리해드릴게요.`,
    },
  ], [profileName])
  const introMessagesWithChips = useMemo<ChatMessage[]>(
    () => introMessages.map((message, index) => (
      index === 0
        ? {
            ...message,
            chips: ['식사량', '배변배뇨', '산책', '활동'],
          }
        : message
    )),
    [introMessages],
  )

  useEffect(() => {
    const syncProfileName = () => {
      setProfileName(readMyProfileName())
    }

    window.addEventListener(MY_PROFILE_CHANGE_EVENT, syncProfileName)
    window.addEventListener('storage', syncProfileName)

    return () => {
      window.removeEventListener(MY_PROFILE_CHANGE_EVENT, syncProfileName)
      window.removeEventListener('storage', syncProfileName)
    }
  }, [])

  const handleChipSelect = (chip: string) => {
    setPendingOtherRecord(null)
    if (chip === '식사량') return buildChipOptionMessage('??밴텢' as keyof typeof chipResponses)
    if (chip === '배변배뇨') return buildChipOptionMessage('獄쏄퀡?夷뚩쳸怨뺣닁' as keyof typeof chipResponses)
    if (chip === '산책') return buildWalkTimeMessage('산책')
    if (chip === '활동') return buildChipOptionMessage('??뺣짗' as keyof typeof chipResponses)

    if (chip === '식사' || chip === '배변·배뇨' || chip === '증상' || chip === '활동') {
      return buildChipOptionMessage(chip)
    }

    if (chip === '캘린더') {
      navigate('/mission')
      return
    }

    if (chip === '커뮤니티') {
      navigate('/community')
      return
    }

    if (chip === '투표') {
      navigate('/community/vote')
      return
    }

    if (chip === '주변병원') {
      navigate('/place')
    }
  }

  void handleChipSelect

  const handleHealthChipSelect = (chip: string) => {
    setPendingOtherRecord(null)

    if (chip === '식사' || chip === '배변·배뇨' || chip === '증상' || chip === '활동') {
      const chipMap = {
        식사: '?앹궗',
        '배변·배뇨': '諛곕?쨌諛곕눊',
        증상: '利앹긽',
        활동: '?쒕룞',
      } as const

      // @ts-expect-error legacy localized chip map kept for compatibility
      return buildChipOptionMessage(chipMap[chip as keyof typeof chipMap])
    }

    if (chip === '커뮤니티') {
      navigate('/community')
      return
    }

    if (chip === '챌린지') {
      navigate('/community/challenge')
      return
    }

    if (chip === '투표') {
      navigate('/community/vote')
      return
    }

    if (chip === '장소') {
      navigate('/place')
    }
  }

  void handleHealthChipSelect

  const handleChatChipSelect = (chip: string) => {
    setPendingOtherRecord(null)
    if (chip === '식사량') return buildChipOptionMessage('식사')
    if (chip === '배변배뇨') return buildChipOptionMessage('배변·배뇨')
    if (chip === '산책') return buildWalkTimeMessage('산책')
    if (chip === '활동') return buildChipOptionMessage('활동')
    if (chip === '식사' || chip === '배변·배뇨' || chip === '증상') {
      return buildChipOptionMessage(chip)
    }
    if (chip === '커뮤니티') { navigate('/community'); return }
    if (chip === '챌린지') { navigate('/community/challenge'); return }
    if (chip === '투표') { navigate('/community/vote'); return }
    if (chip === '장소') { navigate('/place') }
  }

  const handleMessageSubmit = async (
    message: string,
    recentMessages: ChatMessage[]
  ) => {
    if (chatCount >= 10) {
      return {
        id: buildMessageId(),
        sender: 'bot' as const,
        text: 'AI 상담은 하루 10회까지 이용할 수 있어요.',
      }
    }

  if (pendingOtherRecord) {
      const draft: RecordDraft = {
        kind: pendingOtherRecord.kind,
        category: pendingOtherRecord.category,
        value: message,
        calendarDetail: message,
      }

      setPendingOtherRecord(null)
      saveRecordDraft(draft)

      return buildConfirmMessage(draft, profileName)
    }

    const walkActivityDetail = parseWalkActivityDetail(message)
    if (walkActivityDetail) {
      const walkTime = walkActivityDetail.replace(/^산책\s*/, '')
      const draft: RecordDraft = {
        kind: 'activity',
        category: '활동',
        value: walkActivityDetail,
        walkTime,
        calendarDetail: walkActivityDetail,
      }
      saveRecordDraft(draft)
      return buildConfirmMessage(draft, profileName, '활동 기록을 저장했어요.')
    }

    const mealRecordDetail = parseMealRecordDetail(message)
    if (mealRecordDetail) {
      const draft: RecordDraft = {
        kind: 'meal',
        category: '식사',
        value: mealRecordDetail,
        calendarDetail: mealRecordDetail,
      }
      saveRecordDraft(draft)
      return buildConfirmMessage(draft, profileName, '식사 기록을 저장했어요.')
    }

    const poopRecordDetail = parsePoopRecordDetail(message)
    if (poopRecordDetail) {
      const draft: RecordDraft = {
        kind: 'poop',
        category: '배변',
        value: poopRecordDetail,
        calendarDetail: poopRecordDetail,
      }
      saveRecordDraft(draft)
      return buildConfirmMessage(draft, profileName, '배변 기록을 저장했어요.')
    }

    const symptomRecordDetail = parseSymptomRecordDetail(message)
    if (symptomRecordDetail) {
      const draft: RecordDraft = {
        kind: 'symptom',
        category: '증상',
        value: symptomRecordDetail,
        calendarDetail: symptomRecordDetail,
      }
      saveRecordDraft(draft)
      return buildConfirmMessage(draft, profileName, '증상 기록을 저장했어요.')
    }

    try {

  const res = await fetch(
    "/api/chat",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        message,

        recentMessages: recentMessages.map(
          (item) => `${item.sender}: ${item.text}`
        ),

        petRecord: `
          05/13 기록
          - 식사: 120g
          - 산책: 30분
          - 배변·배뇨: 정상 변

          05/14 기록
          - 식사: 120g
          - 활동: 활발함
          - 배변·배뇨: 정상 변

          05/15 기록
          - 식사: 120g
          - 활동: 활발함
          - 증상: 재채기
        `
        }),
      }
    )

      if (!res.ok) throw new Error(`server error ${res.status}`)

      const data = await res.json()

      setChatCount((count) => count + 1)

      return {
        id: buildMessageId(),
        sender: 'bot' as const,
        text: data.answer,
      }

    } catch {

    const dummyText = DUMMY_RESPONSES[dummyResponseIndex % DUMMY_RESPONSES.length]
    dummyResponseIndex++

    return {
      id: buildMessageId(),
      sender: 'bot' as const,
      text: dummyText,
    }
  }
}

  const handleActionSelect = (action: ChatAction) => {
    if (action.value === 'dismiss') {
      setPendingOtherRecord(null)
      return buildDismissNudgeMessage()
    }

    if (action.value === 'register') {
      setPendingOtherRecord(null)
      const kind = action.data?.kind as RecordKind | undefined
      const calendarDetail = action.data?.calendarDetail
      if (!kind || !calendarDetail) return

      writeMissionRecordByKind(kind, calendarDetail)
      showStateBarMessage(`${readSelectedPetProfileName()}의 기록이 저장되었어요.`)
      addUserNotification({
        title: '건강 기록',
        content: `${readSelectedPetProfileName()}의 기록이 저장되었어요.`,
        path: '/mission',
      })

      return [
        {
          id: buildMessageId(),
          sender: 'bot' as const,
          text: `등록 완료했어요.\n캘린더에서 ${calendarDetail} 기록을 확인해보세요.`,
        },
        kind === 'activity' && calendarDetail.includes('산책')
          ? buildWalkRecordNudgeMessage()
          : buildGeneralRecordNudgeMessage(),
      ]
    }

    if (action.value === 'select-option') {
      const kind = action.data?.kind as RecordKind | undefined
      const category = action.data?.category as ChatbotRecordCategory | undefined
      const value = action.data?.value

      if (!kind || !category || !value) return

      if (value === '기타') {
        setPendingOtherRecord({ kind, category })

        return {
          id: buildMessageId(),
          sender: 'bot' as const,
          text: '추가로 기록할 내용을 입력해 주세요.',
        }
      }

      setPendingOtherRecord(null)

      const draft: RecordDraft = {
        kind,
        category,
        value,
        calendarDetail: value,
      }

      saveRecordDraft(draft)

      return buildConfirmMessage(draft, profileName)
    }

    if (action.value === 'select-walk-time') {
      const value = action.data?.value
      const walkTime = action.data?.walkTime
      if (!value || !walkTime) return

      const draft: RecordDraft = {
        kind: 'activity',
        category: '활동',
        value,
        walkTime,
        calendarDetail: `산책 ${walkTime}`,
      }

      saveRecordDraft(draft)

      return buildConfirmMessage(
        draft,
        profileName,
        `활동은 ${value}, 산책 시간은 ${walkTime}으로 저장했어요.`,
      )
    }
  }

  const handleFeedbackSelect = (message: ChatMessage, type: ChatbotFeedbackType) => {
    upsertChatbotFeedback({
      messageId: String(message.id),
      type,
    })
    setFeedbackSelections((currentSelections) => ({
      ...currentSelections,
      [message.id]: type,
    }))
  }

  return (
    <>
      <PageHeader
        title="AI 건강 체크"
        leftContent={<BackButton />}
        rightContent={(
          <>
            <Button type="button" aria-label="캘린더" onClick={() => navigate('/mission')}>
              <HeaderIcon type="calendar" />
            </Button>
            <Button
              type="button"
              aria-label="알림"
              onClick={() => navigate('/notification')}
            >
              <HeaderIcon type="notification" />
            </Button>
          </>
        )}
      />
      <main className="page health_page health_qna_page">
        <ChatRoom
          key={profileName}
          initialMessages={introMessagesWithChips}
          bottomPromptMessage={introMessagesWithChips[0]}
          storageKey={HEALTH_QNA_STORAGE_KEY}
          placeholder="메시지를 입력해 주세요."
          submitLabel="보내기"
          helpText="도움이 되셨나요?"
          ariaLabel="AI 건강 체크 채팅"
          inputAriaLabel="채팅 메시지"
          botName="AI 챗봇"
          botAvatarSrc={mascotImage}
          feedbackSelections={feedbackSelections}
          onChipSelect={handleChatChipSelect}
          onMessageSubmit={handleMessageSubmit}
          onActionSelect={handleActionSelect}
          onFeedbackSelect={handleFeedbackSelect}
        />
      </main>
    </>
  )
}

export default HealthQna
