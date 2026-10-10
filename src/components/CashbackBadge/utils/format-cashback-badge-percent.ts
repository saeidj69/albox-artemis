import { persianDigits } from '@/utils/numbers'

export function formatCashbackBadgePercent(percent: number) {
  return `٪${persianDigits(Math.ceil(percent))}`
}
