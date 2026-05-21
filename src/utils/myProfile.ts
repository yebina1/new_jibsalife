import profileImage from '../img/pink_dog_profile.jpg'
import blockDogProfileImage from '../img/mypage/block_dog_profile2.png'
import blockCatProfileImage from '../img/mypage/block_cat_profile.png'
import { isCurrentDemoUser, getUserScopedStorageKey } from './userScopedStorage'

export const MY_PROFILE_NAME = '뿌직뿌직'
export const MY_PROFILE_IMAGE = profileImage

const MY_PROFILE_STORAGE_KEY = 'jibsalife.my-profile'
export const MY_PROFILE_CHANGE_EVENT = 'jibsalife.my-profile-change'
const EMPTY_MY_PROFILE_NAME = '집사님'

export type MyProfileGuardianType = 'dog' | 'cat'

export type MyProfileStore = {
  name: string
  image?: string
  guardianType?: MyProfileGuardianType
}

const defaultMyProfile: MyProfileStore = {
  name: MY_PROFILE_NAME,
  image: MY_PROFILE_IMAGE,
}

const emptyMyProfile: MyProfileStore = {
  name: EMPTY_MY_PROFILE_NAME,
  image: MY_PROFILE_IMAGE,
}

const guardianProfileImages: Record<MyProfileGuardianType, string> = {
  dog: blockDogProfileImage,
  cat: blockCatProfileImage,
}

function isGuardianType(value: unknown): value is MyProfileGuardianType {
  return value === 'dog' || value === 'cat'
}

function resolveMyProfileImage(profile: Partial<MyProfileStore>) {
  if (isGuardianType(profile.guardianType)) {
    return guardianProfileImages[profile.guardianType]
  }

  return typeof profile.image === 'string' && profile.image.trim()
    ? profile.image
    : MY_PROFILE_IMAGE
}

export function readMyProfile() {
  if (typeof window === 'undefined') {
    return defaultMyProfile
  }

  const savedValue = window.localStorage.getItem(getUserScopedStorageKey(MY_PROFILE_STORAGE_KEY))
  if (!savedValue) {
    return isCurrentDemoUser() ? defaultMyProfile : emptyMyProfile
  }

  try {
    const parsedValue = JSON.parse(savedValue) as Partial<MyProfileStore>
    const guardianType = isGuardianType(parsedValue.guardianType) ? parsedValue.guardianType : undefined

    return {
      name: typeof parsedValue.name === 'string' && parsedValue.name.trim()
        ? parsedValue.name
        : (isCurrentDemoUser() ? MY_PROFILE_NAME : EMPTY_MY_PROFILE_NAME),
      image: resolveMyProfileImage({ ...parsedValue, guardianType }),
      guardianType,
    }
  } catch {
    return isCurrentDemoUser() ? defaultMyProfile : emptyMyProfile
  }
}

export function readMyProfileName() {
  return readMyProfile().name
}

export function readMyProfileImage() {
  return readMyProfile().image ?? MY_PROFILE_IMAGE
}

export function writeMyProfile(nextProfile: MyProfileStore) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getUserScopedStorageKey(MY_PROFILE_STORAGE_KEY), JSON.stringify(nextProfile))
  window.dispatchEvent(new CustomEvent(MY_PROFILE_CHANGE_EVENT, { detail: nextProfile }))
}

