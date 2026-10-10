import { CardTick, ReceiptText } from 'iconsax-reactjs'

import { BAROOK_PAGE_COPY } from '../constants'
import AmountDisplay from './amount-display'

type OrderInfoProps = {
  creditLimitRial: number | null
  orderPayableRial: number
}

const OrderInfo = (props: OrderInfoProps) => {
  const { creditLimitRial, orderPayableRial } = props

  return (
    <section
      data-slot="barook-order-info"
      className="bg-background-secondary border-border-lighter flex flex-col gap-4 border-b p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CardTick
            variant="Outline"
            className="text-primary-600 size-6 shrink-0"
          />
          <p className="typo-body-medium text-text-primary">
            {BAROOK_PAGE_COPY.creditLimit}
          </p>
        </div>
        <AmountDisplay amountRial={creditLimitRial} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ReceiptText
            variant="Outline"
            className="text-primary-600 size-6 shrink-0"
          />
          <p className="typo-body-medium text-text-primary">
            {BAROOK_PAGE_COPY.orderPayable}
          </p>
        </div>
        <AmountDisplay amountRial={orderPayableRial} />
      </div>
    </section>
  )
}

export default OrderInfo
