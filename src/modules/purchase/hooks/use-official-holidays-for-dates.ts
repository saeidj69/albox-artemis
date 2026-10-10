'use client'

import { useMemo } from 'react'

import { useListCalendarEvents } from '@/api/functions/calendar'
import { CalendarEventType } from '@/api/models'

import {
  buildOfficialHolidayDateSet,
  getDateRangeBounds,
} from '../utils/official-holidays'

type UseOfficialHolidaysForDatesReturn = {
  holidayDates: Set<string>
  isLoading: boolean
}

export const useOfficialHolidaysForDates = (
  deliveryDates: string[],
): UseOfficialHolidaysForDatesReturn => {
  const dateRange = useMemo(
    () => getDateRangeBounds(deliveryDates),
    [deliveryDates],
  )

  const { data, isLoading } = useListCalendarEvents(
    dateRange
      ? {
          type: CalendarEventType.official_holiday,
          from_date: dateRange.fromDate,
          to_date: dateRange.toDate,
          limit: 100,
        }
      : undefined,
    {
      query: {
        enabled: dateRange != null,
      },
    },
  )

  const holidayDates = useMemo(
    () => buildOfficialHolidayDateSet(data?.events),
    [data?.events],
  )

  return { holidayDates, isLoading }
}
