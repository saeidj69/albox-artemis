import {
  BAROOK_AMOUNT_MODE,
  BAROOK_VALIDATION_MESSAGE,
  MIN_IPG_TOMAN,
  type BarookAmountMode,
} from '@/constants'

import { englishDigits, formatPrice, onlyDigits } from '@/utils/numbers'

export const tomanToRial = (toman: number) => Math.round(toman * 10)

/** Floor rial → toman so a round-trip cannot inflate `principalAmount`. */
export const rialToTomanTrunc = (rial: number) =>
  Math.trunc(Math.max(0, rial) / 10)

export const initiatePrincipalRial = (
  calculatedPrincipalRial: number,
  orderAmountRial: number,
) =>
  Math.min(Math.max(0, calculatedPrincipalRial), Math.max(0, orderAmountRial))

/**
 * Percentage in basis points, matching Jupiter
 * `(int)(string)$percentage->mul(100)` on a 2-decimal rate.
 */
export const basisPoints = (percentage: number) => Math.round(percentage * 100)

const intdivProduct = (left: number, right: number, denominator: number) =>
  Number((BigInt(left) * BigInt(right)) / BigInt(denominator))

/**
 * Commission owed on a principal, matching Jupiter `BarookAttempt::commissionOf`.
 */
export const commissionOf = (principal: number, percentage: number) => {
  if (principal <= 0) return 0

  return intdivProduct(Math.trunc(principal), basisPoints(percentage), 10_000)
}

/**
 * Largest principal a gross amount can fund, matching Jupiter
 * `BarookAttempt::largestAffordablePrincipal`.
 */
export const largestAffordablePrincipal = (
  balance: number,
  percentage: number,
) => {
  if (balance <= 0) return 0

  const gross = Math.trunc(balance)
  let principal = intdivProduct(gross, 10_000, 10_000 + basisPoints(percentage))

  while (
    principal > 0 &&
    principal + commissionOf(principal, percentage) > gross
  ) {
    principal -= 1
  }

  while (principal + 1 + commissionOf(principal + 1, percentage) <= gross) {
    principal += 1
  }

  return principal
}

export type BarookCalculatorParams = {
  mode: BarookAmountMode
  inputToman: number | null
  commissionPercentage: number
  pendingAmountRial: number
  walletBalanceRial: number
  maxAffordablePrincipalRial: number | null
  remoteCreditRial: number | null
}

export type BarookCalculatorResult = {
  isEmpty: boolean
  isInputDisabled: boolean
  principalRial: number
  commissionRial: number
  grossRial: number
  localPrincipalRial: number
  localGrossRial: number
  providerGrossRial: number
  creditPrincipalRial: number
  creditCommissionRial: number
  creditGrossRial: number
  remainingPayableRial: number
  validationError: string | null
  canSubmit: boolean
}

const isEmptyInput = (inputToman: number | null) =>
  inputToman == null || inputToman <= 0

const pickTighterError = (
  inputToman: number,
  limits: { capacity: number; message: string }[],
) => {
  const exceeded = limits.filter((limit) => inputToman > limit.capacity)

  if (exceeded.length === 0) return null

  return exceeded.reduce((tightest, current) =>
    current.capacity <= tightest.capacity ? current : tightest,
  ).message
}

export const resolveWalletPrincipal = (
  walletBalanceRial: number,
  commissionPercentage: number,
  maxAffordablePrincipalRial: number | null,
) => {
  if (maxAffordablePrincipalRial != null) {
    return Math.max(0, maxAffordablePrincipalRial)
  }

  return largestAffordablePrincipal(walletBalanceRial, commissionPercentage)
}

export const capWalletPrincipal = (
  walletPrincipalRial: number,
  pendingAmountRial: number,
) => {
  if (pendingAmountRial <= 0) return Math.max(0, walletPrincipalRial)

  return Math.min(pendingAmountRial, Math.max(0, walletPrincipalRial))
}

export const MIN_IPG_RIAL = tomanToRial(MIN_IPG_TOMAN)

export const isIpgRemainderTooSmall = (remainingPayableRial: number) =>
  remainingPayableRial > 0 && remainingPayableRial < MIN_IPG_RIAL

