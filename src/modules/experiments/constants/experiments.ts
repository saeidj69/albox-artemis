import { BAROOK_AMOUNT_MODE, type BarookAmountMode } from '@/constants'

import { ExperimentConfig } from '../types'

const BAROOK_SUGGESTED_AMOUNT: ExperimentConfig<
  'gateway' | 'order_deduction',
  { mode: BarookAmountMode }
> = {
  id: 'barook-suggested-amount',
  title: 'مبلغ پیشنهادی باروک',
  description: 'مشخص می‌کند مبلغ پیشنهادی شارژ کیف‌پول باروک چطور محاسبه شود.',
  variants: [
    {
      key: 'gateway',
      label: 'بر اساس مبلغ درگاه',
      weight: 0,
      payload: { mode: BAROOK_AMOUNT_MODE.GATEWAY },
    },
    {
      key: 'order_deduction',
      label: 'کسر از مبلغ سفارش',
      weight: 100,
      payload: { mode: BAROOK_AMOUNT_MODE.ORDER_DEDUCTION },
    },
  ],
}

const BASKET_SERVER_SYNC: ExperimentConfig<
  'enabled' | 'disabled',
  { enabled: boolean }
> = {
  id: 'basket-server-sync',
  title: 'همگام‌سازی سبد خرید',
  description:
    'وقتی فعال باشد، سبد روی سرور ذخیره می‌شود تا در دستگاه‌های دیگر هم دیده شود.',
  variants: [
    {
      key: 'enabled',
      label: 'فعال',
      weight: 0,
      payload: { enabled: true },
    },
    {
      key: 'disabled',
      label: 'غیرفعال',
      weight: 100,
      payload: { enabled: false },
    },
  ],
}

const BASKET_RECOMMENDATION_TITLE: ExperimentConfig<
  'dont_miss_out' | 'ai' | 'popular_nearby',
  { title: 'dont_miss_out' | 'ai' | 'popular_nearby' }
> = {
  id: 'basket-recommendation-title',
  title: 'عنوان پیشنهادهای سبد خرید',
  description: 'سه عنوان متفاوت برای پیشنهادهای سبد خرید را مقایسه می‌کند.',
  variants: [
    {
      key: 'dont_miss_out',
      label: 'از دستت نره!',
      weight: 33,
      payload: { title: 'dont_miss_out' },
    },
    {
      key: 'ai',
      label: 'عنوان هوش مصنوعی',
      weight: 34,
      payload: { title: 'ai' },
    },
    {
      key: 'popular_nearby',
      label: 'محبوب در فروشگاه‌های اطراف',
      weight: 33,
      payload: { title: 'popular_nearby' },
    },
  ],
}

const WHEEL_OF_FORTUNE_COLOR: ExperimentConfig<
  'green' | 'purple',
  { color: 'green' | 'purple' }
> = {
  id: 'wheel-of-fortune-color',
  title: 'رنگ چرخ‌ شانس',
  description: 'رنگ تصویر چرخ شانس را مقایسه می‌کند.',
  variants: [
    {
      key: 'green',
      label: 'سبز',
      weight: 0,
      payload: { color: 'green' },
    },
    {
      key: 'purple',
      label: 'بنفش',
      weight: 100,
      payload: { color: 'purple' },
    },
  ],
}

const BASKET_RECOMMENDATION_ORDER: ExperimentConfig<
  'others_also_buy' | 'recommended_for_you',
  { primaryGroup: 'others_also_buy' | 'recommended_for_you' }
> = {
  id: 'basket-recommendation-order',
  title: 'ترتیب پیشنهادهای سبد خرید',
  description: 'اولویت دو گروه پیشنهادهای سبد خرید را مقایسه می‌کند.',
  variants: [
    {
      key: 'others_also_buy',
      label: 'اول خرید دیگران، سپس پیشنهاد شخصی',
      weight: 50,
      payload: { primaryGroup: 'others_also_buy' },
    },
    {
      key: 'recommended_for_you',
      label: 'اول پیشنهاد شخصی، سپس خرید دیگران',
      weight: 50,
      payload: { primaryGroup: 'recommended_for_you' },
    },
  ],
}

export const EXPERIMENTS = {
  BAROOK_SUGGESTED_AMOUNT,
  BASKET_SERVER_SYNC,
  BASKET_RECOMMENDATION_ORDER,
  BASKET_RECOMMENDATION_TITLE,
  WHEEL_OF_FORTUNE_COLOR,
} as const satisfies Record<string, ExperimentConfig>
