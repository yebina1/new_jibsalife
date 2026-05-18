import { useNavigate } from 'react-router'
import Button from './Button'

type CloseButtonProps = {
  to?: string
}

export default function CloseButton({ to = '/health' }: CloseButtonProps) {
  const navigate = useNavigate()

  return (
    <Button type="button" aria-label="닫기" onClick={() => navigate(to)}>
      <i className="bx bx-x"></i>
    </Button>
  )
}
