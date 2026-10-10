import { ERROR_CODES } from '@/constants/payment'

import type { PaymentBarookWalletDetails } from '@/api/models'
import {
  getErrorCodeFromUnknown,
  getHttpStatusFromUnknown,
} from '@/api/mutator/utils/error-message'

export type BarookOptionState =
  | 'loading'
  | 'inactive'
  | 'unknown'
  | 'active'
  | 'providerError'
  | 'rateLimited'

const creditStatusBeforeDiscover = (discoverAttempted: boolean) =>
  discoverAttempted ? 'inactive' : 'unknown'

export const getBarookOptionState = (args: {
  isLoading: boolean
  /** Prefer discover error over wallet error when both exist. */
  error?: unknown
  wallet?: PaymentBarookWalletDetails
  /** True after the user ran discover at least once this sheet session. */
  discoverAttempted?: boolean
}): BarookOptionState => {
  const discoverAttempted = args.discoverAttempted ?? false

  if (args.isLoading) return 'loading'

  if (args.error != null) {
    const status = getHttpStatusFromUnknown(args.error)
    if (status === 429) return 'rateLimited'

    const code = getErrorCodeFromUnknown(args.error)
    if (code === ERROR_CODES.BAROOK_WALLET_NOT_FOUND) {
      return creditStatusBeforeDiscover(discoverAttempted)
    }
    if (code === ERROR_CODES.BAROOK_WALLET_DISABLED) return 'inactive'

    return 'providerError'
  }

  if (!args.wallet) return creditStatusBeforeDiscover(discoverAttempted)
  if (!args.wallet.enabled) return 'inactive'
  if (args.wallet.remote == null) {
    return creditStatusBeforeDiscover(discoverAttempted)
  }
  return 'active'
}
