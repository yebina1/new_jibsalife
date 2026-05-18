import './AddSheet.css'
import HomeIndicator from './HomeIndicator'
import { useState } from 'react'

type Props = {
  onClose: () => void
  isClosing?: boolean
  children?: React.ReactNode
  onScrollCapture?: React.UIEventHandler<HTMLDivElement>
  onWheelCapture?: React.WheelEventHandler<HTMLDivElement>
  onTouchMoveCapture?: React.TouchEventHandler<HTMLDivElement>
  onMouseDownCapture?: React.MouseEventHandler<HTMLDivElement>
}

function AddSheet({
  onClose,
  isClosing: isClosingFromParent = false,
  children,
  onScrollCapture,
  onWheelCapture,
  onTouchMoveCapture,
  onMouseDownCapture,
}: Props) {
  const [isClosing, setIsClosing] = useState(false)
  const shouldClose = isClosing || isClosingFromParent

  const requestClose = () => {
    setIsClosing(true)
  }

  return (
    <div
      className={`add_sheet_overlay${shouldClose ? ' is_closing' : ''}`}
      onClick={requestClose}
      onScrollCapture={onScrollCapture}
      onWheelCapture={onWheelCapture}
      onTouchMoveCapture={onTouchMoveCapture}
      onMouseDownCapture={onMouseDownCapture}
    >
      <div
        className="add_sheet"
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={(event) => {
          if (event.animationName === 'add-sheet-slide-down') {
            onClose()
          }
        }}
      >
        <button
          type="button"
          className="add_sheet_handle"
          aria-label="닫기"
          onClick={requestClose}
        />
        {children}
        <HomeIndicator />
      </div>
    </div>
  )
}

export default AddSheet
