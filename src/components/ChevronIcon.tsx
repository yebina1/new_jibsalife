import './ChevronIcon.css'

type ChevronIconDirection = 'left' | 'right'
type ChevronIconSize = 'sm' | 'md' | 'lg'

type ChevronIconProps = {
  direction?: ChevronIconDirection
  size?: ChevronIconSize
  className?: string
}

const chevronPaths = {
  lg: {
    left: 'M16.915 8.165 11.085 14l5.83 5.835',
    right: 'M11.085 8.165 16.915 14l-5.83 5.835',
  },
  md: {
    left: 'M16.085 9.835 11.915 14l4.17 4.165',
    right: 'M11.915 9.835 16.085 14l-4.17 4.165',
  },
  sm: {
    left: 'M17.5 7 10.5 14l7 7',
    right: 'M10.5 7 17.5 14l-7 7',
  },
} as const

function ChevronIcon({ direction = 'right', size = 'md', className }: ChevronIconProps) {
  const classNames = [
    'chevron_icon',
    `chevron_icon_${direction}`,
    `chevron_icon_${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classNames} aria-hidden="true">
      <svg className="chevron_icon_svg" viewBox="0 0 28 28" focusable="false">
        <path
          className="chevron_icon_path"
          d={chevronPaths[size][direction]}
        />
      </svg>
    </span>
  )
}

export default ChevronIcon
