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
  step,
  totalSteps,
  topCenterLabel,
  topActionLabel,
  topActionInline = false,
  reserveTopActionSpace = false,
  onTopAction,
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
    topActionLabel || reserveTopActionSpace ? 'has_top_action' : '',
    tappable ? 'is_tappable' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const progressLabel =
    typeof step === 'number' && typeof totalSteps === 'number' ? (
      <>
        <span className="title_h4_semibold">{step}</span>
        <span className="onboarding_layout_progress_divider">/</span>
        <span className="onboarding_layout_progress_total title_h4_semibold">{totalSteps}</span>
      </>
    ) : topCenterLabel ? (
      <span className="title_h4_semibold">{topCenterLabel}</span>
    ) : null

  return (
    <section className={sectionClassName}>
      {topActionLabel && !topActionInline ? (
        <div className="onboarding_layout_topbar">
          <button
            type="button"
            className="onboarding_layout_top_action caption_medium"
            onClick={onTopAction}
          >
            {topActionLabel}
          </button>
        </div>
      ) : reserveTopActionSpace ? (
        <div className="onboarding_layout_topbar">
          <span className="onboarding_layout_top_action onboarding_layout_top_action_placeholder caption_medium">
            .
          </span>
        </div>
      ) : null}

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
          {progressLabel ? (
            <div
              className={`onboarding_layout_progress_row${topActionLabel && topActionInline ? ' has_inline_action' : ''}`}
            >
              <p className="onboarding_layout_progress onboarding_layout_progress_label">
                {progressLabel}
              </p>
              {topActionLabel && topActionInline ? (
                <div className="onboarding_layout_top_action_inline_slot">
                  <button
                    type="button"
                    className="onboarding_layout_top_action caption_medium"
                    onClick={onTopAction}
                  >
                    {topActionLabel}
                  </button>
                </div>
              ) : null}
            </div>
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
