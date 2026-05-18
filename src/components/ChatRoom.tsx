import { useEffect, useRef, useState } from 'react'
import './ChatRoom.css'
import { createLocalChatbotAnswer } from '../utils/localChatbotAnswers'

export type ChatAction = {
  label: string
  variant?: 'outline' | 'primary'
  value?: string
  data?: Record<string, string>
}

export type ChatMessage = {
  id: number
  sender: 'user' | 'bot'
  text: string
  chips?: string[]
  actions?: ChatAction[]
  showFeedback?: boolean
}

type FeedbackType = 'like' | 'dislike'

type ChatRoomResponse =
  | void
  | ChatMessage
  | ChatMessage[]
  | Promise<void | ChatMessage | ChatMessage[]>

type ChatRoomProps = {
  initialMessages: ChatMessage[]
  bottomPromptMessage?: ChatMessage
  storageKey?: string
  placeholder: string
  submitLabel: string
  helpText: string
  ariaLabel: string
  inputAriaLabel: string
  botName?: string
  botAvatarSrc?: string
  showToolButton?: boolean
  feedbackSelections?: Record<number, FeedbackType>
  onChipSelect?: (chip: string) => void | ChatMessage | ChatMessage[]
  onMessageSubmit?: (
    message: string,
    recentMessages: ChatMessage[]
  ) => ChatRoomResponse
  onActionSelect?: (
    action: ChatAction,
    sourceMessage: ChatMessage,
  ) => void | ChatMessage | ChatMessage[]
  onFeedbackSelect?: (message: ChatMessage, type: FeedbackType) => void
}

