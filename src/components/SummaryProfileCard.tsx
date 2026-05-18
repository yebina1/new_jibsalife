import { Fragment, type ReactNode } from 'react'
import ChevronIcon from './ChevronIcon'
import ProfileImage from './ProfileImage'
import './SummaryProfileCard.css'

type SummaryProfileStat = {
  label: string
  value: string
}

type SummaryProfileCardProps = {
  image: string
  name: string
  breed: string
  details: string
  stats: readonly SummaryProfileStat[]
  disabledStatLabels?: readonly string[]
  clickableStatLabels?: readonly string[]
  careGuideLabel?: ReactNode
  imageAlt?: string
  className?: string
  onEdit?: () => void
  onStatEdit?: (label: string) => void
  onStatClick?: (label: string) => void
  onCareGuideClick?: () => void
}

type SummaryProfileAddCardProps = {
  label?: string
  className?: string
  onClick?: () => void
}

function ProfileEditIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="5.5" r="3" />
      <path d="M4.2 16.5c1.1-2.7 3.3-4.1 5.8-4.1 1.1 0 2.1.3 3 .8" />
      <path d="m13.8 16.2 3.9-3.9 1.4 1.4-3.9 3.9-2 .5Z" />
    </svg>
  )
}

function splitStatValue(value: string) {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/)

  if (!match) {
    return { amount: value, unit: '' }
  }

  return {
    amount: match[1],
    unit: match[2].trim(),
  }
}

function ProfileDetails({ details }: { details: string }) {
  const detailItems = details.split(' · ').map((item) => {
    const [label, ...valueParts] = item.split(':')
    return {
      label: label.trim(),
      value: valueParts.join(':').trim(),
    }
  })

  return (
    <p className="summary_profile_card_details caption_medium">
      {detailItems.map((item, index) => (
        <span key={item.label} className="summary_profile_card_detail_item">
          {index > 0 ? <em aria-hidden="true">·</em> : null}
          <span className="summary_profile_card_detail_label">{item.label}:</span>
          <strong className="point_medium">{item.value}</strong>
        </span>
      ))}
    </p>
  )
}

function SummaryProfileCard({
  image,
  name,
  breed,
  details,
  stats,
  disabledStatLabels = [],
  clickableStatLabels = [],
  careGuideLabel = '건강 리포트',
  imageAlt,
  className,
  onEdit,
  onStatClick,
  onCareGuideClick,
}: SummaryProfileCardProps) {
  const classNames = className
    ? `summary_profile_card ${className}`
    : 'summary_profile_card'

  return (
    <article className={classNames}>
      <div className="summary_profile_card_top">
        <ProfileImage src={image} alt={imageAlt ?? `${name} 프로필`} />

        <div className="summary_profile_card_body summary_profile_card_text_frame">
          <div className="summary_profile_card_header">
            <div className="summary_profile_card_copy">
              <div className="summary_profile_card_heading">
                <div className="summary_profile_card_name_row">
                  <strong>{name}</strong>
                  {breed ? <span>{breed}</span> : null}
                </div>
                <button
                  type="button"
                  className="summary_profile_card_edit"
                  aria-label="프로필 수정"
                  onClick={onEdit}
                >
                  <ProfileEditIcon />
                </button>
              </div>
              <ProfileDetails details={details} />
              <button
                type="button"
                className="summary_profile_card_guide point_medium"
                onClick={onCareGuideClick}
              >
                {careGuideLabel}
                <ChevronIcon direction="right" size="md" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="summary_profile_card_stats" aria-label={`${name} 활동 요약`} role="list">
        {stats.map((stat, index) => {
          const { amount, unit } = splitStatValue(stat.value)
          const isDisabled = disabledStatLabels.includes(stat.label)
          const isClickable = !isDisabled && clickableStatLabels.includes(stat.label) && typeof onStatClick === 'function'

          return (
            <Fragment key={stat.label}>
              {isClickable ? (
                <button
                  type="button"
                  className="summary_profile_card_stat_item is_clickable"
                  role="listitem"
                  onClick={() => onStatClick(stat.label)}
                >
                  <div className="summary_profile_card_stat_label_group">
                    <span className="p_medium">{stat.label}</span>
                  </div>
                  <strong className="summary_profile_card_stat_value">
                    <span>{amount}</span>
                    {unit ? <span>{unit}</span> : null}
                  </strong>
                </button>
              ) : (
                <div
                  className={`summary_profile_card_stat_item${isDisabled ? ' is_disabled' : ''}`}
                  role="listitem"
                  aria-disabled={isDisabled}
                >
                  <div className="summary_profile_card_stat_label_group">
                    <span className="p_medium">{stat.label}</span>
                  </div>
                  <strong className="summary_profile_card_stat_value">
                    <span>{amount}</span>
                    {unit ? <span>{unit}</span> : null}
                  </strong>
                </div>
              )}
              {index < stats.length - 1 ? (
                <div className="summary_profile_card_stat_divider" aria-hidden="true">
                  <span className="summary_profile_card_stat_dot" />
                </div>
              ) : null}
            </Fragment>
          )
        })}
      </div>
    </article>
  )
}

export default SummaryProfileCard

export function SummaryProfileAddCard({
  label = '프로필 추가',
  className,
  onClick,
}: SummaryProfileAddCardProps) {
  const classNames = className
    ? `summary_profile_card summary_profile_card_add ${className}`
    : 'summary_profile_card summary_profile_card_add'

  return (
    <button type="button" className={classNames} aria-label={label} onClick={onClick}>
      <span className="summary_profile_card_add_button" aria-hidden="true">
        <i />
      </span>
    </button>
  )
}
