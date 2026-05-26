import { useEffect, useState } from 'react'
import defaultPetThumbnail from '../img/petstory/daily/daily_thumbnail.jpg'

type ProfileImageProps = {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
}

function ProfileImage({ src, alt, className, fallbackSrc = defaultPetThumbnail }: ProfileImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const classNames = className ? `profile_image ${className}` : 'profile_image'

  useEffect(() => {
    setCurrentSrc(src)
  }, [src])

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
