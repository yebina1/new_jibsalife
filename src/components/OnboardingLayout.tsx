import type { ReactNode } from 'react'
import Button from './html/Button'
import Title from './Title'
import './OnboardingLayout.css'

type OnboardingLayoutProps = {
  step?: number
  totalSteps?: number
  topCenterLabel?: ReactNode
  topActionLabel?: string
  topActionInline?: boolean
  reserveTopActionSpace?: boolean
  onTopAction?: () => void
  title: ReactNode
  subtitle?: ReactNode
  visual?: ReactNode
  children?: ReactNode
  bodyGap?: number
  contentGap?: number
  actionLabel?: string
  actionClassName?: string
  actionDisabled?: boolean
  onAction?: () => void
  indicatorCount?: number
  activeIndicator?: number
  tappable?: boolean
  onContentClick?: () => void
}

function OnboardingLayout({
  topCenterLabel,
  title,
  subtitle,
  visual,
  children,
  bodyGap,
  contentGap,
  actionLabel,
  actionClassName,
  actionDisabled = false,
  onAction,
  indicatorCount,
  activeIndicator,
  tappable = false,
  onContentClick,
}: OnboardingLayoutProps) {
  const actionClassNames = actionClassName
    ? `onboarding_layout_action ${actionClassName}`
    : 'onboarding_layout_action'

  const sectionClassName = [
    'onboarding_layout',
    tappable ? 'is_tappable' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={sectionClassName}>
      <div
        className="onboarding_layout_content"
        style={contentGap ? { ['--onboarding-content-gap' as string]: `${contentGap}px` } : undefined}
        onClick={tappable ? onContentClick : undefined}
        role={tappable ? 'button' : undefined}
        tabIndex={tappable ? 0 : undefined}
        onKeyDown={
          tappable
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onContentClick?.()
                }
              }
            : undefined
        }
      >
        <div className="onboarding_layout_header">
          {topCenterLabel ? (
            <p className="onboarding_layout_progress onboarding_layout_progress_label">
              <span className="title_h4_semibold">{topCenterLabel}</span>
            </p>
          ) : null}

          <Title as="h2" className="onboarding_layout_copy" title={title}>
            {subtitle ? <div className="onboarding_layout_subtitle subTitle_regular">{subtitle}</div> : null}
          </Title>
        </div>

        <div
          className="onboarding_layout_body"
          style={bodyGap ? { ['--onboarding-body-gap' as string]: `${bodyGap}px` } : undefined}
        >
          {visual ? <div className="onboarding_layout_visual">{visual}</div> : null}
          {children}
          {typeof indicatorCount === 'number' && indicatorCount > 0 ? (
            <div className="onboarding_layout_indicators" aria-label="온보딩 진행 표시">
              {Array.from({ length: indicatorCount }, (_, index) => (
                <span
                  key={index}
                  className={index === activeIndicator ? 'is_active' : undefined}
                  aria-hidden="true"
                />
              ))}
            </div>
          ) : null}
          {actionLabel ? (
            <Button
              type="button"
              className={actionClassNames}
              disabled={actionDisabled}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default OnboardingLayout
