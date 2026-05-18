import { useEffect, useState, type ButtonHTMLAttributes } from 'react'
import { useNavigate } from 'react-router'
import Button from './html/Button'
import FloatingButton from './FloatingButton'

type FloatingWriteButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> & {
  showMenu?: boolean
  returnTo?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

function FloatingWriteButton({
  'aria-label': ariaLabel = '글쓰기',
  className,
  showMenu = false,
  returnTo,
  onClick,
  ...props
}: FloatingWriteButtonProps) {
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const scrollContainer = document.querySelector('.layout_content') as HTMLElement | null
    const isScrollableContainer = () => {
      if (!scrollContainer) return false
      const overflowY = window.getComputedStyle(scrollContainer).overflowY
      return scrollContainer.scrollHeight > scrollContainer.clientHeight && (overflowY === 'auto' || overflowY === 'scroll')
    }
    const getScrollY = () => isScrollableContainer() ? scrollContainer!.scrollTop : window.scrollY
    let lastScrollY = getScrollY()
    const collapseTimer = window.setTimeout(() => {
      setIsExpanded(false)
    }, 3000)

    const handleScroll = () => {
      const currentScrollY = getScrollY()
      if (currentScrollY > lastScrollY) {
        setIsExpanded(false)
        setIsVisible(false)
        if (showMenu) setIsMenuOpen(false)
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true)
      }
      lastScrollY = currentScrollY
    }

    scrollContainer?.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.clearTimeout(collapseTimer)
      scrollContainer?.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [showMenu])

  const resolvedClassName = ['floating_write_button', isExpanded ? 'is_expanded' : null, className]
    .filter(Boolean)
    .join(' ')

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (showMenu) {
      setIsMenuOpen((prev) => !prev)
    } else {
      onClick?.(e)
    }
  }

  return (
    <>
      {showMenu && isMenuOpen && (
        <div className="floating_write_backdrop" onClick={() => setIsMenuOpen(false)} />
      )}
      <div className={`floating_write_container${isVisible ? '' : ' is_hidden'}`}>
        {showMenu && (
          <div className={`floating_write_menu${isMenuOpen ? ' is_open' : ''}`}>
            <Button
              type="button"
              className="light_purple_radius_btn"
              onClick={() => { setIsMenuOpen(false); navigate('/community/vote/write') }}
            >
              투표 올리기
            </Button>
            <Button
              type="button"
              className="light_purple_radius_btn"
              onClick={() => {
                setIsMenuOpen(false)
                navigate('/community/petstory/write', {
                  state: returnTo ? { returnTo } : undefined,
                })
              }}
            >
              일상 공유하기
            </Button>
          </div>
        )}
        <FloatingButton
          placement="community"
          aria-label={ariaLabel}
          className={resolvedClassName}
          onClick={handleClick}
          {...props}
        >
          <span className="floating_button_icon_frame" aria-hidden="true">
            <i className="bx bx-edit-alt" />
          </span>
          <span className="floating_write_button_label">글쓰기</span>
        </FloatingButton>
      </div>
    </>
  )
}

export default FloatingWriteButton
