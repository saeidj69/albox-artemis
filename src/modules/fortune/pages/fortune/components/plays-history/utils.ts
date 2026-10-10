import { formatJalaliDayMonth } from '@/utils/date'
import { formatPrice, persianDigits, toTomanPrice } from '@/utils/numbers'

import type { ClientReward } from '@/api/models/tyche'
import { ClientRewardType } from '@/api/models/tyche'

const timeFormatter = new Intl.DateTimeFormat('fa-IR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const startOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export const formatPlayDate = (value: string) => {
  const date = new Date(value)
  const today = startOfDay(new Date())
  const target = startOfDay(date)
  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  )

  const time = persianDigits(timeFormatter.format(date))

  if (diffDays === 0) return `امروز - ${time}`
  if (diffDays === 1) return `دیروز - ${time}`

  return `${formatJalaliDayMonth(date)} - ${time}`
}

export const formatPlayReward = (reward: ClientReward) => {
  switch (reward.rewardType) {
    case ClientRewardType.gift_balance:
      return `${formatPrice(toTomanPrice(reward.attributes.amount))} تومان شارژ کیف پول`
    case ClientRewardType.tickets:
      return `${formatPrice(reward.attributes.amount)} بلیط`
    case ClientRewardType.naught:
      return 'پوچ'
    default:
      return ''
  }
}
