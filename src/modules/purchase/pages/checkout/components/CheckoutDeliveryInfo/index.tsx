'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import { Clock, Location } from 'iconsax-reactjs'

import Animate from '@/components/Animate'

import { useUserAddresses } from '@/modules/addresses/hooks'
import { buildAddressCreateSelectLocationUrl } from '@/modules/addresses/utils/select-location'
import { useBasketCheckCall, useCheckoutData } from '@/modules/purchase/hooks'

import {
  composeIsoDateTime,
  formatJalaliLongDate,
  formatJalaliTimeslot,
} from '@/utils/date'

import Button from '@/lib/Button'
import Skeleton from '@/lib/Skeleton'

const CheckoutDeliveryInfo = () => {
  const router = useRouter()

  const { checkout } = useCheckoutData()
  const selectedTimeslotId = checkout.selectedTimeSlotId

  const { primaryAddress, isLoading: isLoadingAddress } = useUserAddresses()

  const { data: basketData, isChecking: isLoadingTimeslot } =
    useBasketCheckCall()

  const selectedTimeslot = basketData?.basket?.timeslotOptions?.find(
    (option) => +option.id === +(selectedTimeslotId ?? 0),
  )

  useEffect(() => {
    if (!selectedTimeslotId) {
      router.push(ROUTES.BASKET)
    }
  }, [selectedTimeslotId, router])

  const isLoading = isLoadingAddress || isLoadingTimeslot

  return (
    <section className="bg-background-main">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Location className="text-primary-500 mt-0.5 size-5 shrink-0" />

          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="mb-1.5 space-y-3">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-full rounded" />
              </div>
            ) : primaryAddress ? (
              <div className="block w-full text-right">
                <Animate>
                  <p className="typo-title-x-small text-text-primary">
                    {primaryAddress?.name}
                  </p>
                </Animate>

                <Animate delay={100}>
                  <p className="typo-body-medium text-text-secondary mt-1 line-clamp-2">
                    {primaryAddress?.address}
                  </p>
                </Animate>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <span className="typo-body-medium text-error-main">
                  آدرس تحویل انتخاب نشده است
                </span>
                <Button
                  size="small"
                  variant="text"
                  onClick={() =>
                    router.push(buildAddressCreateSelectLocationUrl())
                  }
                >
                  افزودن آدرس
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="text-primary-500 mt-0.5 size-5 shrink-0" />

          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="mt-px mb-2 space-y-3">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-2/3 rounded" />
              </div>
            ) : (
              <div className="min-w-0 flex-1">
                <Animate delay={200}>
                  {selectedTimeslot ? (
                    <p className="typo-body-medium text-text-primary">
                      {formatJalaliLongDate(selectedTimeslot?.deliveryDate)} -
                      ساعت{' '}
                      {formatJalaliTimeslot(
                        composeIsoDateTime(
                          selectedTimeslot?.deliveryDate,
                          selectedTimeslot?.deliveryStartTime,
                        ),
                        composeIsoDateTime(
                          selectedTimeslot?.deliveryDate,
                          selectedTimeslot?.deliveryEndTime,
                        ),
                      )}
                    </p>
                  ) : (
                    <p className="typo-body-medium text-text-secondary">
                      زمان تحویلی موجود نیست
                    </p>
                  )}
                </Animate>

                <Animate delay={300}>
                  <p className="typo-body-small text-error-main mt-1 leading-6">
                    زمان تحویل سفارش ثابت است؛ لطفا برای جلوگیری از مرجوع شدن
                    محصولات، حتما در فروشگاه حضور داشته باشید.
                  </p>
                </Animate>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CheckoutDeliveryInfo
