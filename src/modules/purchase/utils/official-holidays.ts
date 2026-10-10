import type { CalendarCalendarEvent } from '@/api/models'

export const buildOfficialHolidayDateSet = (
  events: CalendarCalendarEvent[] | undefined,
): Set<string> => {
  if (!events?.length) return new Set()

  return new Set(events.map((event) => event.date))
}

export const isOfficialHolidayDate = (
  date: string,
  holidayDates: Set<string>,
): boolean => holidayDates.has(date)

export const getDateRangeBounds = (
  dates: string[],
): { fromDate: string; toDate: string } | null => {
  if (!dates.length) return null

  const sorted = [...dates].sort()
  return {
    fromDate: sorted[0]!,
    toDate: sorted[sorted.length - 1]!,
  }
}
