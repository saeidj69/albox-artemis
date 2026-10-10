import { FC } from 'react'

import type { AddressItemProps } from './types'
import { addressItemVariants } from './variants'

export type { AddressItemProps } from './types'

export const AddressItemComponent: FC<AddressItemProps> = (props) => {
  const { address, isSelected, onClick, options, variant } = props

  const slots = addressItemVariants({
    variant,
    interactive: Boolean(onClick),
    selected: Boolean(isSelected),
  })

  return (
    <button
      type="button"
      data-slot="address-item"
      onClick={onClick}
      className={slots.root()}
    >
      <div data-slot="address-item-row" className={slots.row()}>
        {options?.startIcon ? (
          <div
            data-slot="address-item-start-icon"
            className={slots.startIcon()}
          >
            {options.startIcon}
          </div>
        ) : null}

        <div data-slot="address-item-content" className={slots.content()}>
          <div data-slot="address-item-title" className={slots.title()}>
            {address.name}
          </div>

          <div data-slot="address-item-address" className={slots.address()}>
            {address.address}
          </div>

          {options?.showPostalCode && address.postalCode && (
            <div
              data-slot="address-item-postal-code"
              className={slots.postalCode()}
            >
              <span
                data-slot="address-item-postal-code-label"
                className={slots.postalCodeLabel()}
              >
                کد پستی:
              </span>{' '}
              {address.postalCode}
            </div>
          )}
        </div>

        {options?.endIcon ? (
          <div data-slot="address-item-end-icon" className={slots.endIcon()}>
            {options.endIcon}
          </div>
        ) : null}
      </div>
    </button>
  )
}
