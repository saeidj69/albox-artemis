import { persianDigits } from '@/utils/numbers'

import type { OrderBasketTimeslotOptionsItem } from '@/api/models'

import Radio from '@/lib/Radio'
import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

const dayMonthFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  day: 'numeric',
  month: 'long',
})

const getDayLabel = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

  const diffDays = Math.round(
    (startOfDay(date) - startOfDay(now)) / (1000 * 60 * 60 * 24),
  )

  if (diffDays === 0) return 'امروز'
  if (diffDays === 1) return 'فردا'

  const weekdayFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    weekday: 'long',
  })
  return weekdayFormatter.format(date)
}

type TimeslotOptionProps = {
  option: OrderBasketTimeslotOptionsItem
  active: boolean
}

type TimeslotOptionSkeletonProps = {
  className?: string
}

const TimeslotOptionComponent = ({ option, active }: TimeslotOptionProps) => {
  const dayLabel = getDayLabel(option.deliveryDate)
  const dateLabel = dayMonthFormatter.format(new Date(option.deliveryDate))

  return (
    <label
      htmlFor={`timeslot-${option.id}`}
      data-slot="timeslot-option"
      data-active={active}
      className={cn(
        'flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 transition-colors',
        active
          ? 'border-primary-500 bg-primary-50'
          : 'border-border-lighter bg-background-main',
      )}
    >
      <Radio.Item
        id={`timeslot-${option.id}`}
        value={String(option.id)}
        classNames={{
          item: cn(
            active &&
              'border-primary-500 data-[state=checked]:border-primary-500',
          ),
          icon: 'bg-primary-500',
        }}
      />
      <span
        className={cn(
          'typo-title-small',
          active ? 'text-primary-700' : 'text-text-primary',
        )}
      >
        {dayLabel}
      </span>
      <span className="typo-body-small text-text-secondary">
        {persianDigits(dateLabel)}
      </span>
    </label>
  )
}

const TimeslotOptionSkeletonComponent = ({
  className,
}: TimeslotOptionSkeletonProps) => (
  <div
    data-slot="timeslot-option-skeleton"
    className={cn(
      'border-border-lighter bg-background-main flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4',
      className,
    )}
  >
    <Skeleton className="size-5 rounded-full" />
    <Skeleton className="h-5 w-12 rounded" />
    <Skeleton className="h-4 w-16 rounded" />
  </div>
)

const TimeslotOption = Object.assign(TimeslotOptionComponent, {
  Skeleton: TimeslotOptionSkeletonComponent,
})

export default TimeslotOption
export type { TimeslotOptionProps, TimeslotOptionSkeletonProps }
