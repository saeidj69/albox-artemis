'use client'

import { useBasketCheckCall, useCheckoutWallet } from '@/modules/purchase/hooks'
import PriceRow from '@/modules/purchase/pages/basket/components/BasketFooter/components/BasketPriceOverview/components/PriceRow'

import { formatPrice, persianDigits, toTomanPrice } from '@/utils/numbers'

const TomanValue = ({
  amount,
  amountClassName,
}: {
  amount: number
  amountClassName?: string
}) => (
  <span dir="rtl" className="typo-body-medium text-text-primary">
    <span className={amountClassName}>{formatPrice(toTomanPrice(amount))}</span>
    <span className="typo-body-small text-text-secondary"> تومان</span>
  </span>
)

type CheckoutPriceOverviewProps = {
  id?: string
}

const CheckoutPriceOverview = ({ id }: CheckoutPriceOverviewProps) => {
  const { data, isChecking } = useBasketCheckCall()
  const { deductionAmount } = useCheckoutWallet()
  const basket = data?.basket

  const cartonCount = !basket
    ? 0
    : basket.products
        .filter((product) => product.status === 'ok')
        .reduce((sum, product) => sum + product.quantity, 0)

  if (!basket || isChecking) {
    return (
      <div
        id={id}
        role="region"
        aria-label="جزئیات قیمت سبد خرید"
        className="space-y-3"
      >
        <PriceRow.Skeleton />
        <PriceRow.Skeleton />
        <PriceRow.Skeleton />
        <PriceRow.Skeleton />
      </div>
    )
  }

  const {
    totalProductsPriceWithoutDiscount,
    totalProductsDiscount,
    totalCashbackAmount,
    netDeliveryFee,
  } = basket

  const isShippingFree = netDeliveryFee === 0

  return (
    <div
      id={id}
      role="region"
      aria-label="جزئیات قیمت سبد خرید"
      data-slot="checkout-price-overview"
      className="space-y-3"
    >
      {cartonCount > 0 && (
        <PriceRow
          label="تعداد کارتن:"
          value={
            <span className="typo-label-medium text-text-primary">
              {persianDigits(cartonCount)} کارتن
            </span>
          }
        />
      )}

      <PriceRow
        label="مجموع قیمت محصولات:"
        value={<TomanValue amount={totalProductsPriceWithoutDiscount} />}
      />

      <PriceRow
        label="تخفیف محصولات:"
        value={
          <TomanValue
            amount={totalProductsDiscount}
            amountClassName={
              totalProductsDiscount > 0 ? 'text-success-main' : undefined
            }
          />
        }
      />

      <PriceRow
        label="بازگشت اعتبار:"
        value={
          <TomanValue
            amount={totalCashbackAmount}
            amountClassName={
              totalCashbackAmount > 0 ? 'text-primary-600' : undefined
            }
          />
        }
      />

      {netDeliveryFee !== null && (
        <PriceRow
          label="هزینه ارسال:"
          value={
            isShippingFree ? (
              <span className="typo-body-medium text-text-secondary">
                رایگان
              </span>
            ) : (
              <TomanValue amount={netDeliveryFee} />
            )
          }
        />
      )}

      {deductionAmount > 0 && (
        <PriceRow
          label="برداشت از کیف پول:"
          value={
            <TomanValue
              amount={deductionAmount}
              amountClassName="text-primary-600"
            />
          }
        />
      )}
    </div>
  )
}

export default CheckoutPriceOverview
