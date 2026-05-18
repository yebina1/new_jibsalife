import type { ReactNode } from 'react'
import './Title.css'

type TitleProps = {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  title?: ReactNode
  beforeTitle?: ReactNode
  children?: ReactNode
  className?: string
  headingClassName?: string
  author?: ReactNode
  time?: ReactNode
  metaClassName?: string
}

function Title({ as: Heading = 'h1', title, beforeTitle, children, className, headingClassName, author, time, metaClassName }: TitleProps) {
  return (
    <div className={className ? `title ${className}` : 'title'}>
      {beforeTitle}
      {title !== undefined && <Heading className={headingClassName}>{title}</Heading>}
      {children}
      {(author != null || time != null) && (
        <div className={metaClassName}>
          {author}
          {time}
        </div>
      )}
    </div>
  )
}

export default Title
