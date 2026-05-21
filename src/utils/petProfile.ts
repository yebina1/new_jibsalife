import { getUserScopedStorageKey } from './userScopedStorage'

const PET_PROFILE_STORAGE_KEY = 'jibsalife.pet-profile'

type PetProfileStore = {
  name: string
}

const defaultPetProfile: PetProfileStore = {
  name: '',
}

export function readPetProfile() {
  if (typeof window === 'undefined') {
    return defaultPetProfile
  }

  const savedValue = window.localStorage.getItem(getUserScopedStorageKey(PET_PROFILE_STORAGE_KEY))
  if (!savedValue) {
    return defaultPetProfile
  }

  try {
    const parsedValue = JSON.parse(savedValue) as Partial<PetProfileStore>
    return {
      name: typeof parsedValue.name === 'string' ? parsedValue.name : '',
    }
  } catch {
    return defaultPetProfile
  }
}

export function writePetProfile(nextProfile: PetProfileStore) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getUserScopedStorageKey(PET_PROFILE_STORAGE_KEY), JSON.stringify(nextProfile))
}

export function readPetProfileName() {
  return readPetProfile().name
}
