'use client'

import { useBasket } from '@/modules/purchase/hooks'

import FlipDigits from '@/lib/FlipDigits'

const BasketTitle = () => {
  const { totalQuantity } = useBasket()

  if (totalQuantity > 0) {
    return (
      <div>
        <span>سبد خرید</span>
        <span>{' ('}</span>
        <FlipDigits value={totalQuantity} />
        <span> </span>
        <span>کالا)</span>
      </div>
    )
  }

  return `سبد خرید`
}

export default BasketTitle
