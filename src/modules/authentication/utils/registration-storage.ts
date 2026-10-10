import { STORAGE_KEYS } from '@/constants'

export interface RegistrationPending {
  expiry: number
}

export const setRegistrationPending = (expiry: number) => {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(
    STORAGE_KEYS.REGISTRATION_PENDING,
    JSON.stringify({ expiry } as RegistrationPending),
  )
}

export const getRegistrationPending = (): RegistrationPending | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.REGISTRATION_PENDING)
    if (!stored) return null
    const parsed = JSON.parse(stored) as RegistrationPending
    if (parsed.expiry <= Date.now()) {
      clearRegistrationPending()
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export const clearRegistrationPending = () => {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(STORAGE_KEYS.REGISTRATION_PENDING)
}
