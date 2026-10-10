import { DigitsOnlyRegExp, PostalCodeRegExp } from '@/constants'
import * as z from 'zod'

export const AddressFormSchema = z.object({
  name: z.string().trim().min(1, 'لطفا عنوان آدرس را وارد کنید'),
  address: z
    .string()
    .trim()
    .min(1, 'لطفا آدرس دقیق را وارد کنید')
    .min(10, 'آدرس باید حداقل ۱۰ کاراکتر باشد'),
  buildingNumber: z
    .string()
    .min(1, 'لطفا پلاک را وارد کنید')
    .regex(DigitsOnlyRegExp, 'پلاک باید عدد باشد'),
  unit: z.string().refine((v) => v === '' || DigitsOnlyRegExp.test(v), {
    message: 'واحد باید عدد باشد',
  }),
  postalCode: z
    .string()
    .min(1, 'لطفا کد پستی را وارد کنید')
    .regex(PostalCodeRegExp, 'کد پستی باید ۱۰ رقم باشد'),
})

export type AddressFormValues = z.infer<typeof AddressFormSchema>
