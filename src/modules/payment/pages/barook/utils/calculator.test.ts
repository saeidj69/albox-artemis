import {
  BAROOK_AMOUNT_MODE,
  BAROOK_VALIDATION_MESSAGE,
  MIN_IPG_TOMAN,
} from '@/constants'
import { describe, expect, test } from 'vitest'

import { formatPrice } from '@/utils/numbers'

import {
  basisPoints,
  calculateBarookAmount,
  commissionOf,
  convertBarookAmountToman,
  initiatePrincipalRial,
  largestAffordablePrincipal,
  parseTomanInput,
  rialToTomanTrunc,
  sanitizeTomanAmount,
  suggestBarookPrincipalRial,
  suggestedAmountToman,
  tomanToRial,
  type BarookCalculatorParams,
} from './calculator'

const RATE = 5
const STANDARD = {
  mode: BAROOK_AMOUNT_MODE.ORDER_DEDUCTION,
  commissionPercentage: RATE,
  pendingAmountRial: tomanToRial(900_000_000),
  walletBalanceRial: tomanToRial(210_000_000),
  maxAffordablePrincipalRial: tomanToRial(200_000_000),
  remoteCreditRial: tomanToRial(850_000_000),
} as const satisfies Omit<BarookCalculatorParams, 'inputToman'>

const params = (
  overrides: Partial<BarookCalculatorParams> = {},
): BarookCalculatorParams => ({
  ...STANDARD,
  inputToman: null,
  ...overrides,
})

const ipgError = () =>
  BAROOK_VALIDATION_MESSAGE.IPG_REMAINDER(formatPrice(MIN_IPG_TOMAN))

const creditError = (maxToman: number) =>
  BAROOK_VALIDATION_MESSAGE.CREDIT(formatPrice(maxToman))

const orderError = (maxToman: number) =>
  BAROOK_VALIDATION_MESSAGE.ORDER(formatPrice(maxToman))

describe('rialToTomanTrunc', () => {
  test('floors 19_094_697 rials to 1_909_469 toman instead of rounding up', () => {
    expect(rialToTomanTrunc(19_094_697)).toBe(1_909_469)
  })
})

describe('basisPoints', () => {
  test('rounds 2.3% to 230, matching PHP BcMath rather than truncating to 229', () => {
    expect(basisPoints(2.3)).toBe(230)
    expect(basisPoints(1.15)).toBe(115)
    expect(basisPoints(2.05)).toBe(205)
  })

  test('keeps exact two-decimal rates unchanged', () => {
    expect(basisPoints(3.25)).toBe(325)
    expect(basisPoints(RATE)).toBe(500)
    expect(basisPoints(7.5)).toBe(750)
  })
})

describe('commissionOf', () => {
  test('floors 5% of 199 rials to 9, matching Jupiter', () => {
    expect(commissionOf(199, RATE)).toBe(9)
  })

  test('floors 3.25% of 999_999 rials to 32_499, matching Jupiter', () => {
    expect(commissionOf(999_999, 3.25)).toBe(32_499)
  })

  test('returns 0 for a 0 principal', () => {
    expect(commissionOf(0, RATE)).toBe(0)
  })
})

describe('largestAffordablePrincipal', () => {
  test('returns 0 for a non-positive balance', () => {
    expect(largestAffordablePrincipal(0, RATE)).toBe(0)
    expect(largestAffordablePrincipal(-1, RATE)).toBe(0)
  })

  test('fits 208 rials at 5% to principal 199', () => {
    expect(largestAffordablePrincipal(208, RATE)).toBe(199)
  })

  test('nudges 220_000 rials at 5% to 209_524, matching Jupiter', () => {
    expect(largestAffordablePrincipal(220_000, RATE)).toBe(209_524)
  })
})

