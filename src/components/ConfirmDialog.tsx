import './ConfirmDialog.css'
import Alert from './Alert'
import Button from './html/Button'
import Title from './Title'

type ConfirmDialogProps = {
  message: string
  description?: React.ReactNode
  onCancel: () => void
  onConfirm: () => void
  cancelLabel?: string
  confirmLabel?: string
  hideCancel?: boolean
  accentColor?: string
  cancelButtonStyle?: React.CSSProperties
  dialogClassName?: string
}

function ConfirmDialog({
  message,
  description,
  onCancel,
  onConfirm,
  cancelLabel = '취소',
  confirmLabel = '삭제하기',
  hideCancel = false,
  accentColor,
  cancelButtonStyle,
  dialogClassName,
}: ConfirmDialogProps) {
  return (
    <Alert onClose={onCancel} dialogClassName={dialogClassName}>
      <div className="confirm_dialog_copy">
        <Title as="h4" title={message} headingClassName="confirm_dialog_msg" />
        {description ? <p className="confirm_dialog_desc h5_regular">{description}</p> : null}
      </div>
      <div className="confirm_dialog_btns">
        {!hideCancel ? (
          <Button type="button" className="white_btn" style={cancelButtonStyle} onClick={onCancel}>
            {cancelLabel}
          </Button>
        ) : null}
        <Button
          type="button"
          className="purple_btn"
          style={accentColor ? { backgroundColor: accentColor, borderColor: accentColor } : undefined}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Alert>
  )
}

export default ConfirmDialog
