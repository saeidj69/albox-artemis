import { persianDigits } from '@/utils/numbers'

type DateInput = string | number | Date

const toDate = (value: DateInput) =>
  value instanceof Date ? value : new Date(value)

const longDateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export const formatJalaliLongDate = (value: DateInput) =>
  longDateFormatter.format(toDate(value))

const dayMonthFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  day: 'numeric',
  month: 'long',
})

export const formatJalaliDayMonth = (value: DateInput) =>
  dayMonthFormatter.format(toDate(value))

const longDateWithYearFormatter = new Intl.DateTimeFormat(
  'fa-IR-u-ca-persian',
  {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
)

const timeFormatter = new Intl.DateTimeFormat('fa-IR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export const formatJalaliLongDateTime = (value: DateInput) => {
  const date = toDate(value)
  return `${longDateWithYearFormatter.format(date)} - ${timeFormatter.format(date)}`
}

export const formatJalaliHour = (value: DateInput) => {
  const hour = toDate(value).getHours().toString().padStart(2, '0')
  return persianDigits(hour) + ':00'
}

export const formatJalaliTimeslot = (start: DateInput, end: DateInput) =>
  `${formatJalaliHour(start)} - ${formatJalaliHour(end)}`

export const formatJalaliHourRange = (start: DateInput, end: DateInput) =>
  `${persianDigits(toDate(start).getHours())} تا ${persianDigits(toDate(end).getHours())}`

export const composeIsoDateTime = (date: string, time: string): string =>
  `${date}T${time}`