describe('calculateBarookAmount', () => {
  test('TC-01 empty input uses the available wallet in either mode', () => {
    for (const mode of [
      BAROOK_AMOUNT_MODE.ORDER_DEDUCTION,
      BAROOK_AMOUNT_MODE.GATEWAY,
    ]) {
      const result = calculateBarookAmount(params({ mode, inputToman: null }))

      expect(result.isEmpty).toBe(true)
      expect(result.localGrossRial).toBe(tomanToRial(210_000_000))
      expect(result.localPrincipalRial).toBe(tomanToRial(200_000_000))
      expect(result.creditPrincipalRial).toBe(0)
      expect(result.providerGrossRial).toBe(0)
      expect(result.principalRial).toBe(tomanToRial(200_000_000))
      expect(result.canSubmit).toBe(true)
      expect(result.validationError).toBeNull()
    }
  })

  test('TC-02 empty input with no wallet balance disables submit', () => {
    const result = calculateBarookAmount(
      params({
        inputToman: null,
        walletBalanceRial: 0,
        maxAffordablePrincipalRial: 0,
      }),
    )

    expect(result.principalRial).toBe(0)
    expect(result.creditPrincipalRial).toBe(0)
    expect(result.providerGrossRial).toBe(0)
    expect(result.localGrossRial).toBe(0)
    expect(result.canSubmit).toBe(false)
  })

  test('TC-03 wallet exactly covers the order and disables the input', () => {
    const result = calculateBarookAmount(
      params({
        inputToman: null,
        pendingAmountRial: tomanToRial(200_000_000),
        maxAffordablePrincipalRial: tomanToRial(200_000_000),
      }),
    )

    expect(result.isInputDisabled).toBe(true)
    expect(result.isEmpty).toBe(true)
    expect(result.localGrossRial).toBe(tomanToRial(210_000_000))
    expect(result.principalRial).toBe(tomanToRial(200_000_000))
    expect(result.remainingPayableRial).toBe(0)
    expect(result.providerGrossRial).toBe(0)
    expect(result.canSubmit).toBe(true)
  })

  test('TC-04 wallet exceeding the order consumes only what the order needs', () => {
    const result = calculateBarookAmount(
      params({
        inputToman: null,
        pendingAmountRial: tomanToRial(100_000_000),
        maxAffordablePrincipalRial: tomanToRial(200_000_000),
      }),
    )

    expect(result.isInputDisabled).toBe(true)
    expect(result.localGrossRial).toBe(tomanToRial(105_000_000))
    expect(result.principalRial).toBe(tomanToRial(100_000_000))
    expect(result.remainingPayableRial).toBe(0)
    expect(result.providerGrossRial).toBe(0)
  })

  test('TC-05 valid net credit is added on top of the wallet', () => {
    const result = calculateBarookAmount(params({ inputToman: 80_000_000 }))

    expect(result.creditPrincipalRial).toBe(tomanToRial(80_000_000))
    expect(result.creditCommissionRial).toBe(tomanToRial(4_000_000))
    expect(result.creditGrossRial).toBe(tomanToRial(84_000_000))
    expect(result.localPrincipalRial).toBe(tomanToRial(200_000_000))
    expect(result.principalRial).toBe(tomanToRial(280_000_000))
    expect(result.remainingPayableRial).toBe(tomanToRial(620_000_000))
    expect(result.canSubmit).toBe(true)
  })

  test('TC-06 valid net credit with no wallet uses credit only', () => {
    const result = calculateBarookAmount(
      params({
        inputToman: 80_000_000,
        walletBalanceRial: 0,
        maxAffordablePrincipalRial: 0,
      }),
    )

    expect(result.principalRial).toBe(tomanToRial(80_000_000))
    expect(result.creditCommissionRial).toBe(tomanToRial(4_000_000))
    expect(result.creditGrossRial).toBe(tomanToRial(84_000_000))
    expect(result.localPrincipalRial).toBe(0)
  })

  test('TC-07 net amount exactly consumes the credit limit', () => {
    const result = calculateBarookAmount(
      params({
        inputToman: 100_000_000,
        pendingAmountRial: tomanToRial(500_000_000),
        walletBalanceRial: 0,
        maxAffordablePrincipalRial: 0,
        remoteCreditRial: tomanToRial(105_000_000),
      }),
    )

    expect(result.creditCommissionRial).toBe(tomanToRial(5_000_000))
    expect(result.creditGrossRial).toBe(tomanToRial(105_000_000))
    expect(result.canSubmit).toBe(true)
    expect(result.validationError).toBeNull()
  })

  test('TC-08 net plus commission exceeding credit is rejected', () => {
    const creditNetToman = toTomanPriceOfAffordable(104_999_999)
    const result = calculateBarookAmount(
      params({
        inputToman: 100_000_000,
        pendingAmountRial: tomanToRial(500_000_000),
        walletBalanceRial: 0,
        maxAffordablePrincipalRial: 0,
        remoteCreditRial: tomanToRial(104_999_999),
      }),
    )

    expect(result.validationError).toBe(creditError(creditNetToman))
    expect(result.canSubmit).toBe(false)
  })

  test('TC-09 net amount exceeding the remaining order is rejected', () => {
    const result = calculateBarookAmount(
      params({
        inputToman: 50_000_001,
        pendingAmountRial: tomanToRial(250_000_000),
      }),
    )

    expect(result.validationError).toBe(orderError(50_000_000))
    expect(result.canSubmit).toBe(false)
  })

  test('TC-10 net amount exactly covering the remaining order is accepted', () => {
    const result = calculateBarookAmount(
      params({
        inputToman: 50_000_000,
        pendingAmountRial: tomanToRial(250_000_000),
      }),
    )

    expect(result.creditCommissionRial).toBe(tomanToRial(2_500_000))
    expect(result.creditGrossRial).toBe(tomanToRial(52_500_000))
    expect(result.principalRial).toBe(tomanToRial(250_000_000))
    expect(result.remainingPayableRial).toBe(0)
    expect(result.canSubmit).toBe(true)
  })

  test('TC-11 exceeding both limits shows only the tighter credit max', () => {
    const result = calculateBarookAmount(
      params({
        inputToman: 60_000_000,
        pendingAmountRial: tomanToRial(250_000_000),
        remoteCreditRial: tomanToRial(31_500_000),
      }),
    )

    expect(result.validationError).toBe(creditError(30_000_000))
    expect(result.canSubmit).toBe(false)
  })

  test('TC-12 explicit zero in net mode keeps the wallet-only result', () => {
    const result = calculateBarookAmount(params({ inputToman: 0 }))

    expect(result.isEmpty).toBe(true)
    expect(result.principalRial).toBe(tomanToRial(200_000_000))
    expect(result.creditPrincipalRial).toBe(0)
    expect(result.canSubmit).toBe(true)
    expect(result.validationError).toBeNull()
  })

  test('TC-13 valid gross gateway amount is added on top of the wallet', () => {
    const result = calculateBarookAmount(
      params({
        mode: BAROOK_AMOUNT_MODE.GATEWAY,
        inputToman: 105_000_000,
      }),
    )

    expect(result.creditGrossRial).toBe(tomanToRial(105_000_000))
    expect(result.creditCommissionRial).toBe(tomanToRial(5_000_000))
    expect(result.creditPrincipalRial).toBe(tomanToRial(100_000_000))
    expect(result.localPrincipalRial).toBe(tomanToRial(200_000_000))
    expect(result.principalRial).toBe(tomanToRial(300_000_000))
    expect(result.remainingPayableRial).toBe(tomanToRial(600_000_000))
    expect(result.canSubmit).toBe(true)
  })

  test('TC-14 gross gateway amount exactly equals the credit limit', () => {
    const result = calculateBarookAmount(
      params({
        mode: BAROOK_AMOUNT_MODE.GATEWAY,
        inputToman: 105_000_000,
        pendingAmountRial: tomanToRial(500_000_000),
        walletBalanceRial: 0,
        maxAffordablePrincipalRial: 0,
        remoteCreditRial: tomanToRial(105_000_000),
      }),
    )

    expect(result.creditPrincipalRial).toBe(tomanToRial(100_000_000))
    expect(result.creditCommissionRial).toBe(tomanToRial(5_000_000))
    expect(result.creditGrossRial).toBe(tomanToRial(105_000_000))
    expect(result.canSubmit).toBe(true)
  })

  test('TC-15 gross gateway amount exceeding credit by one unit is rejected', () => {
    const result = calculateBarookAmount(
      params({
        mode: BAROOK_AMOUNT_MODE.GATEWAY,
        inputToman: 105_000_001,
        pendingAmountRial: tomanToRial(500_000_000),
        walletBalanceRial: 0,
        maxAffordablePrincipalRial: 0,
        remoteCreditRial: tomanToRial(105_000_000),
      }),
    )

    expect(result.validationError).toBe(creditError(105_000_000))
    expect(result.canSubmit).toBe(false)
  })

  test('TC-16 gross amount that would exceed the remaining order is rejected', () => {
    const result = calculateBarookAmount(
      params({
        mode: BAROOK_AMOUNT_MODE.GATEWAY,
        inputToman: 52_500_001,
        pendingAmountRial: tomanToRial(250_000_000),
      }),
    )

    expect(result.validationError).toBe(orderError(52_500_000))
    expect(result.canSubmit).toBe(false)
  })

  test('TC-17 gross amount exactly covering the remaining order is accepted', () => {
    const result = calculateBarookAmount(
      params({
        mode: BAROOK_AMOUNT_MODE.GATEWAY,
        inputToman: 52_500_000,
        pendingAmountRial: tomanToRial(250_000_000),
      }),
    )

    expect(result.creditPrincipalRial).toBe(tomanToRial(50_000_000))
    expect(result.creditCommissionRial).toBe(tomanToRial(2_500_000))
    expect(result.principalRial).toBe(tomanToRial(250_000_000))
    expect(result.remainingPayableRial).toBe(0)
    expect(result.canSubmit).toBe(true)
  })

  test('TC-18 explicit zero in gateway mode keeps the wallet-only result', () => {
    const result = calculateBarookAmount(
      params({
        mode: BAROOK_AMOUNT_MODE.GATEWAY,
        inputToman: 0,
      }),
    )

    expect(result.isEmpty).toBe(true)
    expect(result.creditPrincipalRial).toBe(0)
    expect(result.creditCommissionRial).toBe(0)
    expect(result.principalRial).toBe(tomanToRial(200_000_000))
    expect(result.canSubmit).toBe(true)
  })

  test('rejects a leftover below MIN_IPG even when credit allows the typed amount', () => {
    const result = calculateBarookAmount(
      params({
        inputToman: 45_000,
        pendingAmountRial: tomanToRial(50_000),
        walletBalanceRial: 0,
        maxAffordablePrincipalRial: 0,
        remoteCreditRial: tomanToRial(45_000),
        commissionPercentage: 0,
      }),
    )

    expect(result.remainingPayableRial).toBe(tomanToRial(5_000))
    expect(result.validationError).toBe(ipgError())
    expect(result.canSubmit).toBe(false)
  })

  test('accepts a leftover of exactly MIN_IPG', () => {
    const result = calculateBarookAmount(
      params({
        inputToman: 40_000,
        pendingAmountRial: tomanToRial(50_000),
        walletBalanceRial: 0,
        maxAffordablePrincipalRial: 0,
        remoteCreditRial: tomanToRial(45_000),
        commissionPercentage: 0,
      }),
    )

    expect(result.remainingPayableRial).toBe(tomanToRial(MIN_IPG_TOMAN))
    expect(result.validationError).toBeNull()
    expect(result.canSubmit).toBe(true)
  })

  test('accepts covering the remaining order in full', () => {
    const result = calculateBarookAmount(
      params({
        inputToman: 50_000,
        pendingAmountRial: tomanToRial(50_000),
        walletBalanceRial: 0,
        maxAffordablePrincipalRial: 0,
        remoteCreditRial: tomanToRial(50_000),
        commissionPercentage: 0,
      }),
    )

    expect(result.remainingPayableRial).toBe(0)
    expect(result.validationError).toBeNull()
    expect(result.canSubmit).toBe(true)
  })

  test('rejects wallet-only when leftover after wallet is below MIN_IPG', () => {
    const result = calculateBarookAmount(
      params({
        inputToman: null,
        pendingAmountRial: tomanToRial(15_000),
        walletBalanceRial: tomanToRial(10_000),
        maxAffordablePrincipalRial: tomanToRial(10_000),
        remoteCreditRial: 0,
      }),
    )

    expect(result.isEmpty).toBe(true)
    expect(result.remainingPayableRial).toBe(tomanToRial(5_000))
    expect(result.validationError).toBe(ipgError())
    expect(result.canSubmit).toBe(false)
  })

  test('keeps the order-max error when the typed amount exceeds remaining', () => {
    const result = calculateBarookAmount(
      params({
        inputToman: 51_000,
        pendingAmountRial: tomanToRial(50_000),
        walletBalanceRial: 0,
        maxAffordablePrincipalRial: 0,
        remoteCreditRial: tomanToRial(80_000),
        commissionPercentage: 0,
      }),
    )

    expect(result.validationError).toBe(orderError(50_000))
    expect(result.canSubmit).toBe(false)
  })

  test('does not send 1 rial more than a 1009-rial remaining cap', () => {
    expect(
      suggestedAmountToman(1009, BAROOK_AMOUNT_MODE.ORDER_DEDUCTION, 0),
    ).toBe(100)

    const roundedUp = calculateBarookAmount(
      params({
        inputToman: 101,
        pendingAmountRial: 1009,
        walletBalanceRial: 0,
        maxAffordablePrincipalRial: 0,
        remoteCreditRial: 5000,
        commissionPercentage: 0,
      }),
    )

    expect(roundedUp.creditPrincipalRial).toBeLessThanOrEqual(1009)
    expect(roundedUp.principalRial).toBeLessThanOrEqual(1009)
    expect(
      initiatePrincipalRial(roundedUp.principalRial, 1009),
    ).toBeLessThanOrEqual(1009)
    expect(roundedUp.principalRial).not.toBe(1010)
    expect(roundedUp.validationError).toBe(orderError(100))
    expect(roundedUp.canSubmit).toBe(false)

    const truncated = calculateBarookAmount(
      params({
        inputToman: 100,
        pendingAmountRial: 1009,
        walletBalanceRial: 0,
        maxAffordablePrincipalRial: 0,
        remoteCreditRial: 1009,
        commissionPercentage: 0,
      }),
    )

    expect(truncated.principalRial).toBe(1009)
    expect(truncated.remainingPayableRial).toBe(0)
    expect(truncated.validationError).toBeNull()
  })

  test('caps typed net credit to the rial-accurate remaining and credit max', () => {
    const result = calculateBarookAmount(
      params({
        inputToman: 101,
        pendingAmountRial: 5000,
        walletBalanceRial: 0,
        maxAffordablePrincipalRial: 0,
        remoteCreditRial: 1009,
        commissionPercentage: 0,
      }),
    )

    expect(result.creditPrincipalRial).toBe(1009)
    expect(result.principalRial).toBe(1009)
    expect(result.validationError).toBe(creditError(100))
    expect(result.canSubmit).toBe(false)
  })

  test('keeps a GATEWAY round-trip at or below Jupiter largestAffordablePrincipal', () => {
    const remainingRial = 1009
    const suggestedToman = suggestedAmountToman(
      remainingRial,
      BAROOK_AMOUNT_MODE.GATEWAY,
      RATE,
    )
    const result = calculateBarookAmount(
      params({
        mode: BAROOK_AMOUNT_MODE.GATEWAY,
        inputToman: suggestedToman,
        pendingAmountRial: remainingRial,
        walletBalanceRial: 0,
        maxAffordablePrincipalRial: 0,
        remoteCreditRial: remainingRial + commissionOf(remainingRial, RATE),
      }),
    )

    expect(suggestedToman).toBe(
      rialToTomanTrunc(remainingRial + commissionOf(remainingRial, RATE)),
    )
    expect(result.creditPrincipalRial).toBeLessThanOrEqual(
      largestAffordablePrincipal(
        remainingRial + commissionOf(remainingRial, RATE),
        RATE,
      ),
    )
    expect(result.principalRial).toBe(remainingRial)
    expect(result.remainingPayableRial).toBe(0)
    expect(result.validationError).toBeNull()
  })

  test('covers remaining when GATEWAY toman dust would leave a MIN_IPG stub', () => {
    const remainingRial = 19_094_710
    const rate = 2

    for (const inputToman of [1_947_660, 1_947_659]) {
      const result = calculateBarookAmount(
        params({
          mode: BAROOK_AMOUNT_MODE.GATEWAY,
          inputToman,
          commissionPercentage: rate,
          pendingAmountRial: remainingRial,
          walletBalanceRial: 0,
          maxAffordablePrincipalRial: 0,
          remoteCreditRial: remainingRial + commissionOf(remainingRial, rate),
        }),
      )

      expect(result.principalRial).toBe(remainingRial)
      expect(result.remainingPayableRial).toBe(0)
      expect(result.validationError).toBeNull()
      expect(result.canSubmit).toBe(true)
      expect(initiatePrincipalRial(result.principalRial, remainingRial)).toBe(
        remainingRial,
      )
    }
  })

  test('still rejects a leftover of several thousand toman below MIN_IPG', () => {
    const result = calculateBarookAmount(
      params({
        mode: BAROOK_AMOUNT_MODE.GATEWAY,
        inputToman: 45_000,
        pendingAmountRial: tomanToRial(50_000),
        walletBalanceRial: 0,
        maxAffordablePrincipalRial: 0,
        remoteCreditRial: tomanToRial(80_000),
        commissionPercentage: 0,
      }),
    )

    expect(result.remainingPayableRial).toBe(tomanToRial(5_000))
    expect(result.validationError).toBe(ipgError())
    expect(result.canSubmit).toBe(false)
  })
})

