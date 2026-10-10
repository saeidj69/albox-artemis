import { describe, expect, test } from 'vitest'

import { AddressFormSchema } from './address-form-schema'

describe('AddressFormSchema', () => {
  test('validates valid address form data', () => {
    const validData = {
      name: 'خانه',
      address: 'تهران، خیابان آزادی، پلاک ۱۰',
      buildingNumber: '10',
      unit: '2',
      postalCode: '1234567890',
    }

    const result = AddressFormSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  test('fails validation when address is shorter than 10 characters', () => {
    const invalidData = {
      name: 'خانه',
      address: 'کوتاه',
      buildingNumber: '10',
      unit: '2',
      postalCode: '1234567890',
    }

    const result = AddressFormSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'آدرس باید حداقل ۱۰ کاراکتر باشد',
      )
    }
  })

  test('fails validation when postalCode is not 10 digits', () => {
    const invalidPostal = {
      name: 'خانه',
      address: 'تهران، خیابان آزادی، پلاک ۱۰',
      buildingNumber: '10',
      unit: '2',
      postalCode: '12345',
    }

    const result = AddressFormSchema.safeParse(invalidPostal)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('کد پستی باید ۱۰ رقم باشد')
    }
  })
})
