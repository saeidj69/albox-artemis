import { DigitsOnlyRegExp } from '@/constants'
import * as z from 'zod'

import { englishDigits } from '@/utils/numbers'

/**
 * Empty input is valid (no filter); anything else must be digits only
 * (Latin, Persian or Arabic). Output is normalized to trimmed Latin digits.
 */
export const OrderSearchSchema = z
  .string()
  .overwrite(englishDigits)
  .trim()
  .refine((value) => value === '' || DigitsOnlyRegExp.test(value), {
    message: 'فقط عدد وارد کنید',
  })

export type OrderSearchValue = z.infer<typeof OrderSearchSchema>