const isAtMostOneToman = (rial: number) => rialToTomanTrunc(rial) <= 1

/**
 * Toman input cannot express leftover rials. If that stub would fail MIN_IPG
 * and is at most 1 toman, fold it into the Barook principal instead.
 */
const absorbUnpayableLeftover = (
  creditPrincipalRial: number,
  remainingRial: number,
  maxCreditRial: number,
) => {
  const leftover = remainingRial - creditPrincipalRial

  if (!isIpgRemainderTooSmall(leftover) || !isAtMostOneToman(leftover)) {
    return creditPrincipalRial
  }

  if (maxCreditRial < remainingRial) return creditPrincipalRial

  return remainingRial
}

/**
 * Suggested credit principal: min(credit, remaining after wallet).
 * Returns null when there is nothing to suggest, or when that amount would
 * leave an IPG leftover in (0, MIN_IPG).
 */
export const suggestBarookPrincipalRial = (params: {
  remainingRial: number
  remoteCreditRial: number | null
  commissionPercentage: number
}) => {
  const { remainingRial, remoteCreditRial, commissionPercentage } = params

  const creditPrincipalRial =
    remoteCreditRial == null
      ? 0
      : largestAffordablePrincipal(remoteCreditRial, commissionPercentage)

  const suggested = Math.min(
    Math.max(0, creditPrincipalRial),
    Math.max(0, remainingRial),
  )

  if (suggested <= 0) return null

  const leftover = remainingRial - suggested
  if (isIpgRemainderTooSmall(leftover)) return null

  return suggested
}

export const suggestedAmountToman = (
  principalRial: number,
  mode: BarookAmountMode,
  commissionPercentage: number,
) => {
  if (mode === BAROOK_AMOUNT_MODE.GATEWAY) {
    return rialToTomanTrunc(
      principalRial + commissionOf(principalRial, commissionPercentage),
    )
  }

  return rialToTomanTrunc(principalRial)
}

export const convertBarookAmountToman = (
  amountToman: number,
  fromMode: BarookAmountMode,
  toMode: BarookAmountMode,
  commissionPercentage: number,
) => {
  if (fromMode === toMode) return amountToman

  const amountRial = tomanToRial(amountToman)

  if (toMode === BAROOK_AMOUNT_MODE.GATEWAY) {
    return rialToTomanTrunc(
      amountRial + commissionOf(amountRial, commissionPercentage),
    )
  }

  return rialToTomanTrunc(
    largestAffordablePrincipal(amountRial, commissionPercentage),
  )
}

export const sanitizeTomanAmount = (raw: string) => {
  const normalized = englishDigits(raw)

  if (/[-−]/.test(normalized)) return null

  const decimalMarks = [
    normalized.indexOf('.'),
    normalized.indexOf('٫'),
  ].filter((index) => index >= 0)
  const integerPart =
    decimalMarks.length === 0
      ? normalized
      : normalized.slice(0, Math.min(...decimalMarks))

  return onlyDigits(integerPart)
}

const validateTypedAmount = (params: {
  mode: BarookAmountMode
  inputToman: number
  remainingRial: number
  commissionPercentage: number
  remoteCreditRial: number | null
}) => {
  const {
    mode,
    inputToman,
    remainingRial,
    commissionPercentage,
    remoteCreditRial,
  } = params

  const remainingNetToman = rialToTomanTrunc(remainingRial)
  const remainingGrossToman = rialToTomanTrunc(
    remainingRial + commissionOf(remainingRial, commissionPercentage),
  )

  const limits: { capacity: number; message: string }[] =
    mode === BAROOK_AMOUNT_MODE.GATEWAY
      ? [
          {
            capacity: remainingGrossToman,
            message: BAROOK_VALIDATION_MESSAGE.ORDER(
              formatPrice(remainingGrossToman),
            ),
          },
        ]
      : [
          {
            capacity: remainingNetToman,
            message: BAROOK_VALIDATION_MESSAGE.ORDER(
              formatPrice(remainingNetToman),
            ),
          },
        ]

  if (remoteCreditRial != null) {
    const creditCapacityToman =
      mode === BAROOK_AMOUNT_MODE.GATEWAY
        ? rialToTomanTrunc(remoteCreditRial)
        : rialToTomanTrunc(
            largestAffordablePrincipal(remoteCreditRial, commissionPercentage),
          )

    limits.push({
      capacity: creditCapacityToman,
      message: BAROOK_VALIDATION_MESSAGE.CREDIT(
        formatPrice(creditCapacityToman),
      ),
    })
  }

  return pickTighterError(inputToman, limits)
}

