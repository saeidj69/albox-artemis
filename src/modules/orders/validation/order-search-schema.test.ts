import { describe, expect, test } from 'vitest'

import { OrderSearchSchema } from './order-search-schema'

describe('OrderSearchSchema', () => {
  test('accepts empty input and normalizes plain, Persian and Arabic digits', () => {
    expect(OrderSearchSchema.parse('')).toBe('')
    expect(OrderSearchSchema.parse('   ')).toBe('')
    expect(OrderSearchSchema.parse('1234')).toBe('1234')
    expect(OrderSearchSchema.parse('۱۲۳۴')).toBe('1234')
    expect(OrderSearchSchema.parse('١٢٣٤')).toBe('1234')
    expect(OrderSearchSchema.parse(' 42 ')).toBe('42')
  })

  test.each(['کفش', 'abc', '12ab', '-5', '1.5', '12 34'])(
    'rejects %j with the digits-only error',
    (input) => {
      const result = OrderSearchSchema.safeParse(input)

      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('فقط عدد وارد کنید')
    },
  )
})
