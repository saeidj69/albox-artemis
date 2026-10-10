export const BAROOK_CALCULATOR_FORM_ID = 'barook-calculator-form'

export const BAROOK_PAGE_COPY = {
  title: 'پرداخت با باروک',
  creditLimit: 'سقف اعتبار باروک شما:',
  orderPayable: 'مبلغ قابل پرداخت سفارش:',
  walletLabel: 'کیف پول باروک:',
  walletDeduction: 'مبلغ کسر از سفارش',
  walletDeductionHint: '(بدون هزینه خدمات اعتباری آل‌باکس)',
  orderDeductionTab: 'مبلغ کسر از سفارش',
  gatewayTab: 'مبلغ پرداختی از درگاه باروک',
  feeAdded: (percent: string) =>
    `${percent}٪ هزینه خدمات اعتباری آل‌باکس به این مبلغ اضافه خواهد شد.`,
  feeIncluded: (percent: string) =>
    `${percent}٪ هزینه خدمات اعتباری آل‌باکس در این مبلغ محاسبه شده است.`,
  netPaymentInput: 'خالص پرداختی:',
  gatewayAmountInput: 'مبلغ پرداختی از باروک:',
  netPaymentLabel: 'خالص پرداختی:',
  gatewayAmountLabel: 'مبلغ پرداختی از باروک:',
  help: 'راهنما',
  bankFeeLabel: 'هزینه خدمات اعتباری آل‌باکس:',
  payableFromCreditLabel: 'مبلغ قابل پرداخت از اعتبار باروک:',
  orderDeductionLabel: 'مبلغ کسر از سفارش:',
  creditDeductionLabel: 'کسر از اعتبار باروک:',
  confirm: 'تأیید و پرداخت',
  notPayable: 'این سفارش با باروک قابل پرداخت نیست.',
  walletUnavailable: 'کیف پول باروک برای این کاربر یافت نشد.',
  walletDisabled: 'پرداخت باروک برای این کاربر فعال نیست.',
  pendingTitle: 'پرداخت باروک در جریان است',
  pendingDescription:
    'یک پرداخت باروک برای این سفارش در جریان است. در صورت ادامه، پرداخت قبلی نادیده گرفته می‌شود.',
  pendingProceed: 'ادامه',
  pendingCancel: 'انصراف',
  clearAmount: 'پاک کردن',
} as const

export const BAROOK_CALCULATOR_FOOTER_HEIGHT = 160
