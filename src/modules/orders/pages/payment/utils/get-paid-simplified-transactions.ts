import {
  PaymentTransactionStatus,
  PaymentWalletType,
  type PaymentSimplifiedTransaction,
} from '@/api/models'

export const getPaidSimplifiedTransactions = (
  transactions: PaymentSimplifiedTransaction[] | undefined,
): PaymentSimplifiedTransaction[] =>
  (transactions ?? []).filter(
    (transaction) =>
      transaction.status.value === PaymentTransactionStatus.paid &&
      transaction.destination.type.value !==
        PaymentWalletType.company_commission,
  )