function ChatRoom({
  initialMessages,
  bottomPromptMessage,
  storageKey,
  placeholder,
  submitLabel,
  helpText,
  ariaLabel,
  inputAriaLabel,
  botName = 'AI 챗봇',
  botAvatarSrc,
  showToolButton = true,
  feedbackSelections,
  onChipSelect,
  onMessageSubmit,
  onActionSelect,
  onFeedbackSelect,
}: ChatRoomProps) {
  const initialMessageCount = initialMessages.length
  const initialChatState = (() => {
    if (!storageKey || typeof window === 'undefined') return initialMessages

    let hasRestoredHistory = false

    try {
      const savedValue = window.localStorage.getItem(storageKey)
      if (!savedValue) return initialMessages

      const parsedValue = JSON.parse(savedValue)
      if (!Array.isArray(parsedValue)) return initialMessages

      const savedMessages = parsedValue.filter((message): message is ChatMessage => (
        typeof message?.id === 'number' &&
        (message.sender === 'user' || message.sender === 'bot') &&
        typeof message.text === 'string'
      ))

      hasRestoredHistory = savedMessages.length > 0

      return {
        messages: [...initialMessages, ...savedMessages],
        hasRestoredHistory,
      }
    } catch {
      return {
        messages: initialMessages,
        hasRestoredHistory,
      }
    }
  })()
  const [messages, setMessages] = useState<ChatMessage[]>(
    Array.isArray(initialChatState) ? initialChatState : initialChatState.messages,
  )
  const [showBottomPrompt, setShowBottomPrompt] = useState(
    Array.isArray(initialChatState) ? false : initialChatState.hasRestoredHistory,
  )
  const [message, setMessage] = useState('')
  const [localFeedbackSelections, setLocalFeedbackSelections] = useState<Record<number, FeedbackType>>({})
  const bottomRef = useRef<HTMLDivElement>(null)
  const resolvedFeedbackSelections = feedbackSelections ?? localFeedbackSelections

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [messages])

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return

    const historyMessages = messages.slice(initialMessageCount)
    window.localStorage.setItem(storageKey, JSON.stringify(historyMessages))
  }, [initialMessageCount, messages, storageKey])

  const appendMessages = (nextMessages: ChatMessage[]) => {
    setShowBottomPrompt(false)
    setMessages((currentMessages) => [...currentMessages, ...nextMessages])
  }

  const buildChipRows = (chips: string[]) => {
    if (chips.length <= 4) return [chips]

    const rows: string[][] = []
    for (let index = 0; index < chips.length; index += 4) {
      rows.push(chips.slice(index, index + 4))
    }

    return rows
  }

  const buildUserMessage = (text: string): ChatMessage => ({
    id: Date.now() + Math.floor(Math.random() * 1000),
    sender: 'user',
    text,
  })

  const handleSubmit = async () => {
    const trimmedMessage = message.trim()

    if (!trimmedMessage) return

    const recentMessages = messages
      .filter(
        (item) =>
          item.sender === 'user' ||
          item.sender === 'bot'
      )
      .slice(-6)

    const followUp =
      await onMessageSubmit?.(
        trimmedMessage,
        recentMessages
      )
    const chatbotAnswer = followUp ? null : createLocalChatbotAnswer(trimmedMessage)
    const nextMessageId = Date.now()

    appendMessages([
      {
        id: nextMessageId,
        sender: 'user',
        text: trimmedMessage,
      },
      ...(chatbotAnswer
        ? [
            {
              id: nextMessageId + 1,
              sender: 'bot' as const,
              text: chatbotAnswer,
            },
          ]
        : []),
      ...(followUp
        ? (Array.isArray(followUp) ? followUp : [followUp])
        : []),
    ])

    setMessage('')
  }

  const handleChipClick = (chip: string) => {
    const followUp = onChipSelect?.(chip)
    const nextMessages: ChatMessage[] = [buildUserMessage(chip)]

    if (followUp) {
      nextMessages.push(...(Array.isArray(followUp) ? followUp : [followUp]))
    }

    appendMessages(nextMessages)
  }

  const handleActionClick = (action: ChatAction, sourceMessage: ChatMessage) => {
    const followUp = onActionSelect?.(action, sourceMessage)
    const nextMessages: ChatMessage[] = [buildUserMessage(action.label)]

    if (followUp) {
      nextMessages.push(...(Array.isArray(followUp) ? followUp : [followUp]))
    }

    appendMessages(nextMessages)
  }

  const handleFeedbackClick = (chatMessage: ChatMessage, type: FeedbackType) => {
    setLocalFeedbackSelections((currentSelections) => ({
      ...currentSelections,
      [chatMessage.id]: type,
    }))
    onFeedbackSelect?.(chatMessage, type)
  }

  return (
    <section className="chat_room" aria-label={ariaLabel}>
      <div className="chat_room_messages">
        {messages.map((chatMessage) => (
          <div
            className={`chat_message chat_message_${chatMessage.sender}`}
            key={chatMessage.id}
          >
            {chatMessage.sender === 'bot' ? (
              <div className="chat_message_avatar" aria-hidden="true">
                {botAvatarSrc ? (
                  <img src={botAvatarSrc} alt={`${botName} 프로필 이미지`} />
                ) : (
                  <span>AI</span>
                )}
              </div>
            ) : null}

            <div className="chat_message_content">
              {chatMessage.sender === 'bot' ? (
                <span className="chat_message_name">{botName}</span>
              ) : null}

              <div className="chat_message_bubble">
                <p className="p_regular">{chatMessage.text}</p>

                {chatMessage.sender === 'bot' && chatMessage.chips?.length ? (
                  <div className="chat_message_chips">
                    {buildChipRows(chatMessage.chips).map((chipRow, rowIndex) => (
                      <div className="chat_message_chip_row" key={`row-${rowIndex}`}>
                        {chipRow.map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            className="white_radius_btn chat_message_chip"
                            onClick={() => handleChipClick(chip)}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : null}

                {chatMessage.sender === 'bot' && chatMessage.actions?.length ? (
                  <div
                    className={`chat_message_actions${
                      chatMessage.actions.every((action) => action.value === 'select-walk-time')
                        ? ' is_walk_time_grid'
                        : ''
                    }${
                      chatMessage.actions.every((action) => (
                        action.value === 'dismiss' || action.value === 'register'
                      ))
                        ? ' is_confirm_row'
                        : ''
                    }`}
                  >
                    {chatMessage.actions.map((action) => {
                      const isConfirmAction =
                        action.value === 'dismiss' || action.value === 'register'

                      const actionClassName = isConfirmAction
                        ? action.variant === 'primary'
                          ? 'chat_message_action is_primary'
                          : 'chat_message_action'
                        : 'white_radius_btn chat_message_chip chat_message_action_chip'

                      return (
                        <button
                          key={`${action.label}-${action.value ?? ''}`}
                          type="button"
                          className={actionClassName}
                          onClick={() => handleActionClick(action, chatMessage)}
                        >
                          {action.label}
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>

              {chatMessage.sender === 'bot' && chatMessage.showFeedback ? (
                <div className="chat_message_feedback">
                  <span>{helpText}</span>
                  <div className="chat_message_feedback_buttons" aria-hidden="true">
                    <button
                      type="button"
                      className={`chat_message_feedback_button${
                        resolvedFeedbackSelections[chatMessage.id] === 'like' ? ' is_active_like' : ''
                      }`}
                      onClick={() => handleFeedbackClick(chatMessage, 'like')}
                    >
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M14 10V5.8a2.8 2.8 0 0 0-2.8-2.8L8 10v10h9.05a2 2 0 0 0 1.95-1.58l1.2-5.2A2.5 2.5 0 0 0 17.76 10H14Z" />
                        <path d="M8 10H5.5A1.5 1.5 0 0 0 4 11.5v7A1.5 1.5 0 0 0 5.5 20H8" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={`chat_message_feedback_button${
                        resolvedFeedbackSelections[chatMessage.id] === 'dislike' ? ' is_active_dislike' : ''
                      }`}
                      onClick={() => handleFeedbackClick(chatMessage, 'dislike')}
                    >
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M10 14v4.2A2.8 2.8 0 0 0 12.8 21l3.2-7V4H6.95A2 2 0 0 0 5 5.58l-1.2 5.2A2.5 2.5 0 0 0 6.24 14H10Z" />
                        <path d="M16 14h2.5a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 18.5 4H16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {bottomPromptMessage && showBottomPrompt ? (
          <div className="chat_message chat_message_bot">
            <div className="chat_message_avatar" aria-hidden="true">
              {botAvatarSrc ? (
                <img src={botAvatarSrc} alt={`${botName} 프로필 이미지`} />
              ) : (
                <span>AI</span>
              )}
            </div>

            <div className="chat_message_content">
              <span className="chat_message_name">{botName}</span>

              <div className="chat_message_bubble">
                <p className="p_regular">{bottomPromptMessage.text}</p>

                {bottomPromptMessage.chips?.length ? (
                  <div className="chat_message_chips">
                    {buildChipRows(bottomPromptMessage.chips).map((chipRow, rowIndex) => (
                      <div className="chat_message_chip_row" key={`prompt-row-${rowIndex}`}>
                        {chipRow.map((chip) => (
                          <button
                            key={`prompt-${chip}`}
                            type="button"
                            className="white_radius_btn chat_message_chip"
                            onClick={() => handleChipClick(chip)}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <form
        className="chat_room_form"
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
        }}
      >
        {showToolButton ? (
          <button type="button" className="chat_room_tool_button" aria-label="추가 기능">
            <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="11.25" stroke="currentColor" strokeWidth="1.5" />
              <path d="M14 9V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M9 14H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}

        <div className="chat_room_input_shell">
          <input
            className="chat_room_input"
            aria-label={inputAriaLabel}
            placeholder={placeholder}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button type="submit" className="chat_room_submit_button" aria-label={submitLabel}>
            <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M14 19V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path
                d="m9.5 13.5 4.5-4.5 4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <button type="button" className="chat_room_voice_button" aria-label="음성 입력">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 14v-4" />
            <path d="M8 17V7" />
            <path d="M12 20V4" />
            <path d="M16 17V7" />
            <path d="M20 14v-4" />
          </svg>
        </button>
      </form>
    </section>
  )
}

export default ChatRoom
