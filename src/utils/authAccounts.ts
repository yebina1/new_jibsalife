export type AuthAccount = {
  id: string
  password: string
  profileName?: string
  petType?: 'dog' | 'cat' | null
  petName?: string
  profileSetupDone?: boolean
  createdAt: string
}

const AUTH_ACCOUNTS_STORAGE_KEY = 'jibsalife.auth.accounts'
export const AUTH_LOGGED_IN_STORAGE_KEY = 'jibsalife.auth.loggedIn'
export const AUTH_CURRENT_USER_STORAGE_KEY = 'jibsalife.auth.currentUser'
export const PROFILE_SETUP_DONE_STORAGE_KEY = 'jibsalife.onboarding.profile.done'
export const SIGNUP_ACCOUNT_LOGIN_TOAST_KEY = 'jibsalife.signupAccountLoginToastPending'

const demoAccount: AuthAccount = {
  id: 'hello@jipsa.app',
  password: '123456',
  profileSetupDone: true,
  createdAt: 'demo',
}

function normalizeId(id: string) {
  return id.trim().toLowerCase()
}

export function readAuthAccounts() {
  if (typeof window === 'undefined') {
    return [demoAccount]
  }

  const savedValue = window.localStorage.getItem(AUTH_ACCOUNTS_STORAGE_KEY)
  if (!savedValue) {
    return [demoAccount]
  }

  try {
    const parsedValue = JSON.parse(savedValue) as Partial<AuthAccount>[]
    const savedAccounts = parsedValue
      .filter((account): account is AuthAccount =>
        typeof account.id === 'string' &&
        typeof account.password === 'string' &&
        typeof account.createdAt === 'string',
      )
      .map((account) => ({
        ...account,
        id: normalizeId(account.id),
      }))

    return [demoAccount, ...savedAccounts.filter((account) => account.id !== demoAccount.id)]
  } catch {
    return [demoAccount]
  }
}

export function hasAuthAccount(id: string) {
  const normalizedId = normalizeId(id)
  return readAuthAccounts().some((account) => account.id === normalizedId)
}

export function saveAuthAccount(account: Omit<AuthAccount, 'id' | 'createdAt'> & { id: string }) {
  if (typeof window === 'undefined') {
    return
  }

  const normalizedId = normalizeId(account.id)
  const nextAccount: AuthAccount = {
    ...account,
    id: normalizedId,
    profileSetupDone: account.profileSetupDone ?? false,
    createdAt: new Date().toISOString(),
  }
  const nextAccounts = [
    nextAccount,
    ...readAuthAccounts().filter((savedAccount) => (
      savedAccount.id !== normalizedId && savedAccount.id !== demoAccount.id
    )),
  ]

  window.localStorage.setItem(AUTH_ACCOUNTS_STORAGE_KEY, JSON.stringify(nextAccounts))
}

export function findAuthAccount(id: string, password: string) {
  const normalizedId = normalizeId(id)
  return readAuthAccounts().find((account) => (
    account.id === normalizedId && account.password === password
  ))
}

export function markLoggedIn(account: AuthAccount) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(AUTH_LOGGED_IN_STORAGE_KEY, 'true')
  window.localStorage.setItem(AUTH_CURRENT_USER_STORAGE_KEY, account.id)

  if (shouldShowProfileSetupForAccount(account)) {
    window.localStorage.removeItem(PROFILE_SETUP_DONE_STORAGE_KEY)
  } else {
    window.localStorage.setItem(PROFILE_SETUP_DONE_STORAGE_KEY, 'true')
  }
}

export function isDemoAccount(accountOrId: AuthAccount | string | null | undefined) {
  const id = typeof accountOrId === 'string' ? accountOrId : accountOrId?.id
  return normalizeId(id ?? '') === demoAccount.id
}

export function getCurrentAuthAccount() {
  if (typeof window === 'undefined') {
    return null
  }

  const currentUserId = window.localStorage.getItem(AUTH_CURRENT_USER_STORAGE_KEY)
  if (!currentUserId) {
    return null
  }

  const normalizedId = normalizeId(currentUserId)
  return readAuthAccounts().find((account) => account.id === normalizedId) ?? null
}

export function shouldShowProfileSetupForAccount(account: AuthAccount | null | undefined) {
  if (!account || isDemoAccount(account)) {
    return false
  }

  return account.profileSetupDone === false
}

export function shouldShowProfileSetupForCurrentUser() {
  if (typeof window === 'undefined') {
    return false
  }

  if (window.localStorage.getItem(PROFILE_SETUP_DONE_STORAGE_KEY) === 'true') {
    return false
  }

  return shouldShowProfileSetupForAccount(getCurrentAuthAccount())
}

export function markLoggedOut() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTH_LOGGED_IN_STORAGE_KEY)
  window.localStorage.removeItem(AUTH_CURRENT_USER_STORAGE_KEY)
  window.sessionStorage.removeItem(SIGNUP_ACCOUNT_LOGIN_TOAST_KEY)
}

export function markCurrentUserProfileSetupDone() {
  if (typeof window === 'undefined') {
    return
  }

  const currentUser = getCurrentAuthAccount()
  window.localStorage.setItem(PROFILE_SETUP_DONE_STORAGE_KEY, 'true')

  if (!currentUser || isDemoAccount(currentUser)) {
    return
  }

  const nextAccounts = readAuthAccounts()
    .filter((account) => account.id !== demoAccount.id)
    .map((account) => (
      account.id === currentUser.id
        ? { ...account, profileSetupDone: true }
        : account
    ))

  window.localStorage.setItem(AUTH_ACCOUNTS_STORAGE_KEY, JSON.stringify(nextAccounts))
}
