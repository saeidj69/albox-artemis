import { Truck, CallCalling } from 'iconsax-reactjs'

import IconButton from '@/lib/IconButton'

type Driver = {
  name: string
  mobile: string
}

type OrderDriverInfoProps = {
  driver: Driver
}

const OrderDriverInfo = ({ driver }: OrderDriverInfoProps) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="bg-success-lighter text-primary-500 flex size-12 items-center justify-center rounded-full">
          <Truck className="size-8" aria-hidden />
        </div>

        <div className="space-y-2 text-right">
          <p className="typo-body-medium text-text-primary font-bold">
            {driver.name}
          </p>
          <p className="typo-caption text-text-secondary typo-body-small">
            راننده‌ی تحویل سفارش شما
          </p>
        </div>
      </div>

      <IconButton
        as="a"
        href={`tel:${driver.mobile}`}
        variant="ghost"
        size="large"
        icon={<CallCalling />}
        aria-label="تماس با راننده"
        className="border-primary-400 text-text-primary rounded-brand inline-flex size-11 items-center justify-center border"
      />
    </div>
  )
}

export default OrderDriverInfo
