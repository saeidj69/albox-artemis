import { Card, CardPos, DocumentText, Gift, Wallet } from 'iconsax-reactjs'
import { describe, expect, test } from 'vitest'

import { PaymentSimplifiedPaymentMethod } from '@/api/models'

import { getPaymentMethodIcon } from './get-payment-method-icon'

describe('getPaymentMethodIcon', () => {
  test.each([
    [PaymentSimplifiedPaymentMethod.cod, CardPos],
    [PaymentSimplifiedPaymentMethod.ipg, Card],
    [PaymentSimplifiedPaymentMethod.credit, Wallet],
    [PaymentSimplifiedPaymentMethod.gift, Gift],
    [PaymentSimplifiedPaymentMethod.barook, Wallet],
  ])('maps %s to its icon', (method, icon) => {
    expect(getPaymentMethodIcon(method)).toBe(icon)
  })

  test('falls back to DocumentText for an unknown method', () => {
    expect(
      getPaymentMethodIcon('unknown' as PaymentSimplifiedPaymentMethod),
    ).toBe(DocumentText)
  })

  test('falls back to DocumentText when the method is missing', () => {
    expect(getPaymentMethodIcon()).toBe(DocumentText)
  })
})
