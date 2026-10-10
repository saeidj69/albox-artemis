import type { ComponentType } from 'react'

import { Card, CardPos, DocumentText, Gift, Wallet } from 'iconsax-reactjs'

import { PaymentSimplifiedPaymentMethod } from '@/api/models'

type MethodIcon = ComponentType<{ className?: string }>

const METHOD_ICONS: Record<PaymentSimplifiedPaymentMethod, MethodIcon> = {
  cod: CardPos,
  ipg: Card,
  credit: Wallet,
  gift: Gift,
  barook: Wallet,
}

export const getPaymentMethodIcon = (
  method?: PaymentSimplifiedPaymentMethod,
): MethodIcon => (method ? METHOD_ICONS[method] : undefined) ?? DocumentText
