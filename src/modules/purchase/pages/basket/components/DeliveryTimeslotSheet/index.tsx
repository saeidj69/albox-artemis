'use client'

import { FC, useMemo, useState } from 'react'

import { EVENTS, track } from '@/helpers/analytics'
import { RiInformationLine } from '@remixicon/react'

import { OFFICIAL_HOLIDAY_DELIVERY_WARNING } from '@/modules/purchase/constants/delivery'
import {
  useBasketCheckCall,
  useOfficialHolidaysForDates,
} from '@/modules/purchase/hooks'
import { isOfficialHolidayDate } from '@/modules/purchase/utils'

import { composeIsoDateTime, formatJalaliTimeslot } from '@/utils/date'

import Button from '@/lib/Button'
import Radio from '@/lib/Radio'
import { createSheet, Sheet, SheetHeader, useSheet } from '@/lib/Sheet'

import TimeslotOption from './components/TimeslotOption'

type DeliveryTimeslotSheetProps = {
  initialSelected: number | null
  onConfirm: (timeslotId: number) => void
}

const MAX_DAYS = 3

const DeliveryTimeslotSheetComponent: FC<DeliveryTimeslotSheetProps> = (
  props,
) => {
  const { initialSelected, onConfirm } = props

  const sheet = useSheet()

  const { data, isChecking } = useBasketCheckCall()

  const availableOptions = useMemo(
    () =>
      data?.basket?.timeslotOptions
        ?.filter((o) => !o.isFull)
        .slice(0, MAX_DAYS) ?? [],
    [data?.basket?.timeslotOptions],
  )

  const defaultSelected = useMemo(() => {
    if (
      initialSelected != null &&
      availableOptions.some((o) => o.id === initialSelected)
    ) {
      return initialSelected
    }
    return null
  }, [initialSelected, availableOptions])

  const [selected, setSelected] = useState<number | null>(defaultSelected)

  const deliveryDates = useMemo(
    () => availableOptions.map((option) => option.deliveryDate),
    [availableOptions],
  )

  const { holidayDates } = useOfficialHolidaysForDates(deliveryDates)

  const selectedOption = useMemo(
    () => availableOptions.find((option) => option.id === selected) ?? null,
    [availableOptions, selected],
  )

  const showHolidayWarning =
    selectedOption != null &&
    isOfficialHolidayDate(selectedOption.deliveryDate, holidayDates)

  const handleConfirm = () => {
    if (selected == null) return
    track(EVENTS.DELIVERY_TIME_SELECTED, {
      plausible: { type: 'delivery_time_finalized' },
    })
    onConfirm(selected)
    sheet.hide()
  }

  const renderOptions = () => {
    if (isChecking) {
      return (
        <div className="flex flex-row gap-3 px-4 pt-2 pb-4">
          {Array.from({ length: MAX_DAYS }, (_, index) => (
            <TimeslotOption.Skeleton key={index} />
          ))}
        </div>
      )
    }

    if (availableOptions.length === 0) {
      return (
        <p className="typo-body-medium text-text-secondary px-4 pt-6 pb-8 text-center">
          در حال حاضر زمان تحویلی موجود نیست.
        </p>
      )
    }

    return (
      <div className="px-4 pt-2 pb-4">
        <Radio
          value={selected != null ? String(selected) : ''}
          onValueChange={(value) => {
            setSelected(Number(value))
            track(EVENTS.DELIVERY_TIME_SELECTED, {
              plausible: {
                type: 'delivery_time_selected',
                slot: value,
              },
            })
          }}
          className="flex flex-row gap-3"
        >
          {availableOptions.map((option) => (
            <TimeslotOption
              key={option.id}
              option={option}
              active={option.id === selected}
            />
          ))}
        </Radio>
      </div>
    )
  }

  return (
    <Sheet title="انتخاب زمان ارسال" description="انتخاب بازه تحویل سفارش">
      <div className="flex flex-col">
        <SheetHeader title="انتخاب زمان ارسال" showClose />

        {showHolidayWarning && (
          <p
            role="alert"
            className="typo-label-small text-error-main px-4 pb-2 text-center font-bold"
          >
            {OFFICIAL_HOLIDAY_DELIVERY_WARNING}
          </p>
        )}

        {renderOptions()}

        {selectedOption && !isChecking && (
          <div className="border-info-light bg-info-lighter mx-4 mb-4 flex items-start gap-2 rounded-2xl border p-3">
            <RiInformationLine className="text-info-main mt-0.5 size-5 shrink-0" />
            <p className="typo-body-small text-info-dark leading-6">
              مرسوله در بازه زمانی{' '}
              <span className="typo-title-small text-info-dark">
                {formatJalaliTimeslot(
                  composeIsoDateTime(
                    selectedOption.deliveryDate,
                    selectedOption.deliveryStartTime,
                  ),
                  composeIsoDateTime(
                    selectedOption.deliveryDate,
                    selectedOption.deliveryEndTime,
                  ),
                )}
              </span>{' '}
              ارسال می‌شود.
            </p>
          </div>
        )}

        <div className="px-4 pb-4">
          <Button
            size="large"
            className="w-full"
            disabled={!selected || isChecking}
            onClick={handleConfirm}
          >
            تایید زمان ارسال
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

const DeliveryTimeslotSheet = createSheet(DeliveryTimeslotSheetComponent)

export { DeliveryTimeslotSheetComponent }
export default DeliveryTimeslotSheet
