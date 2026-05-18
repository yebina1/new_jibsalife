import { useState } from 'react'
import Button from './html/Button'
import ChevronIcon from './ChevronIcon'
import ConfirmDialog from './ConfirmDialog'
import { showStateBarMessage } from '../utils/stateBarMessage'
import whatIcon from '../svg/what.svg'
import './MissionRecordSheet.css'

type MissionSheetDate = {
  month: number
  day: number
}

type MissionSheetCategory = {
  id: string
  label: string
  color: string
}

type Props = {
  addDate: MissionSheetDate
  selectedCategory: MissionSheetCategory
  repeatLabel: string
  periodLabel?: string
  addTitle: string
  feedAmount: number
  canSave: boolean
  isEditing: boolean
  quickMessageOptions: string[]
  selectedQuickMessage: string
  isPeriodPickerOpen?: boolean
  periodPickerContent?: React.ReactNode
  onOpenPeriodPicker: () => void
  onOpenRepeatPicker: () => void
  onOpenCategoryPicker: () => void
  onQuickMessageSelect: (message: string) => void
  onTitleChange: (title: string) => void
  onFeedAmountChange: (amount: number) => void
  onDelete: () => void
  onSave: () => void
  onSecondaryAction?: () => void
  saveLabel?: string
  secondaryActionLabel?: string
}

function MissionRecordSheet({
  addDate,
  selectedCategory,
  repeatLabel,
  periodLabel,
  addTitle,
  feedAmount,
  canSave,
  isEditing,
  quickMessageOptions,
  selectedQuickMessage,
  isPeriodPickerOpen = false,
  periodPickerContent,
  onOpenPeriodPicker,
  onOpenRepeatPicker,
  onOpenCategoryPicker,
  onQuickMessageSelect,
  onTitleChange,
  onFeedAmountChange,
  onDelete,
  onSave,
  onSecondaryAction,
  saveLabel,
  secondaryActionLabel,
}: Props) {
  const [confirmAction, setConfirmAction] = useState<'edit' | 'delete' | null>(null)
  const handleRepeatInfoClick = () => {
    showStateBarMessage('설정한 주기에 맞춰 기록이 자동 등록돼요.\n(ex. 매일, 매주)', 3000, {
      placement: 'sheet',
    })
  }
  const isAmountInputCategory =
    selectedCategory.id === 'meal' || selectedCategory.id === 'walk'
  const amountInputLabel = selectedCategory.id === 'walk' ? '산책 시간' : '사료량'
  const amountUnit = selectedCategory.id === 'walk' ? '분' : 'g'
  const addContentLabel = selectedCategory.id === 'poop'
    ? '배변·배뇨 기록'
    : selectedCategory.id === 'activity'
      ? '활동기록'
      : selectedCategory.label

  const shouldShowSecondaryAction = isEditing || Boolean(secondaryActionLabel && onSecondaryAction)

  const handleConfirm = () => {
    if (confirmAction === 'delete') {
      onDelete()
    }

    if (confirmAction === 'edit') {
      onSave()
    }

    setConfirmAction(null)
  }

  return (
    <>
      <div className="mission_add_rows">
        {isPeriodPickerOpen && periodPickerContent ? (
          periodPickerContent
        ) : (
          <div className="mission_add_row">
            <span className="mission_add_row_label">기간</span>
            <button
              type="button"
              className="mission_add_row_value"
              onClick={onOpenPeriodPicker}
            >
              {periodLabel ?? `${addDate.month}월 ${addDate.day}일`}
              <ChevronIcon direction="right" size="md" />
            </button>
          </div>
        )}
        <div className="mission_add_row">
          <span className="mission_add_row_label">
            반복설정
            <button
              type="button"
              className="mission_add_info_button"
              aria-label="반복 설정 안내"
              onClick={handleRepeatInfoClick}
            >
              <img className="mission_add_info_icon" src={whatIcon} alt="" aria-hidden="true" />
            </button>
          </span>
          <button
            type="button"
            className="mission_add_row_value"
            onClick={onOpenRepeatPicker}
          >
            {repeatLabel}
            <ChevronIcon direction="right" size="md" />
          </button>
        </div>
        <div className="mission_add_row">
          <span className="mission_add_row_label">카테고리</span>
          <button
            type="button"
            className="mission_add_row_value mission_add_category_value"
            onClick={onOpenCategoryPicker}
          >
            <span className="mission_add_category_text">
              <span
                className="mission_add_category_dot"
                style={{ backgroundColor: selectedCategory.color }}
                aria-hidden="true"
              />
              <span className="mission_add_category_label">{selectedCategory.label}</span>
            </span>
            <ChevronIcon direction="right" size="md" />
          </button>
        </div>
      </div>
      <section className={`mission_add_content${isAmountInputCategory ? ' has_amount' : ''}`}>
        {isAmountInputCategory ? (
          <div className="mission_amount_frame">
            <h2>{amountInputLabel}</h2>
            <div className="mission_amount_control" aria-label={amountInputLabel}>
              <button
                type="button"
                aria-label={`${amountInputLabel} ${selectedCategory.id === 'walk' ? '5분' : '5g'} 줄이기`}
                onClick={() => onFeedAmountChange(Math.max(0, feedAmount - 5))}
              >
                -
              </button>
              <span className={`mission_amount_value${feedAmount === 0 ? ' is_zero' : ''}`}>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="5"
                  value={feedAmount}
                  onChange={(event) => {
                    const nextAmount = Number(event.target.value)
                    onFeedAmountChange(Number.isFinite(nextAmount) ? Math.max(0, nextAmount) : 0)
                  }}
                  aria-label={amountInputLabel}
                />
                <span>{amountUnit}</span>
              </span>
              <button
                type="button"
                aria-label={`${amountInputLabel} ${selectedCategory.id === 'walk' ? '5분' : '5g'} 늘리기`}
                onClick={() => onFeedAmountChange(feedAmount + 5)}
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2>{addContentLabel}</h2>
            <div className="mission_quick_messages" aria-label="빠른 입력">
              {quickMessageOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`mission_quick_message${selectedQuickMessage === option ? ' active' : ''}`}
                  onClick={() => onQuickMessageSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}
        <textarea
          className="mission_add_title"
          placeholder="추가로 기록할 내용을 입력해 주세요."
          rows={4}
          value={addTitle}
          onChange={(event) => onTitleChange(event.target.value)}
        />
      </section>

      <div className={`mission_add_save_wrap${shouldShowSecondaryAction ? ' is_split' : ''}`}>
        {shouldShowSecondaryAction && (
          <button
            type="button"
            className="mission_add_delete_btn"
            disabled={!isEditing && !canSave}
            onClick={isEditing ? () => setConfirmAction('delete') : onSecondaryAction}
          >
            {isEditing ? '삭제하기' : secondaryActionLabel}
          </button>
        )}
        <Button
          type="button"
          className="purple_btn"
          disabled={!canSave}
          onClick={isEditing ? () => setConfirmAction('edit') : onSave}
        >
          {saveLabel ?? (isEditing ? '수정하기' : '저장하기')}
        </Button>
      </div>
      {confirmAction && (
        <ConfirmDialog
          message={confirmAction === 'delete' ? '삭제하시겠습니까?' : '수정하시겠습니까?'}
          onCancel={() => setConfirmAction(null)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
}

export default MissionRecordSheet
