import { describe, expect, test } from 'vitest'

import type { PaymentSimplifiedTransaction } from '@/api/models'
import { PaymentTransactionStatus, PaymentWalletType } from '@/api/models'

import { getPaidSimplifiedTransactions } from './get-paid-simplified-transactions'

const transaction = (
  overrides: Pick<PaymentSimplifiedTransaction, 'id' | 'amount' | 'status'> & {
    sourceType?: PaymentWalletType
    destinationType?: PaymentWalletType
  },
): PaymentSimplifiedTransaction =>
  ({
    id: overrides.id,
    amount: overrides.amount,
    status: overrides.status,
    source: {
      type: { value: overrides.sourceType ?? PaymentWalletType.pos },
    },
    destination: {
      type: {
        value: overrides.destinationType ?? PaymentWalletType.credit_company,
      },
    },
  }) as PaymentSimplifiedTransaction

describe('getPaidSimplifiedTransactions', () => {
  test('returns an empty array when the list is missing', () => {
    expect(getPaidSimplifiedTransactions(undefined)).toEqual([])
  })

  test('keeps paid customer transactions and drops pending and commission rows', () => {
    const paidCod = transaction({
      id: 'paid-cod',
      amount: 30_000_000,
      status: { value: PaymentTransactionStatus.paid, label: 'پرداخت شده' },
    })
    const pendingIpg = transaction({
      id: 'pending-ipg',
      amount: 69_800_000,
      status: {
        value: PaymentTransactionStatus.pending,
        label: 'در انتظار پرداخت',
      },
      sourceType: PaymentWalletType.ipg,
    })
    const paidCommission = transaction({
      id: 'paid-commission',
      amount: 50,
      status: { value: PaymentTransactionStatus.paid, label: 'پرداخت شده' },
      sourceType: PaymentWalletType.barook,
      destinationType: PaymentWalletType.company_commission,
    })

    expect(
      getPaidSimplifiedTransactions([paidCod, pendingIpg, paidCommission]),
    ).toEqual([paidCod])
  })
})
