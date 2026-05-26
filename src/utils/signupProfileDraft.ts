import type { AuthAccount } from './authAccounts'
import defaultPetThumbnail from '../img/petstory/daily/daily_thumbnail.jpg'
import { readMyProfile, writeMyProfile } from './myProfile'
import { writePetProfile } from './petProfile'
import { readPetProfiles, writePetProfiles, writeSelectedPetProfileId } from './petProfiles'

const SIGNUP_PROFILE_DRAFT_KEY = 'jibsalife.signup.profile-draft'

export type SignupProfileDraft = {
  guardianType: 'dog' | 'cat'
  guardianName: string
  petName: string
}

export function readSignupProfileDraft(): SignupProfileDraft | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(SIGNUP_PROFILE_DRAFT_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<SignupProfileDraft>
    if (
      (parsed.guardianType !== 'dog' && parsed.guardianType !== 'cat') ||
      typeof parsed.guardianName !== 'string' ||
      typeof parsed.petName !== 'string'
    ) {
      return null
    }

    const guardianName = parsed.guardianName.trim()
    const petName = parsed.petName.trim()
    if (!guardianName || !petName) return null

    return {
      guardianType: parsed.guardianType,
      guardianName,
      petName,
    }
  } catch {
    return null
  }
}

export function writeSignupProfileDraft(draft: SignupProfileDraft) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(SIGNUP_PROFILE_DRAFT_KEY, JSON.stringify(draft))
}

export function clearSignupProfileDraft() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(SIGNUP_PROFILE_DRAFT_KEY)
}

export function hydrateCurrentUserProfileFromAccount(account: AuthAccount) {
  if (
    account.profileSetupDone !== true ||
    (account.petType !== 'dog' && account.petType !== 'cat') ||
    typeof account.petName !== 'string' ||
    !account.petName.trim()
  ) {
    return
  }

  const existingProfiles = readPetProfiles()
  if (existingProfiles.length > 0) return

  const currentProfile = readMyProfile()
  writeMyProfile({
    name: account.profileName?.trim() || currentProfile.name,
    guardianType: account.petType,
    image: currentProfile.image,
  })
  writePetProfile({ name: account.petName.trim() })
  writePetProfiles([
    {
      id: 1,
      type: 'profile',
      name: account.petName.trim(),
      breed: '',
      image: defaultPetThumbnail,
      birthDate: '',
      weight: '',
      sex: '',
    },
  ])
  writeSelectedPetProfileId(1)
}