describe('suggestBarookPrincipalRial', () => {
  test('returns remaining when credit can cover it in full', () => {
    expect(
      suggestBarookPrincipalRial({
        remainingRial: tomanToRial(50_000),
        remoteCreditRial: tomanToRial(80_000),
        commissionPercentage: 0,
      }),
    ).toBe(tomanToRial(50_000))
  })

  test('returns credit when leftover is at least MIN_IPG', () => {
    expect(
      suggestBarookPrincipalRial({
        remainingRial: tomanToRial(50_000),
        remoteCreditRial: tomanToRial(40_000),
        commissionPercentage: 0,
      }),
    ).toBe(tomanToRial(40_000))
  })

  test('returns null when leftover would be below MIN_IPG', () => {
    expect(
      suggestBarookPrincipalRial({
        remainingRial: tomanToRial(50_000),
        remoteCreditRial: tomanToRial(45_000),
        commissionPercentage: 0,
      }),
    ).toBeNull()
  })

  test('returns null when credit is missing or zero', () => {
    expect(
      suggestBarookPrincipalRial({
        remainingRial: tomanToRial(50_000),
        remoteCreditRial: null,
        commissionPercentage: 0,
      }),
    ).toBeNull()
    expect(
      suggestBarookPrincipalRial({
        remainingRial: tomanToRial(50_000),
        remoteCreditRial: 0,
        commissionPercentage: 0,
      }),
    ).toBeNull()
  })
})

