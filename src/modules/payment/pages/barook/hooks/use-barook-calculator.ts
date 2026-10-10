import { useEffect, useMemo, useRef, useState } from 'react'

import {
  BAROOK_AMOUNT_MODE,
  PAYMENT_REFERENCE_ENTITY,
  type BarookAmountMode,
} from '@/constants'
import { EVENTS, track } from '@/helpers/analytics'

import { EXPERIMENTS } from '@/modules/experiments/constants/experiments'
import { useExperiment } from '@/modules/experiments/hooks/useExperiment'

import { useGetBarookWallet } from '@/api/functions/barook'
import { useLatestPaymentByReference } from '@/api/functions/payment-management'
import type { PaymentBarookWalletDetails } from '@/api/models'
import { getErrorMessageFromErrorResponse } from '@/api/mutator/utils/error-message'

import { BAROOK_PAGE_COPY } from '../constants'
import {
  calculateBarookAmount,
  capWalletPrincipal,
  parseTomanInput,
  resolveWalletPrincipal,
  suggestBarookPrincipalRial,
  suggestedAmountToman,
  tomanToRial,
} from '../utils/calculator'

type UseBarookCalculatorResult = {
  mode: BarookAmountMode
  amount: string
  setAmount: (value: string) => void
  pendingAmountRial: number
  wallet: PaymentBarookWalletDetails | undefined
  walletPrincipalRial: number
  hasWalletBalance: boolean
  isInputDisabled: boolean
  typedAmountRial: number | null
  result: ReturnType<typeof calculateBarookAmount>
  isLoading: boolean
  pageError: string | null
}

export const useBarookCalculator = (
  orderId: number,
): UseBarookCalculatorResult => {
  const variant = useExperiment(EXPERIMENTS.BAROOK_SUGGESTED_AMOUNT)
  const mode = variant?.payload?.mode ?? BAROOK_AMOUNT_MODE.GATEWAY
  const trackedVariantKeyRef = useRef<string | null>(null)

  const [amount, setAmount] = useState('')
  const didPrefillRef = useRef(false)

  useEffect(() => {
    if (!variant || trackedVariantKeyRef.current === variant.key) return

    trackedVariantKeyRef.current = variant.key

    switch (variant.key) {
      case 'gateway':
        track(EVENTS.BAROOK_AVAILABLE_CREDIT, {
          plausible: true,
          clarity: true,
        })
        break

      case 'order_deduction':
        track(EVENTS.BAROOK_NET_PAYMENT, {
          plausible: true,
          clarity: true,
        })
        break
    }
  }, [variant])

  const isValidOrderId = Number.isInteger(orderId) && orderId > 0

  const paymentQuery = useLatestPaymentByReference(
    PAYMENT_REFERENCE_ENTITY.ORDER,
    isValidOrderId ? orderId : 0,
    {
      query: {
        enabled: isValidOrderId,
      },
    },
  )
  const pendingAmountRial = paymentQuery.data?.payment.pendingAmount ?? 0

  const walletQuery = useGetBarookWallet(
    { outstandingAmount: pendingAmountRial },
    {
      query: {
        enabled: isValidOrderId && pendingAmountRial > 0,
        retry: false,
      },
      request: { skipErrorToast: true },
    },
  )

  const wallet = walletQuery.data
  const commissionPercentage = wallet?.commissionPercentage ?? 0

  const walletPrincipalRial = useMemo(
    () =>
      capWalletPrincipal(
        resolveWalletPrincipal(
          wallet?.balance ?? 0,
          commissionPercentage,
          wallet?.maxAffordablePrincipal ?? null,
        ),
        pendingAmountRial,
      ),
    [commissionPercentage, pendingAmountRial, wallet],
  )

  const isInputDisabled =
    pendingAmountRial > 0 && walletPrincipalRial >= pendingAmountRial

  const inputToman = isInputDisabled ? null : parseTomanInput(amount)

  const result = useMemo(
    () =>
      calculateBarookAmount({
        mode,
        inputToman,
        commissionPercentage,
        pendingAmountRial,
        walletBalanceRial: wallet?.balance ?? 0,
        maxAffordablePrincipalRial: wallet?.maxAffordablePrincipal ?? null,
        remoteCreditRial: wallet?.remote?.expendableCreditAmount ?? null,
      }),
    [commissionPercentage, inputToman, mode, pendingAmountRial, wallet],
  )

  const isPaymentReady = !paymentQuery.isLoading && !paymentQuery.isError

  const pageError = (() => {
    if (!isValidOrderId) {
      return BAROOK_PAGE_COPY.notPayable
    }
    if (paymentQuery.isLoading) return null
    if (paymentQuery.isError || !paymentQuery.data?.payment) {
      return BAROOK_PAGE_COPY.notPayable
    }
    if (pendingAmountRial <= 0) {
      return BAROOK_PAGE_COPY.notPayable
    }
    if (walletQuery.isLoading) return null
    if (walletQuery.isError) {
      return getErrorMessageFromErrorResponse(
        walletQuery.error?.response?.data,
        BAROOK_PAGE_COPY.walletUnavailable,
      )
    }
    if (wallet && !wallet.enabled) {
      return BAROOK_PAGE_COPY.walletDisabled
    }
    return null
  })()

  const isLoading =
    !variant ||
    (isValidOrderId &&
      (paymentQuery.isLoading ||
        (isPaymentReady && pendingAmountRial > 0 && walletQuery.isLoading)))

  useEffect(() => {
    if (didPrefillRef.current || isInputDisabled || isLoading || pageError) {
      return
    }
    if (!wallet || pendingAmountRial <= 0) return

    if (amount !== '') {
      didPrefillRef.current = true
      return
    }

    const remainingRial = Math.max(0, pendingAmountRial - walletPrincipalRial)
    const suggestedPrincipalRial = suggestBarookPrincipalRial({
      remainingRial,
      remoteCreditRial: wallet.remote?.expendableCreditAmount ?? null,
      commissionPercentage,
    })

    didPrefillRef.current = true

    if (suggestedPrincipalRial == null) return

    const suggestedToman = suggestedAmountToman(
      suggestedPrincipalRial,
      mode,
      commissionPercentage,
    )

    if (suggestedToman <= 0) return

    // One-shot prefill after wallet/payment load; do not overwrite a typed amount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAmount(String(suggestedToman))
  }, [
    amount,
    commissionPercentage,
    isInputDisabled,
    isLoading,
    mode,
    pageError,
    pendingAmountRial,
    wallet,
    walletPrincipalRial,
  ])

  return {
    mode,
    amount: isInputDisabled ? '' : amount,
    setAmount,
    pendingAmountRial,
    wallet,
    walletPrincipalRial,
    hasWalletBalance: (wallet?.balance ?? 0) > 0,
    isInputDisabled,
    typedAmountRial: inputToman == null ? null : tomanToRial(inputToman),
    result,
    isLoading,
    pageError,
  }
}
