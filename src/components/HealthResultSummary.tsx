import './HealthResultSummary.css'
import { Link } from 'react-router'
import ChevronIcon from './ChevronIcon'

export type HealthResultSummaryItem = {
  icon: 'warning' | 'search' | 'chat' | 'hospital' | 'report'
  label: string
  value: string
  to?: string
}

type HealthResultSummaryProps = {
  title: string
  items: HealthResultSummaryItem[]
}

function SummaryIcon({ type }: { type: HealthResultSummaryItem['icon'] }) {
  if (type === 'warning') {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true" className="summary_icon_warning">
        <path d="M17.4 5.7a3 3 0 0 1 5.2 0l14.2 25.1a3 3 0 0 1-2.6 4.5H5.8a3 3 0 0 1-2.6-4.5L17.4 5.7Z" />
        <path d="M20 14v10" />
        <circle cx="20" cy="29.2" r="1.9" />
      </svg>
    )
  }

  if (type === 'search') {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true" className="summary_icon_search">
        <circle cx="17" cy="17" r="10.8" fill="none" />
        <path d="m25 25 9 9" fill="none" />
      </svg>
    )
  }

  if (type === 'chat') {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true" className="summary_icon_chat">
        <path d="M20 6C10.8 6 4 11.8 4 19c0 4 2.1 7.6 5.6 10L8.2 35l6.6-3.2c1.6.5 3.3.8 5.2.8 9.2 0 16-5.8 16-13.6S29.2 6 20 6Z" />
        <circle cx="13.4" cy="19.2" r="2" fill="#ffffff" />
        <circle cx="20" cy="19.2" r="2" fill="#ffffff" />
        <circle cx="26.6" cy="19.2" r="2" fill="#ffffff" />
      </svg>
    )
  }

  if (type === 'hospital') {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true" className="summary_icon_hospital">
        <rect x="7" y="15" width="26" height="20" rx="2" />
        <rect x="13" y="7" width="14" height="12" rx="2" />
        <path d="M20 10.5v8" />
        <path d="M16 14.5h8" />
        <path d="M13 23h4" />
        <path d="M23 23h4" />
        <path d="M13 30h4" />
        <path d="M23 30h4" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="summary_icon_report">
      <rect x="8" y="4" width="24" height="32" rx="5" />
      <path d="M14 13h12" />
      <path d="M14 20h12" />
      <path d="M14 27h12" />
    </svg>
  )
}

function HealthResultSummary({ title, items }: HealthResultSummaryProps) {
  return (
    <section className="health_result_summary_box">
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            {item.to ? (
              <Link className="health_result_summary_link" to={item.to}>
                <div className="health_result_summary_label">
                  <SummaryIcon type={item.icon} />
                  <strong>{item.label}</strong>
                </div>
                <div className="health_result_summary_value">
                  <span>{item.value}</span>
                  <ChevronIcon direction="right" size="md" />
                </div>
              </Link>
            ) : (
              <div className="health_result_summary_link health_result_summary_link_static">
                <div className="health_result_summary_label">
                  <SummaryIcon type={item.icon} />
                  <strong>{item.label}</strong>
                </div>
                <div className="health_result_summary_value">
                  <span>{item.value}</span>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default HealthResultSummary