describe('suggestedAmountToman', () => {
  test('uses net principal in order-deduction mode', () => {
    expect(
      suggestedAmountToman(
        tomanToRial(100_000_000),
        BAROOK_AMOUNT_MODE.ORDER_DEDUCTION,
        RATE,
      ),
    ).toBe(100_000_000)
  })

  test('adds commission in gateway mode', () => {
    expect(
      suggestedAmountToman(
        tomanToRial(100_000_000),
        BAROOK_AMOUNT_MODE.GATEWAY,
        RATE,
      ),
    ).toBe(105_000_000)
  })

  test('floors a remainder-9 principal so prefill cannot round up by 1 rial', () => {
    expect(
      suggestedAmountToman(1009, BAROOK_AMOUNT_MODE.ORDER_DEDUCTION, 0),
    ).toBe(100)
    expect(suggestedAmountToman(1009, BAROOK_AMOUNT_MODE.GATEWAY, 0)).toBe(100)
  })
})

describe('convertBarookAmountToman', () => {
  test('TC-19 converts net 100,000,000 to gross 105,000,000', () => {
    expect(
      convertBarookAmountToman(
        100_000_000,
        BAROOK_AMOUNT_MODE.ORDER_DEDUCTION,
        BAROOK_AMOUNT_MODE.GATEWAY,
        RATE,
      ),
    ).toBe(105_000_000)
  })

  test('TC-19 converts gross 105,000,000 back to net 100,000,000', () => {
    expect(
      convertBarookAmountToman(
        105_000_000,
        BAROOK_AMOUNT_MODE.GATEWAY,
        BAROOK_AMOUNT_MODE.ORDER_DEDUCTION,
        RATE,
      ),
    ).toBe(100_000_000)
  })
})

