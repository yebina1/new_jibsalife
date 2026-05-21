import { type CSSProperties, useEffect, useRef, useState } from 'react'
import './LazyImage.css'

type LazyImageProps = {
  src: string
  webpSrc?: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  decoding?: 'async' | 'sync' | 'auto'
  showSkeleton?: boolean
  className?: string
  rootClassName?: string
  style?: CSSProperties
  rootStyle?: CSSProperties
  objectFit?: CSSProperties['objectFit']
  objectPosition?: string
}

export default function LazyImage({
  src,
  webpSrc,
  alt,
  width,
  height,
  priority = false,
  loading,
  fetchPriority,
  decoding = 'async',
  showSkeleton,
  className,
  rootClassName,
  style,
  rootStyle,
  objectFit,
  objectPosition,
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // 이미 캐시된 이미지는 onLoad가 발생하지 않으므로 complete 상태 확인
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true)
    }
  }, [])

  const resolvedImgStyle: CSSProperties = {
    ...(objectFit !== undefined ? { objectFit } : {}),
    ...(objectPosition !== undefined ? { objectPosition } : {}),
    ...style,
  }
  const hasImgStyle = Object.keys(resolvedImgStyle).length > 0
  const resolvedLoading = loading ?? (priority ? 'eager' : 'lazy')
  const resolvedFetchPriority = fetchPriority ?? (priority ? 'high' : 'auto')
  const shouldShowSkeleton = showSkeleton ?? !priority

  const imgProps = {
    ref: imgRef,
    src,
    alt,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    loading: resolvedLoading,
    decoding,
    fetchPriority: resolvedFetchPriority,
    className: ['lazy_img', className].filter(Boolean).join(' '),
    style: hasImgStyle ? resolvedImgStyle : undefined,
    onLoad: () => setLoaded(true),
  }

  return (
    <div
      className={['lazy_img_root', loaded ? 'is_loaded' : '', priority ? 'is_priority' : '', rootClassName].filter(Boolean).join(' ')}
      style={rootStyle}
    >
      {shouldShowSkeleton && !loaded ? <span className="lazy_img_skeleton" aria-hidden="true" /> : null}
      {webpSrc ? (
        <picture className="lazy_img_picture">
          <source srcSet={webpSrc} type="image/webp" />
          <img {...imgProps} />
        </picture>
      ) : (
        <img {...imgProps} />
      )}
    </div>
  )
}
