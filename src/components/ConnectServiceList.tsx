import './ConnectServiceList.css'
import Button from './html/Button'

export type ConnectServiceItem = {
  title: string
  description: string
  onClick?: () => void
}

type ConnectServiceListProps = {
  items: ConnectServiceItem[]
}

function ConnectServiceList({ items }: ConnectServiceListProps) {
  return (
    <div className="connect_service_list">
      {items.map((item) => (
        <Button
          className="connect_service_button"
          type="button"
          key={item.title}
          onClick={item.onClick}
        >
          <span aria-hidden="true"></span>
          <strong>{item.title}</strong>
          <p>{item.description}</p>
        </Button>
      ))}
    </div>
  )
}

export default ConnectServiceList
