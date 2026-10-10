import { ROUTES } from '@/constants'

import ActionSheet from '@/components/ActionSheet'

import { hideSheet, showSheet } from '@/lib/Sheet'

type RouterLike = {
  push: (href: string) => void
}

/**
 * Warns that the basket changed (e.g. after cart-v3 pull or check-basket).
 * Primary action sends the user to the basket page.
 */
export function showBasketUpdatedSheet(router: RouterLike) {
  showSheet(ActionSheet, {
    title: 'سبد خرید تغییر کرده است',
    description: 'سبد خرید شما تغییر کرده است. لطفاً مجدداً بررسی کنید.',
    icon: 'warning',
    actions: [
      {
        id: 'cancel',
        children: 'انصراف',
        variant: 'text',
        className: 'w-full',
        onClick: () => {
          hideSheet(ActionSheet)
        },
      },
      {
        id: 'go-basket',
        children: 'مشاهده سبد خرید',
        variant: 'primary',
        className: 'w-full',
        onClick: () => {
          hideSheet(ActionSheet)
          router.push(ROUTES.BASKET)
        },
      },
    ],
  })
}
