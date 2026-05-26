import { useEffect, useState } from 'react'
import defaultPetThumbnail from '../img/petstory/daily/daily_thumbnail.jpg'

type ProfileImageProps = {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
}

function resolveProfileImageSrc(src: string, fallbackSrc: string) {
  const trimmedSrc = src.trim()

  if (
    !trimmedSrc ||
    trimmedSrc === 'daily_thumbnail.jpg' ||
    trimmedSrc.endsWith('/daily_thumbnail.jpg')
  ) {
    return fallbackSrc
  }

  return trimmedSrc
}

function ProfileImage({ src, alt, className, fallbackSrc = defaultPetThumbnail }: ProfileImageProps) {
  const [currentSrc, setCurrentSrc] = useState(() => resolveProfileImageSrc(src, fallbackSrc))
  const classNames = className ? `profile_image ${className}` : 'profile_image'

  useEffect(() => {
    setCurrentSrc(resolveProfileImageSrc(src, fallbackSrc))
  }, [src, fallbackSrc])

  return (
    <span className={classNames}>
      <img
        src={currentSrc}
        alt={alt}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onError={() => {
          if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc)
          }
        }}
      />
    </span>
  )
}

export default ProfileImage
