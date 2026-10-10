import { persianDigits } from '@/utils/numbers'

const DAY_MS = 24 * 60 * 60 * 1000

const dayMonthFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  day: '2-digit',
  month: 'long',
})

const dayMonthYearFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

export const formatCampaignPeriod = (startAt: string, endAt: string) => {
  const start = dayMonthFormatter.format(new Date(startAt))
  const end = dayMonthFormatter.format(new Date(endAt))
  return `${start} تا ${end}`
}

export const formatCampaignChargeDate = (value: string) =>
  dayMonthYearFormatter.format(new Date(value))

export const remainingCampaignDays = (endAt: string, now = Date.now()) => {
  const end = new Date(endAt).getTime()
  if (!Number.isFinite(end)) {
    return 0
  }

  return Math.max(0, Math.ceil((end - now) / DAY_MS))
}

export const remainingCampaignFullDays = (endAt: string, now = Date.now()) => {
  const end = new Date(endAt).getTime()
  if (!Number.isFinite(end)) {
    return 0
  }

  return Math.max(0, Math.floor((end - now) / DAY_MS))
}

export const formatRemainingDaysBadge = (endAt: string, now = Date.now()) => {
  const days = remainingCampaignFullDays(endAt, now)
  return `${persianDigits(days)} روز باقی مانده`
}
