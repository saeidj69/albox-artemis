'use client'

import { useBasketCheckCall } from '@/modules/purchase/hooks'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

import PriceRow from './components/PriceRow'

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

type BasketPriceOverviewProps = {
  id?: string
}

const BasketPriceOverview = ({ id }: BasketPriceOverviewProps) => {
  const { data, isChecking } = useBasketCheckCall()
  const basket = data?.basket

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
      </div>
    )
  }

  const {
    totalProductsPriceWithoutDiscount,
    totalProductsDiscount,
    netDeliveryFee,
  } = basket

  const isShippingFree = netDeliveryFee === 0

  return (
    <div
      id={id}
      role="region"
      aria-label="جزئیات قیمت سبد خرید"
      data-slot="basket-price-overview"
      className="space-y-3"
    >
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
    </div>
  )
}

export default BasketPriceOverview
