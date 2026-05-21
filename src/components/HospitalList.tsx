import './HospitalList.css'
import Button from './html/Button'

export type HospitalListItem = {
  name: string
  rating: string
  distance: string
  status?: string
  hours?: string
  onClick?: () => void
}

type HospitalListProps = {
  items: HospitalListItem[]
}

function HospitalList({ items }: HospitalListProps) {
  return (
    <ul className="hospital_list">
      {items.map((item) => (
        <li key={item.name}>
          <Button type="button" onClick={item.onClick}>
            <span className="hospital_list_image" aria-hidden="true"></span>
            <div>
              <strong>{item.name}</strong>
              <p>
                <i className="bx bxs-star" aria-hidden="true"></i>
                {item.rating}
                <span>{item.distance}</span>
              </p>
              {(item.status || item.hours) && (
                <p className="hospital_list_meta">
                  {item.status && <span>{item.status}</span>}
                  {item.hours && <span>{item.hours}</span>}
                </p>
              )}
            </div>
            <span className="hospital_list_action" aria-hidden="true"></span>
          </Button>
        </li>
      ))}
    </ul>
  )
}

export default HospitalList
