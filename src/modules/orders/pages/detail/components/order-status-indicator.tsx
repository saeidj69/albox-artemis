import { deriveOrderFlow } from '@/modules/orders/utils/order-flow'
import {
  getOrderStatusTone,
  type OrderStatusTone,
} from '@/modules/orders/utils/status'
import { ORDER_STATUS_CONFIG } from '@/modules/orders/utils/status-config'

import type {
  OrderCustomerOrderStatus,
  OrderOrderPaymentStatus,
} from '@/api/models'

import { cn } from '@/lib/utils/cn'

type OrderStatusIndicatorSlot =
  | 'root'
  | 'stepper'
  | 'step'
  | 'dot'
  | 'iconWrapper'
  | 'icon'
  | 'connector'
  | 'text'
  | 'label'
  | 'description'

type OrderStatusIndicatorProps = {
  status: OrderCustomerOrderStatus
  paymentStatusValue: OrderOrderPaymentStatus
  description?: string
  className?: string
  classNames?: Partial<Record<OrderStatusIndicatorSlot, string>>
}

const toneClassNames: Record<
  OrderStatusTone,
  {
    activeDot: string
    iconBg: string
    iconColor: string
    connector: string
    label: string
  }
> = {
  info: {
    activeDot: 'bg-info-main',
    iconBg: 'bg-info-lighter',
    iconColor: 'text-info-main',
    connector: 'bg-info-main',
    label: 'text-info-dark',
  },
  warning: {
    activeDot: 'bg-warning-main',
    iconBg: 'bg-warning-lighter',
    iconColor: 'text-warning-main',
    connector: 'bg-warning-main',
    label: 'text-warning-dark',
  },
  success: {
    activeDot: 'bg-success-main',
    iconBg: 'bg-success-lighter',
    iconColor: 'text-success-main',
    connector: 'bg-success-main',
    label: 'text-success-dark',
  },
  error: {
    activeDot: 'bg-error-main',
    iconBg: 'bg-error-lighter',
    iconColor: 'text-error-main',
    connector: 'bg-error-main',
    label: 'text-error-dark',
  },
}

const OrderStatusIndicator = (props: OrderStatusIndicatorProps) => {
  const { status, paymentStatusValue, description, className, classNames } =
    props

  const steps = deriveOrderFlow(status.value, paymentStatusValue)
  const tone = getOrderStatusTone(status.value)
  const toneClasses = toneClassNames[tone]

  const isTerminal = status.value === 'delivered' || status.value === 'canceled'

  const statusIndexInFlow = steps.indexOf(status.value)
  const currentIndex = isTerminal
    ? steps.length - 1
    : statusIndexInFlow >= 0
      ? statusIndexInFlow
      : 0

  const totalSteps = steps.length
  const descriptionText =
    description ?? ORDER_STATUS_CONFIG[status.value].description

  return (
    <div
      data-slot="order-status-indicator"
      className={cn(
        'border-border-main bg-background-main rounded-brand grid gap-1 border px-3 py-2',
        className,
        classNames?.root,
      )}
    >
      <div
        data-slot="order-status-indicator-stepper"
        className={cn('relative grid items-start pb-8', classNames?.stepper)}
        style={{
          gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: totalSteps - 1 }).map((_, connectorIndex) => {
          const startPercent = ((connectorIndex + 0.5) / totalSteps) * 100
          const widthPercent = (1 / totalSteps) * 100
          const isActive = isTerminal || connectorIndex < currentIndex

          return (
            <div
              key={connectorIndex}
              data-slot="order-status-indicator-connector"
              data-state={isActive ? 'active' : 'pending'}
              className={cn(
                'absolute top-4 -translate-y-1/2',
                isActive
                  ? cn('h-0.5', toneClasses.connector)
                  : 'border-text-disabled border-t-2 border-dashed',
                classNames?.connector,
              )}
              style={{
                insetInlineStart: `${startPercent}%`,
                width: `${widthPercent}%`,
              }}
            />
          )
        })}

        {steps.map((step, i) => {
          const iconKey =
            isTerminal && i === totalSteps - 1 ? status.value : step
          const StepIcon = ORDER_STATUS_CONFIG[iconKey].icon
          const showIcon =
            i === currentIndex || (isTerminal && i === totalSteps - 1)
          const isActiveDot = isTerminal || i < currentIndex
          const labelAnchor =
            i === 0
              ? 'start-0'
              : i === totalSteps - 1
                ? 'left-1/2 -translate-x-1/2'
                : 'left-1/2 -translate-x-1/2'

          return (
            <div
              key={step}
              data-slot="order-status-indicator-step"
              data-state={
                i < currentIndex
                  ? 'past'
                  : i === currentIndex
                    ? 'current'
                    : 'future'
              }
              className={cn(
                'relative flex h-8 items-center justify-center',
                classNames?.step,
              )}
            >
              {showIcon ? (
                <div
                  data-slot="order-status-indicator-icon-wrapper"
                  className={cn(
                    'relative z-10 flex size-8 items-center justify-center rounded-full',
                    toneClasses.iconBg,
                    classNames?.iconWrapper,
                  )}
                >
                  <StepIcon
                    className={cn(
                      'size-5',
                      toneClasses.iconColor,
                      classNames?.icon,
                    )}
                  />
                </div>
              ) : (
                <span
                  data-slot="order-status-indicator-dot"
                  className={cn(
                    'relative z-10 size-2 rounded-full',
                    isActiveDot ? toneClasses.activeDot : 'bg-text-disabled',
                    classNames?.dot,
                  )}
                />
              )}

              {showIcon && (
                <div
                  data-slot="order-status-indicator-text"
                  className={cn(
                    'absolute top-full mt-2 whitespace-nowrap',
                    labelAnchor,
                    classNames?.text,
                  )}
                >
                  <span
                    data-slot="order-status-indicator-label"
                    className={cn(
                      'typo-label-small',
                      toneClasses.label,
                      classNames?.label,
                    )}
                  >
                    {status.label}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p
        data-slot="order-status-indicator-description"
        className={cn(
          'typo-body-small text-text-secondary',
          classNames?.description,
        )}
      >
        {descriptionText}
      </p>
    </div>
  )
}

export default OrderStatusIndicator