describe('sanitizeTomanAmount', () => {
  test('TC-20 rejects a negative amount instead of coercing it', () => {
    expect(sanitizeTomanAmount('-1,000,000')).toBeNull()
    expect(sanitizeTomanAmount('−1000000')).toBeNull()
  })

  test('TC-21 strips non-numeric characters', () => {
    expect(sanitizeTomanAmount('abc80x000')).toBe('80000')
  })

  test('TC-22 Persian digits produce the same digits as Latin', () => {
    expect(sanitizeTomanAmount('۸۰۰۰۰۰۰۰')).toBe('80000000')
    expect(sanitizeTomanAmount('80000000')).toBe('80000000')
  })

  test('TC-23 trims whitespace and group separators', () => {
    expect(sanitizeTomanAmount(' 100,000,000 ')).toBe('100000000')
  })

  test('TC-24 truncates a decimal fraction instead of concatenating it', () => {
    expect(sanitizeTomanAmount('100.5')).toBe('100')
    expect(sanitizeTomanAmount('100٫5')).toBe('100')
  })
})

describe('initiatePrincipalRial', () => {
  test('returns the calculated principal when it is below the order remaining', () => {
    const calculated = tomanToRial(280_000_000)
    const order = tomanToRial(900_000_000)

    expect(initiatePrincipalRial(calculated, order)).toBe(calculated)
  })

  test('clamps the calculated principal to the order remaining in rial', () => {
    const calculated = tomanToRial(400_000_000)
    const order = tomanToRial(300_000_000)

    expect(initiatePrincipalRial(calculated, order)).toBe(order)
    expect(initiatePrincipalRial(calculated, order)).toBe(3_000_000_000)
  })

  test('treats non-positive values as zero', () => {
    expect(initiatePrincipalRial(-10, tomanToRial(100))).toBe(0)
    expect(initiatePrincipalRial(tomanToRial(100), -10)).toBe(0)
    expect(initiatePrincipalRial(-10, -20)).toBe(0)
  })
})

describe('parseTomanInput', () => {
  test('treats empty and non-positive values as missing', () => {
    expect(parseTomanInput('')).toBeNull()
    expect(parseTomanInput('0')).toBeNull()
    expect(parseTomanInput('-1')).toBeNull()
  })

  test('parses a positive toman amount', () => {
    expect(parseTomanInput('80000000')).toBe(80_000_000)
  })
})

function toTomanPriceOfAffordable(creditToman: number) {
  return rialToTomanTrunc(
    largestAffordablePrincipal(tomanToRial(creditToman), RATE),
  )
}
