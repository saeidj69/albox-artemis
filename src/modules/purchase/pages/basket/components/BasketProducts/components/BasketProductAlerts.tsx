import type { ProductAlert } from '@/modules/purchase/hooks'

import { cn } from '@/lib/utils'

type BasketProductAlertsProps = {
  productId: number
  alerts: ProductAlert[]
}

const BasketProductAlerts = ({
  productId,
  alerts,
}: BasketProductAlertsProps) => {
  if (alerts.length === 0) return null

  return (
    <ul data-slot="basket-product-alerts" className="mt-2 space-y-1">
      {alerts.map((alert, i) => (
        <li
          key={`${productId}-alert-${i}`}
          className={cn(
            'typo-body-small',
            alert.severity === 'error' && 'text-error-main',
            alert.severity === 'warning' && 'text-warning-dark',
            alert.severity === 'success' && 'text-success-main',
          )}
        >
          {alert.text}
        </li>
      ))}
    </ul>
  )
}

export default BasketProductAlerts
