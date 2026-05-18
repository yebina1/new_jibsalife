import './ActionOption.css'
import ChevronIcon from './ChevronIcon'
import Button from './html/Button'

type ActionOptionProps = {
  title: string
  description?: string
  onClick?: () => void
}

function ActionOption({ title, description, onClick }: ActionOptionProps) {
  return (
    <Button className="action_option" type="button" onClick={onClick}>
      <span className="action_option_mark" aria-hidden="true"></span>
      <div className="action_option_text">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <ChevronIcon direction="right" size="md" />
    </Button>
  )
}

export default ActionOption
