import { type CSSProperties, useEffect, useRef, useState } from 'react'
import './LazyImage.css'

const resolvedImageCache = new Set<string>()

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

function getImageCacheKey(src: string, webpSrc?: string) {
  return webpSrc?.trim() || src.trim()
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
  const cacheKey = getImageCacheKey(src, webpSrc)
  const [loaded, setLoaded] = useState(() => resolvedImageCache.has(cacheKey))
  const imgRef = useRef<HTMLImageElement>(null)

  // 이미 캐시된 이미지는 onLoad가 발생하지 않으므로 complete 상태 확인
  useEffect(() => {
    if (resolvedImageCache.has(cacheKey)) {
      setLoaded(true)
      return
    }

    setLoaded(false)

    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      resolvedImageCache.add(cacheKey)
      setLoaded(true)
    }
  }, [cacheKey])

  const resolvedImgStyle: CSSProperties = {
    ...(objectFit !== undefined ? { objectFit } : {}),
    ...(objectPosition !== undefined ? { objectPosition } : {}),
    ...style,
  }
  const hasImgStyle = Object.keys(resolvedImgStyle).length > 0
  const resolvedLoading = loading ?? (priority ? 'eager' : 'lazy')
  const resolvedFetchPriority = fetchPriority ?? (priority ? 'high' : 'auto')
  const shouldShowSkeleton = showSkeleton ?? false

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
    onLoad: () => {
      resolvedImageCache.add(cacheKey)
      setLoaded(true)
    },
    onError: () => setLoaded(true),
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
