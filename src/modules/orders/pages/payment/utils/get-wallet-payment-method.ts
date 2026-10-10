import { PaymentSimplifiedPaymentMethod, PaymentWalletType } from '@/api/models'

const WALLET_PAYMENT_METHODS: Partial<
  Record<PaymentWalletType, PaymentSimplifiedPaymentMethod>
> = {
  [PaymentWalletType.ipg]: PaymentSimplifiedPaymentMethod.ipg,
  [PaymentWalletType.pay_on_delivery]: PaymentSimplifiedPaymentMethod.cod,
  [PaymentWalletType.pay_on_delivery_company]:
    PaymentSimplifiedPaymentMethod.cod,
  [PaymentWalletType.pos]: PaymentSimplifiedPaymentMethod.cod,
  [PaymentWalletType.credit]: PaymentSimplifiedPaymentMethod.credit,
  [PaymentWalletType.gift]: PaymentSimplifiedPaymentMethod.gift,
  [PaymentWalletType.barook]: PaymentSimplifiedPaymentMethod.barook,
}

export const getWalletPaymentMethod = (
  walletType: PaymentWalletType,
): PaymentSimplifiedPaymentMethod | undefined =>
  WALLET_PAYMENT_METHODS[walletType]
