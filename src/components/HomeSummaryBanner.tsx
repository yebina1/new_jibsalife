import { Fragment, useRef } from 'react'
import './HomeSummaryBanner.css'

type HomeSummaryBannerProps = {
  text: string
  imageSrc: string
  imagePriority?: boolean
  backgroundColor?: string
  ariaLabel?: string
  rotateImage?: boolean
  imageWidth?: number
  imageHeight?: number
  imageTop?: number
  imageBottom?: number
  imageRight?: number
  onClick?: () => void
}

function HomeSummaryBanner({
  text,
  imageSrc,
  imagePriority = false,
  backgroundColor = '#43779E',
  ariaLabel = '배너',
  rotateImage = true,
  imageWidth = 76,
  imageHeight = 90,
  imageTop = -24,
  imageBottom,
  imageRight = 48,
  onClick,
}: HomeSummaryBannerProps) {
  const lines = text.split('\n')
  const lastActivationTimeRef = useRef(0)

  const activate = () => {
    if (!onClick) return

    const now = Date.now()
    if (now - lastActivationTimeRef.current < 350) return
    lastActivationTimeRef.current = now
    onClick()
  }

  const content = (
    <>
      <p className="p_medium home_summary_banner_text">
        {lines.map((line, index) => (
          <Fragment key={`${line}-${index}`}>
            {line}
            {index < lines.length - 1 ? <br className="home_summary_banner_break" /> : null}
          </Fragment>
        ))}
      </p>
      <img
        className={`home_summary_banner_image ${rotateImage ? 'is_rotated' : ''}`}
        src={imageSrc}
        alt={`${ariaLabel} 이미지`}
        aria-hidden="true"
        loading={imagePriority ? 'eager' : 'lazy'}
        fetchPriority={imagePriority ? 'high' : 'auto'}
        decoding="async"
        style={{
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          top: imageBottom === undefined ? `${imageTop}px` : undefined,
          bottom: imageBottom === undefined ? undefined : `${imageBottom}px`,
          right: `${imageRight}px`,
        }}
      />
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        className="home_summary_banner"
        aria-label={ariaLabel}
        style={{ backgroundColor }}
        onPointerUp={activate}
        onClick={activate}
      >
        {content}
      </button>
    )
  }

  return (
    <div
      className="home_summary_banner"
      aria-label={ariaLabel}
      style={{ backgroundColor }}
    >
      {content}
    </div>
  )
}

export default HomeSummaryBanner
