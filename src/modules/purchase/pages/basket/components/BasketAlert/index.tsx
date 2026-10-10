import { Danger } from 'iconsax-reactjs'

import { useBasketAlerts } from '@/modules/purchase/hooks'

import Button from '@/lib/Button'

const BasketAlert = () => {
  const { applyProposedChanges } = useBasketAlerts()

  return (
    <div className="bg-warning-lighter rounded-brand border-border-main border p-4">
      <div className="mb-1 flex justify-center">
        <Danger className="text-error-main" size={32} />
      </div>

      <div className="typo-label-medium text-primary-800 text-center">
        تغییر در سبد خرید
      </div>

      <div className="typo-body-small text-text-primary mt-1 mb-3 text-center">
        <div>برخی از کالاها در سبد خرید شما شامل تغییراتی شده‌اند.</div>
        <div>لطفا تغییرات را بررسی کنید.</div>
      </div>

      <Button
        variant="ghost"
        className="w-full"
        onClick={applyProposedChanges}
        classNames={{ root: 'bg-white' }}
      >
        متوجه شدم
      </Button>
    </div>
  )
}

export default BasketAlert
