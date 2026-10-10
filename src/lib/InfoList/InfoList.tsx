import { cn } from '@/lib/utils/cn'

import type { InfoListProps } from './types'
import { infoListVariants } from './variants'

const InfoListComponent = (props: InfoListProps) => {
  const { ref, items, variant, className, classNames, ...otherProps } = props

  const slots = infoListVariants({ variant })

  return (
    <div
      ref={ref}
      data-slot="info-list"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...otherProps}
    >
      {items.map((item, index) => {
        const isAlt = index % 2 === 0

        return (
          <div
            key={index}
            data-slot="info-list-row"
            data-emphasized={item.emphasized ? true : undefined}
            className={slots.row({
              className: cn(
                classNames?.row,
                isAlt && slots.rowAlt({ className: classNames?.rowAlt }),
              ),
            })}
          >
            <span
              data-slot="info-list-label"
              className={
                item.emphasized
                  ? slots.labelEmphasized({
                      className: classNames?.labelEmphasized,
                    })
                  : slots.label({ className: classNames?.label })
              }
            >
              {item.label}
            </span>
            <span
              data-slot="info-list-value"
              className={
                item.emphasized
                  ? slots.valueEmphasized({
                      className: classNames?.valueEmphasized,
                    })
                  : slots.value({ className: classNames?.value })
              }
            >
              {item.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default InfoListComponent

export type { InfoListProps }
