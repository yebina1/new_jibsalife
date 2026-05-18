import './Health.css'
import './HealthQna.css'
import PageHeader from '../../components/PageHeader'
import ChatRoom from '../../components/ChatRoom'
import type { ChatMessage } from '../../components/ChatRoom'
import BackButton from '../../components/html/BackButton'

const vetChatMessages: ChatMessage[] = [
  {
    id: 1,
    sender: 'user',
    text: '산책 시간을 늘려야 될까요?',
  },
  {
    id: 2,
    sender: 'bot',
    text: '현재 패턴을 보면 스트레스 가능성이 있어 산책 시간을 10-15분 정도 늘려주는 것이 도움이 될 수 있어요. 다만, 아이의 컨디션을 보면서 조금씩 조절해 주세요.',
  },
  {
    id: 3,
    sender: 'user',
    text: '사료를 바꿔도 될까요?',
  },
  {
    id: 4,
    sender: 'bot',
    text: '갑작스러운 사료 변경은 소화 불량을 유발할 수 있어요. 현재 사료와 새 사료를 유지하면서 7일 이내에 서서히 교체하는 것을 추천드려요.',
  },
]

function HealthVetChat() {
  return (
    <>
      <PageHeader
        title="수의사 상담"
        leftContent={<BackButton />}
        rightContent={<span>상담종료</span>}
      />
      <main className="page health_page health_qna_page">
        <ChatRoom
          initialMessages={vetChatMessages}
          placeholder="메시지를 입력해 주세요"
          submitLabel="보내기"
          helpText="도움이 되셨나요?"
          ariaLabel="수의사 상담 채팅"
          inputAriaLabel="상담 메시지"
          showToolButton={false}
        />
      </main>
    </>
  )
}

export default HealthVetChat
