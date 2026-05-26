import './Health.css'
import './HealthResultDetail.css'
import { useNavigate } from 'react-router'
import PageHeader from '../../components/PageHeader'
import HeaderIcon from '../../components/HeaderIcon'
import BackButton from '../../components/html/BackButton'
import Button from '../../components/html/Button'
import HealthResultDetailBox from '../../components/HealthResultDetailBox'
import {
  calculateHealthResult,
  createHealthResultDetailItems,
  readStoredHealthResultInput,
} from '../../utils/healthResultPolicy'
import { readPetProfiles, readSelectedPetProfileId } from '../../utils/petProfiles'

const HEALTHY_RESULT_INPUT = {
  stoolStatus: 'stable',
  activityStatus: 'stable',
  mealStatus: 'stable',
  weightStatus: 'stable',
  symptomStatus: 'stable',
  photoStatus: 'stable',
} as const

function HealthResultDetail() {
  const navigate = useNavigate()
  const pets = readPetProfiles()
  const selectedPetId = readSelectedPetProfileId()
  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? pets[0] ?? null
  const result = calculateHealthResult(selectedPet?.id === 2 ? HEALTHY_RESULT_INPUT : readStoredHealthResultInput())
  const detailItems = createHealthResultDetailItems(result)

  return (
    <>
      <PageHeader
        title="AI 건강 체크"
        leftContent={<BackButton />}
        rightContent={
          <>
            <Button type="button" aria-label="캘린더" onClick={() => navigate('/mission')}>
              <HeaderIcon type="calendar" />
            </Button>
            <Button type="button" aria-label="알림">
              <HeaderIcon type="notification" />
            </Button>
          </>
        }
      />
      <main className="page health_page health_result_detail_page">
        <HealthResultDetailBox items={detailItems} />
      </main>
    </>
  )
}

export default HealthResultDetail