export const calculateBarookAmount = (
  params: BarookCalculatorParams,
): BarookCalculatorResult => {
  const {
    mode,
    inputToman,
    commissionPercentage,
    pendingAmountRial,
    walletBalanceRial,
    maxAffordablePrincipalRial,
    remoteCreditRial,
  } = params

  const hasWallet = walletBalanceRial > 0
  const walletPrincipalRial = capWalletPrincipal(
    resolveWalletPrincipal(
      walletBalanceRial,
      commissionPercentage,
      maxAffordablePrincipalRial,
    ),
    pendingAmountRial,
  )
  const isInputDisabled =
    pendingAmountRial > 0 && walletPrincipalRial >= pendingAmountRial
  const isEmpty = isInputDisabled || isEmptyInput(inputToman)
  const remainingRial = Math.max(0, pendingAmountRial - walletPrincipalRial)

  let creditPrincipalRial = 0

  if (!isEmpty && inputToman != null) {
    if (mode === BAROOK_AMOUNT_MODE.ORDER_DEDUCTION) {
      creditPrincipalRial = tomanToRial(inputToman)
    } else {
      creditPrincipalRial = largestAffordablePrincipal(
        tomanToRial(inputToman),
        commissionPercentage,
      )
    }

    let maxCreditRial = remainingRial
    if (remoteCreditRial != null) {
      maxCreditRial = Math.min(
        maxCreditRial,
        largestAffordablePrincipal(remoteCreditRial, commissionPercentage),
      )
    }
    creditPrincipalRial = Math.min(
      creditPrincipalRial,
      Math.max(0, maxCreditRial),
    )
    creditPrincipalRial = absorbUnpayableLeftover(
      creditPrincipalRial,
      remainingRial,
      maxCreditRial,
    )
  }

  const creditCommissionRial = commissionOf(
    creditPrincipalRial,
    commissionPercentage,
  )
  const creditGrossRial = creditPrincipalRial + creditCommissionRial
  const principalRial = walletPrincipalRial + creditPrincipalRial
  const commissionRial = commissionOf(principalRial, commissionPercentage)
  const grossRial = principalRial + commissionRial
  const localPrincipalRial = Math.min(principalRial, walletPrincipalRial)
  const localGrossRial =
    localPrincipalRial + commissionOf(localPrincipalRial, commissionPercentage)
  const providerGrossRial = Math.max(0, grossRial - localGrossRial)
  const remainingPayableRial = Math.max(0, pendingAmountRial - principalRial)

  const typedError =
    isEmpty || inputToman == null
      ? null
      : validateTypedAmount({
          mode,
          inputToman,
          remainingRial,
          commissionPercentage,
          remoteCreditRial,
        })

  const leftoverError = isIpgRemainderTooSmall(remainingPayableRial)
    ? BAROOK_VALIDATION_MESSAGE.IPG_REMAINDER(formatPrice(MIN_IPG_TOMAN))
    : null

  const validationError = typedError ?? leftoverError

  const canSubmit =
    validationError == null && principalRial >= 1 && (!isEmpty || hasWallet)

  return {
    isEmpty,
    isInputDisabled,
    principalRial,
    commissionRial,
    grossRial,
    localPrincipalRial,
    localGrossRial,
    providerGrossRial,
    creditPrincipalRial,
    creditCommissionRial,
    creditGrossRial,
    remainingPayableRial,
    validationError,
    canSubmit,
  }
}

export const parseTomanInput = (value: string) => {
  if (!value) return null

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return null

  return parsed
}
