import { NationalIdRegExp } from '@/constants'
import * as z from 'zod'

export const isValidIranianNationalCode = (nationalCode: string): boolean => {
  if (!NationalIdRegExp.test(nationalCode)) return false

  const check = parseInt(nationalCode[9], 10)
  let sum = 0

  for (let i = 0; i < 9; i++) {
    sum += parseInt(nationalCode[i], 10) * (10 - i)
  }

  const remainder = sum % 11
  return remainder < 2 ? check === remainder : check === 11 - remainder
}

export const iranianNationalCode = (
  errorMessage = 'کد ملی وارد شده معتبر نیست',
) =>
  z
    .string()
    .min(1, 'کد ملی الزامی است')
    .regex(NationalIdRegExp, 'کد ملی باید ۱۰ رقم باشد')
    .refine(isValidIranianNationalCode, { message: errorMessage })
