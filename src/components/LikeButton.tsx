import { useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react'
import './LikeButton.css'
import heartOutlineIcon from '../svg/heart.svg'
import heartFilledIcon from '../svg/heart-filled.svg'
import heart1 from '../svg/heart/heart-1.svg'
import heart2 from '../svg/heart/heart-2.svg'
import heart3 from '../svg/heart/heart-3.svg'
import heart4 from '../svg/heart/heart-4.svg'
import heart5 from '../svg/heart/heart-5.svg'
import heart6 from '../svg/heart/heart-6.svg'

type FloatingHeart = {
  id: number
  x: number
  size: number
  delay: number
  src: string
}

type LikeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  liked: boolean
  children?: ReactNode
  iconClassName?: string
  countClassName?: string
}

const floatingHeartImages = [heart1, heart2, heart3, heart4, heart5, heart6]

function LikeButton({
  liked,
  children,
  className,
  iconClassName = 'like_button_icon',
  countClassName,
  onClick,
  ...props
}: LikeButtonProps) {
  const [hearts, setHearts] = useState<FloatingHeart[]>([])

  const handleLikeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (liked) {
      onClick?.(event)
      return
    }

    const newHearts = Array.from({ length: 6 }, (_, index) => ({
      id: Date.now() + index,
      x: Math.random() * 52 - 26,
      size: Math.random() * 18 + 54,
      delay: index * 0.06,
      src: floatingHeartImages[index % floatingHeartImages.length],
    }))

    setHearts((prev) => [...prev, ...newHearts])
    onClick?.(event)

    window.setTimeout(() => {
      setHearts((prev) =>
        prev.filter((heart) => !newHearts.some((newHeart) => newHeart.id === heart.id)),
      )
    }, 1650)
  }

  const resolvedClassName = ['like_button', liked ? 'is_liked active' : null, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      className={resolvedClassName}
      aria-pressed={props['aria-pressed'] ?? liked}
      onClick={handleLikeClick}
    >
      <span className="heart_effect_area" aria-hidden="true">
        {hearts.map((heart) => (
          <img
            key={heart.id}
            src={heart.src}
            alt=""
            className="floating_heart"
            style={{
              '--x': `${heart.x}px`,
              '--size': `${heart.size}px`,
              '--delay': `${heart.delay}s`,
            } as CSSProperties}
          />
        ))}
      </span>
      <span className={iconClassName} aria-hidden="true">
        <img src={liked ? heartFilledIcon : heartOutlineIcon} alt="" className="like_icon" />
      </span>
      {children !== undefined ? <span className={countClassName}>{children}</span> : null}
    </button>
  )
}

export default LikeButton
