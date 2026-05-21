import './OxVoteOptions.css'
import voteOIcon from '../svg/vote_o.svg'
import voteXIcon from '../svg/vote_x.svg'

type OxVoteOptionId = 1 | 2

type OxVoteOptionsProps = {
  selectedId?: OxVoteOptionId | null
  onSelect?: (id: OxVoteOptionId) => void
  className?: string
}

const OX_OPTIONS = [
  { id: 1, icon: voteOIcon, alt: 'O' },
  { id: 2, icon: voteXIcon, alt: 'X' },
] as const

function OxVoteOptions({ selectedId = null, onSelect, className }: OxVoteOptionsProps) {
  const gridClassName = ['ox_vote_options', className].filter(Boolean).join(' ')

  return (
    <div className={gridClassName}>
      {OX_OPTIONS.map((option) => {
        const optionClassName = `ox_vote_option${selectedId === option.id ? ' selected' : ''}`

        if (onSelect) {
          return (
            <button
              key={option.id}
              type="button"
              className={optionClassName}
              onClick={() => onSelect(option.id)}
            >
              <img src={option.icon} alt={option.alt} className="ox_vote_icon" />
            </button>
          )
        }

        return (
          <div key={option.id} className={optionClassName}>
            <img src={option.icon} alt={option.alt} className="ox_vote_icon" />
          </div>
        )
      })}
    </div>
  )
}

export default OxVoteOptions
