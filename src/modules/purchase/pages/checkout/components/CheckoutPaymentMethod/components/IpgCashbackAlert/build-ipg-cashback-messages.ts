import { formatPrice, persianDigits, toTomanPrice } from '@/utils/numbers'

export const buildIpgCashbackPercentMessage = (percent: number) => {
  return `٪${persianDigits(percent)} از مبلغ پرداخت آنلاین به کیف پول هدیه شما برمی‌گردد.`
}

export const buildIpgCashbackAmountMessage = (amountRial: number) => {
  return `با پرداخت آنلاین سفارش در همین لحظه، ${formatPrice(toTomanPrice(amountRial))} تومان پس از تحویل سفارش به کیف پول هدیه شما باز می‌گردد.`
}
