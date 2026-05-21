import { useNavigate } from 'react-router'
import FloatingButton from './FloatingButton'
import aiChatBase from '../svg/aichat.svg'
import aiChatBubble from '../svg/aichat_bubble.svg'

type FloatingAiButtonProps = {
  className?: string
}

export default function FloatingAiButton({ className }: FloatingAiButtonProps) {
  const navigate = useNavigate()
  const buttonClassName = ['floating_button_ai_chat', className].filter(Boolean).join(' ')

  return (
    <FloatingButton
      placement="ai"
      className={buttonClassName}
      aria-label="AI assistant"
      onClick={() => navigate('/health/qna')}
    >
      <span className="floating_button_icon_frame" aria-hidden="true">
        <img className="floating_ai_chat_base" src={aiChatBase} alt="AI chat" />
        <img className="floating_ai_chat_bubble_image" src={aiChatBubble} alt="" />
      </span>
    </FloatingButton>
  )
}
