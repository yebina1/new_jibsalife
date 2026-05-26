import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import './CommentInputForm.css'

const textareaMaxHeight = 102

type CommentInputFormProps = {
  className?: string
  iconButtonClassName?: string
  inputWrapClassName?: string
  placeholder?: string
  addIcon: string
  emojiIcon: string
  replyTo?: string | null
  onClearReply?: () => void
  prefilledText?: string
  onSubmit?: (value: string) => void
  onAddPhoto?: () => void
}

function CommentInputForm({
  className = 'cpsdetail_comment_form',
  iconButtonClassName = 'cpsdetail_form_icon',
  inputWrapClassName = 'cpsdetail_comment_input',
  placeholder = '메시지를 입력해 주세요.',
  addIcon,
  emojiIcon,
  replyTo,
  onClearReply,
  prefilledText,
  onSubmit,
  onAddPhoto,
}: CommentInputFormProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, textareaMaxHeight)}px`
    textarea.style.overflowY = textarea.scrollHeight > textareaMaxHeight ? 'auto' : 'hidden'
  }, [])

  useEffect(() => {
    if (replyTo) {
      setValue('')
      textareaRef.current?.focus()
      requestAnimationFrame(resizeTextarea)
    }
  }, [replyTo, resizeTextarea])

  useEffect(() => {
    if (prefilledText !== undefined) {
      setValue(prefilledText)
      requestAnimationFrame(resizeTextarea)
      if (prefilledText) textareaRef.current?.focus()
    }
  }, [prefilledText, resizeTextarea])

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value)
    requestAnimationFrame(resizeTextarea)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedValue = value.trim()
    if (!trimmedValue) return

    const fullText = replyTo ? `@${replyTo} ${trimmedValue}` : trimmedValue
    onSubmit?.(fullText)
    setValue('')
    onClearReply?.()
    requestAnimationFrame(resizeTextarea)
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      <button type="button" aria-label="사진 추가" className={iconButtonClassName} onClick={onAddPhoto}>
        <img src={addIcon} alt="" />
      </button>

      <label className={inputWrapClassName}>
        <div className="comment_input_text_area">
          {replyTo && (
            <span className="comment_input_mention">
              @{replyTo}
              <button
                type="button"
                className="comment_input_mention_clear"
                aria-label="답글 취소"
                onClick={onClearReply}
              >
                <i className="bx bx-x" aria-hidden="true" />
              </button>
            </span>
          )}
          <textarea
            ref={textareaRef}
            aria-label="댓글"
            className="comment_input_form_textarea"
            placeholder={replyTo ? '' : placeholder}
            rows={1}
            value={value}
            onChange={handleChange}
          />
        </div>
        <button type="submit" aria-label="댓글 등록" className="comment_input_form_submit">
          <i className="bx bx-up-arrow-alt" aria-hidden="true" />
        </button>
      </label>

      <button type="button" aria-label="이모지" className="comment_input_form_emoji" disabled>
        <img src={emojiIcon} alt="" />
      </button>
    </form>
  )
}

export default CommentInputForm
