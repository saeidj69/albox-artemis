import { describe, expect, test } from 'vitest'

import { PaymentSimplifiedPaymentMethod, PaymentWalletType } from '@/api/models'

import { getWalletPaymentMethod } from './get-wallet-payment-method'

describe('getWalletPaymentMethod', () => {
  test.each([
    [PaymentWalletType.ipg, PaymentSimplifiedPaymentMethod.ipg],
    [PaymentWalletType.pay_on_delivery, PaymentSimplifiedPaymentMethod.cod],
    [
      PaymentWalletType.pay_on_delivery_company,
      PaymentSimplifiedPaymentMethod.cod,
    ],
    [PaymentWalletType.pos, PaymentSimplifiedPaymentMethod.cod],
    [PaymentWalletType.credit, PaymentSimplifiedPaymentMethod.credit],
    [PaymentWalletType.gift, PaymentSimplifiedPaymentMethod.gift],
    [PaymentWalletType.barook, PaymentSimplifiedPaymentMethod.barook],
  ])('maps %s to %s', (walletType, method) => {
    expect(getWalletPaymentMethod(walletType)).toBe(method)
  })

  test.each([
    PaymentWalletType.credit_company,
    PaymentWalletType.barook_source,
    PaymentWalletType.company_commission,
  ])('returns undefined for %s', (walletType) => {
    expect(getWalletPaymentMethod(walletType)).toBeUndefined()
  })
})
