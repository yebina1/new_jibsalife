import type { ElementType, ReactNode } from 'react'
import './ContentSection.css'

type ContentSectionProps = {
  as?: 'section' | 'div' | 'article'
  title: ReactNode
  subtitle?: ReactNode
  titleAs?: ElementType
  beforeTitle?: ReactNode
  action?: ReactNode
  children?: ReactNode
  className?: string
  headerClassName?: string
}

function ContentSection({
  as: Section = 'section',
  title,
  subtitle,
  titleAs: Heading = 'h2',
  beforeTitle,
  action,
  children,
  className,
  headerClassName,
}: ContentSectionProps) {
  const sectionClassName = className ? `content_section ${className}` : 'content_section'
  const headerClassNames = headerClassName
    ? `content_section_header ${headerClassName}`
    : 'content_section_header'

  return (
    <Section className={sectionClassName}>
      <div className={headerClassNames}>
        <div className="content_section_copy">
          {beforeTitle}
          <Heading className="content_section_title">{title}</Heading>
          {subtitle ? <p className="content_section_subtitle caption_medium">{subtitle}</p> : null}
        </div>
        {action ? <div className="content_section_action">{action}</div> : null}
      </div>
      {children}
    </Section>
  )
}

export default ContentSection
