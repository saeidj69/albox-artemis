import { environmentManager } from '@/config/environment'
import { PAYMENT_API_PATHS, ROUTES } from '@/constants'

export type PaymentResultParams = {
  status?: string | null
  type?: string | null
  message?: string | null
  referenceId?: string | null
}

export const buildPaymentResultUrl = (params: PaymentResultParams): string => {
  const searchParams = new URLSearchParams()

  if (params.status) {
    searchParams.set('status', params.status)
  }

  if (params.type) {
    searchParams.set('type', params.type)
  }

  if (params.message) {
    searchParams.set('message', params.message)
  }

  if (params.referenceId) {
    searchParams.set('referenceId', params.referenceId)
  }

  const query = searchParams.toString()
  return query ? `${ROUTES.PAYMENT.RESULT}?${query}` : ROUTES.PAYMENT.RESULT
}

export const parsePaymentResultParamsFromUrl = (
  url: string,
): PaymentResultParams | null => {
  try {
    const parsed = new URL(url)

    return {
      status: parsed.searchParams.get('status'),
      type: parsed.searchParams.get('type'),
      message: parsed.searchParams.get('message'),
      referenceId: parsed.searchParams.get('referenceId'),
    }
  } catch {
    return null
  }
}

export const isImmediatePaymentCallbackUrl = (url: string): boolean => {
  try {
    return new URL(url).searchParams.has('status')
  } catch {
    return false
  }
}

/**
 * Assign this to `window.location.href` so the browser itself follows Jupiter's
 * 302 into the gateway checkout page. Resolving it with `fetch` is not possible:
 * `redirect: 'manual'` yields an opaque-redirect response with status 0 and no
 * readable `Location`, and `redirect: 'follow'` would fetch the checkout page in
 * the background, initiating the gateway transaction outside the document that
 * has to submit its form.
 */
export const buildOrderPayUrl = (orderId: string | number): string =>
  `${environmentManager.getApiUrl()}${PAYMENT_API_PATHS.orderPay(orderId)}`

/** Top-level navigation into a provider checkout page (or any external URL). */
export const navigateToExternalUrl = (url: string) => {
  window.location.href = url
}
