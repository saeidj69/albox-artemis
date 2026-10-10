'use client'

import { useMemo } from 'react'

import { useGetPaymentMethods } from '@/api/functions/payment-management'
import { PaymentPaymentMethod, PaymentWalletType } from '@/api/models'

import { useBasketCheckCall } from './use-basket-check-call'
import { useCheckoutData } from './use-checkout-data'

export function useCheckoutWallet() {
  const { data: paymentData, isLoading } = useGetPaymentMethods()
  const { data: basketData } = useBasketCheckCall()

  const { checkout, setWalletUsage } = useCheckoutData()

  const walletMethod = useMemo(
    () =>
      paymentData?.methods?.find(
        (m) => m.type.value === PaymentPaymentMethod.credit,
      ) ?? null,
    [paymentData],
  )

  const breakdown = walletMethod?.breakDown ?? []

  const totalAmount =
    walletMethod?.maxAvailableAmount ??
    breakdown.reduce((sum, item) => sum + item.amount, 0)

  const giftAmount =
    breakdown.find((i) => i.type.value === PaymentWalletType.gift)?.amount ?? 0

  const chargeAmount =
    breakdown.find((i) => i.type.value === PaymentWalletType.credit)?.amount ??
    0

  const basketTotal = basketData?.basket?.totalPrice ?? 0
  const hasBalance = totalAmount > 0 && walletMethod != null
  const isSufficient = totalAmount >= basketTotal
  const isEnabled = checkout.walletUsage && hasBalance
  const applied = isEnabled ? Math.min(totalAmount, basketTotal) : 0

  return {
    isLoading,
    hasBalance,
    totalAmount,
    giftAmount,
    chargeAmount,
    isEnabled,
    isSufficient,
    deductionAmount: applied,
    onToggle: setWalletUsage,
  }
}
