import { describe, expect, test } from 'vitest'

import {
  buildIpgCashbackAmountMessage,
  buildIpgCashbackPercentMessage,
} from './build-ipg-cashback-messages'

describe('buildIpgCashbackPercentMessage', () => {
  test('formats the percent with persian digits and a leading percent sign', () => {
    expect(buildIpgCashbackPercentMessage(2)).toBe(
      '٪۲ از مبلغ پرداخت آنلاین به کیف پول هدیه شما برمی‌گردد.',
    )
  })

  test('formats decimal percentages with persian digits', () => {
    expect(buildIpgCashbackPercentMessage(2.5)).toBe(
      '٪۲.۵ از مبلغ پرداخت آنلاین به کیف پول هدیه شما برمی‌گردد.',
    )
  })
})

describe('buildIpgCashbackAmountMessage', () => {
  test('formats the rial amount as tomans with persian digits', () => {
    expect(buildIpgCashbackAmountMessage(1_200_000)).toBe(
      'با پرداخت آنلاین سفارش در همین لحظه، ۱۲۰٬۰۰۰ تومان پس از تحویل سفارش به کیف پول هدیه شما باز می‌گردد.',
    )
  })
})
