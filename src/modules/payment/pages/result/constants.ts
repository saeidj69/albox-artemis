export const PAYMENT_RESULT_TYPE = {
  BAROOK: 'barook',
} as const

export const PAYMENT_RESULT_IMAGES = {
  success: '/images/payment/result-success.png',
  failed: '/images/payment/result-failed.png',
} as const

export const PAYMENT_RESULT_COPY = {
  header: 'نتیجه پرداخت',
  success: {
    title: 'سفارش موفق',
    barookTitle: 'پرداخت موفق',
    body: 'سفارش شما با موفقیت پرداخت شد.',
    genericBody: 'سفارش با موفقیت ثبت شد',
    orderNumberLabel: 'شماره سفارش:',
    secondary: 'بازگشت به صفحه اصلی',
    primary: 'مشاهده جزئیات سفارش',
  },
  failed: {
    title: 'سفارش ناموفق',
    barookTitle: 'پرداخت ناموفق',
    line1: 'پرداخت با خطا مواجه شد.',
    genericLine2: 'لطفا دوباره تلاش کنید.',
    barookPrefix: 'در صورت ادامه مشکل، با پشتیبانی ',
    barookName: 'باروک',
    barookSuffix: ' تماس بگیرید.',
    secondary: 'بازگشت به صفحه اصلی',
    primary: 'تلاش دوباره',
  },
} as const
