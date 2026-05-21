import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './ChatRoom.css'
import { createLocalChatbotAnswer } from '../utils/localChatbotAnswers'
import { useActionRowSlot } from '../contexts/ActionRowContext'

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
  onMessageSubmit?: (message: string, recentMessages: ChatMessage[]) => ChatRoomResponse
  onActionSelect?: (
    action: ChatAction,
    sourceMessage: ChatMessage,
  ) => void | ChatMessage | ChatMessage[]
  onFeedbackSelect?: (message: ChatMessage, type: FeedbackType) => void
}

const messageTransition = {
  layout: {
    duration: 0.32,
    ease: [0.22, 1, 0.36, 1] as const,
  },
  opacity: {
    duration: 0.18,
  },
  y: {
    duration: 0.34,
    ease: [0.22, 1, 0.36, 1] as const,
  },
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

      const savedMessages = parsedValue.filter((savedMessage): savedMessage is ChatMessage => (
        typeof savedMessage?.id === 'number' &&
        (savedMessage.sender === 'user' || savedMessage.sender === 'bot') &&
        typeof savedMessage.text === 'string'
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
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false)
  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false)
  const [localFeedbackSelections, setLocalFeedbackSelections] = useState<Record<number, FeedbackType>>({})
  const messagesRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const footerSlot = useActionRowSlot()
  const resolvedFeedbackSelections = feedbackSelections ?? localFeedbackSelections
  const isComposingMessage = message.trim().length > 0

  useLayoutEffect(() => {
    const layoutEl = document.querySelector<HTMLElement>('.layout')
    if (!layoutEl) return
    layoutEl.style.setProperty('--layout-footer-height', '102px')
    return () => { layoutEl.style.removeProperty('--layout-footer-height') }
  }, [])

  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, isAwaitingResponse, isComposingMessage, showBottomPrompt])

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
    if (!trimmedMessage || isAwaitingResponse) return

    const userMessage = buildUserMessage(trimmedMessage)
    const recentMessages = [...messages, userMessage]
      .filter((item) => item.sender === 'user' || item.sender === 'bot')
      .slice(-6)

    appendMessages([userMessage])
    setMessage('')
    setIsToolMenuOpen(false)
    window.requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
    setIsAwaitingResponse(true)

    try {
      const followUp = await onMessageSubmit?.(trimmedMessage, recentMessages)
      const chatbotAnswer = followUp ? null : createLocalChatbotAnswer(trimmedMessage)
      const nextMessageId = Date.now()

      if (chatbotAnswer || followUp) {
        appendMessages([
          ...(chatbotAnswer
            ? [
                {
                  id: nextMessageId + 1,
                  sender: 'bot' as const,
                  text: chatbotAnswer,
                },
              ]
            : []),
          ...(followUp ? (Array.isArray(followUp) ? followUp : [followUp]) : []),
        ])
      }
    } finally {
      setIsAwaitingResponse(false)
    }
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

  const handleToolMenuToggle = () => {
    if (!showToolButton) return
    setIsToolMenuOpen((currentValue) => !currentValue)
  }

  const renderMessageBody = (chatMessage: ChatMessage) => (
    <>
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
    </>
  )

  const dock = (
    <div className="chat_room_dock">
      <form
        className={`chat_room_form${isAwaitingResponse ? ' is_waiting' : ''}`}
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
        }}
      >
        {showToolButton ? (
          <button
            type="button"
            className={`chat_room_tool_button${isToolMenuOpen ? ' is_active' : ''}`}
            aria-label="추가 기능"
            aria-expanded={isToolMenuOpen}
            onClick={handleToolMenuToggle}
          >
            <i className="material-icons" aria-hidden="true">add</i>
          </button>
        ) : null}

        {showToolButton ? (
          <div className={`chat_room_tool_menu${isToolMenuOpen ? ' is_open' : ''}`} aria-hidden={!isToolMenuOpen}>
            <button type="button" className="chat_room_tool_menu_button" aria-label="카메라">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M8 7.5 9.2 6h5.6L16 7.5H18A2 2 0 0 1 20 9.5v7A2 2 0 0 1 18 18.5H6A2 2 0 0 1 4 16.5v-7A2 2 0 0 1 6 7.5h2Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
            <button type="button" className="chat_room_tool_menu_button" aria-label="사진">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="m7.5 15 3-3 2.5 2.5 2-2 1.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              className="chat_room_tool_menu_button chat_room_tool_menu_button_text"
              aria-label="GIF"
            >
              GIF
            </button>
            <button type="button" className="chat_room_tool_menu_button" aria-label="더보기">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="6.5" cy="12" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <circle cx="17.5" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </div>
        ) : null}

        <div className="chat_room_input_shell">
          <input
            ref={inputRef}
            className="chat_room_input"
            aria-label={inputAriaLabel}
            placeholder={placeholder}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onFocus={() => setIsToolMenuOpen(false)}
          />
          <button
            type="submit"
            className="chat_room_submit_button"
            aria-label={submitLabel}
            disabled={!isComposingMessage || isAwaitingResponse}
          >
            <i className="material-icons" aria-hidden="true">north</i>
          </button>
        </div>
      </form>
    </div>
  )

  return (
    <>
      <section className="chat_room" aria-label={ariaLabel}>
        <div className="chat_room_messages" ref={messagesRef}>
          <AnimatePresence initial={false}>
            {messages.map((chatMessage) => (
              <motion.div
                key={chatMessage.id}
                className={`chat_message chat_message_${chatMessage.sender}`}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={messageTransition}
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
                  {renderMessageBody(chatMessage)}
                </div>
              </motion.div>
            ))}

            {isAwaitingResponse ? (
              <motion.div
                key="chat-bot-typing"
                layout
                className="chat_message chat_message_bot"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={messageTransition}
              >
                <div className="chat_message_avatar chat_message_avatar_typing" aria-hidden="true">
                  {botAvatarSrc ? (
                    <img src={botAvatarSrc} alt={`${botName} 프로필 이미지`} />
                  ) : (
                    <span>AI</span>
                  )}
                </div>

                <div className="chat_message_content chat_message_content_typing">
                  <span className="chat_message_name">{botName}</span>
                  <div
                    className="chat_message_bubble chat_message_bubble_typing"
                    aria-live="polite"
                    aria-label="AI 답변 입력 중"
                  >
                    <div className="chat_typing_indicator" aria-hidden="true">
                      <span className="chat_typing_dot" />
                      <span className="chat_typing_dot" />
                      <span className="chat_typing_dot" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {bottomPromptMessage && showBottomPrompt ? (
              <motion.div
                key="chat-bottom-prompt"
                layout
                className="chat_message chat_message_bot"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={messageTransition}
              >
                <div className="chat_message_avatar" aria-hidden="true">
                  {botAvatarSrc ? (
                    <img src={botAvatarSrc} alt={`${botName} 프로필 이미지`} />
                  ) : (
                    <span>AI</span>
                  )}
                </div>

                <div className="chat_message_content">
                  <span className="chat_message_name">{botName}</span>
                  {renderMessageBody(bottomPromptMessage)}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {isComposingMessage && !isAwaitingResponse ? (
            <motion.div
              key="chat-user-preview"
              className="chat_message chat_message_user chat_message_user_preview"
              aria-hidden="true"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={messageTransition}
            >
              <div className="chat_message_content">
                <div className="chat_message_bubble chat_message_bubble_user_typing">
                  <div className="chat_typing_indicator chat_typing_indicator_user" aria-hidden="true">
                    <span className="chat_typing_dot" />
                    <span className="chat_typing_dot" />
                    <span className="chat_typing_dot" />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>
      </section>
      {footerSlot ? createPortal(dock, footerSlot) : dock}
    </>
  )
}

export default ChatRoom
