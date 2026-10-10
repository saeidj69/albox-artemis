/** Matches Jupiter `Order::PAYMENT_REFERENCE_ENTITY` (case-sensitive lookup). */
export const PAYMENT_REFERENCE_ENTITY = {
  ORDER: 'order',
} as const

/** Jupiter `ErrorCode` values the client handles by code, not message. */
export const ERROR_CODES = {
  BAROOK_WALLET_NOT_FOUND: 5024,
  BAROOK_WALLET_DISABLED: 5025,
  BAROOK_INVALID_PRINCIPAL: 5026,
  BAROOK_ATTEMPT_ALREADY_IN_PROGRESS: 5027,
  BAROOK_PAYMENT_NOT_ELIGIBLE: 5028,
  BAROOK_PROVIDER_REQUEST_FAILED: 5029,
  BAROOK_PROVIDER_UNAVAILABLE: 5030,
  BAROOK_IDEMPOTENCY_KEY_CONFLICT: 5031,
} as const

export const BAROOK_AMOUNT_MODE = {
  ORDER_DEDUCTION: 'order-deduction',
  GATEWAY: 'gateway',
} as const

/** External Barook credit onboarding (opened from inactive payment option CTA). */
export const BAROOK_CREDIT_URL = 'https://barook.ir/'

export type BarookAmountMode =
  (typeof BAROOK_AMOUNT_MODE)[keyof typeof BAROOK_AMOUNT_MODE]

/** Minimum leftover a later IPG/card payment can collect, in toman. */
export const MIN_IPG_TOMAN = 10_000

export const BAROOK_VALIDATION_MESSAGE = {
  CREDIT: (maxToman: string) =>
    `مبلغ وارد شده بیشتر از اعتبار قابل استفاده شماست. حداکثر ${maxToman} تومان.`,
  ORDER: (maxToman: string) =>
    `مبلغ وارد شده بیشتر از مبلغ باقی‌مانده سفارش است. حداکثر ${maxToman} تومان.`,
  IPG_REMAINDER: (minToman: string) =>
    `مانده سفارش پس از این مبلغ کمتر از ${minToman} تومان می‌شود و پرداخت با کارت ممکن نیست.`,
} as const

/**
 * Jupiter paths that must be reached by a top-level browser navigation rather
 * than the generated API client — they answer with a 302 into the gateway
 * checkout page, which a `fetch` cannot follow or read.
 */
export const PAYMENT_API_PATHS = {
  orderPay: (orderId: string | number) =>
    `/payment/payments/${PAYMENT_REFERENCE_ENTITY.ORDER}/pay/${orderId}`,
} as const
