import { STORAGE_KEYS } from '@/constants'
import { atomWithStorage } from 'jotai/utils'

import type { LoginState } from '../types'

const initialLoginState: LoginState = {
  step: 'phoneNumber',
  previousStep: 'none',
  phoneNumber: '',
  expiresAt: 0,
  resendAvailableAt: 0,
}

export const loginStateAtom = atomWithStorage<LoginState>(
  STORAGE_KEYS.AUTH_LOGIN_STATE,
  initialLoginState,
)
