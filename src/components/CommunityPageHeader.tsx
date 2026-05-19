import { useNavigate } from 'react-router'
import PageHeader from './PageHeader'
import HeaderIcon from './HeaderIcon'
import Button from './html/Button'

function CommunityPageHeader() {
  const navigate = useNavigate()

  return (
    <PageHeader
      title="집사인생"
      rightContent={
        <>
          <Button
            type="button"
            aria-label="검색"
            className="community_header_search"
            onClick={() => navigate('/community/search')}
          >
            <HeaderIcon type="search" />
          </Button>
          <Button type="button" aria-label="캘린더" onClick={() => navigate('/mission')}>
            <HeaderIcon type="calendar" />
          </Button>
          <Button type="button" aria-label="알림" onClick={() => navigate('/notification')}>
            <HeaderIcon type="notification" />
          </Button>
        </>
      }
    />
  )
}

export default CommunityPageHeader
