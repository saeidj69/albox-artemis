import { persianDigits } from '@/utils/numbers'

export const COD_BAROOK_FEE_FALLBACK_MESSAGE =
  'در صورت پرداخت با اعتبار باروک، درصدی از مبلغ پرداختی به‌عنوان هزینه خدمات اعتباری آل‌باکس اضافه می‌شود.'

export const buildCodBarookFeeMessage = (commissionPercentage?: number) => {
  if (
    typeof commissionPercentage !== 'number' ||
    Number.isNaN(commissionPercentage)
  ) {
    return COD_BAROOK_FEE_FALLBACK_MESSAGE
  }

  return `در صورت پرداخت با اعتبار باروک، ${persianDigits(commissionPercentage)}٪ از مبلغ پرداختی به‌عنوان هزینه خدمات اعتباری آل‌باکس اضافه می‌شود.`
}
