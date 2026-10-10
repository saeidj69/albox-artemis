import { FC } from 'react'

import Image from 'next/image'

import Button from '@/lib/Button'
import { createSheet, Sheet, SheetHeader } from '@/lib/Sheet'
import { cn } from '@/lib/utils'

import { ActionSheetIcon, ActionSheetProps } from './types'

const ICON_SRC: Record<ActionSheetIcon, string> = {
  success: '/images/status/success.png',
  warning: '/images/status/warning.png',
  error: '/images/status/error.png',
}

const ActionSheetComponent: FC<ActionSheetProps> = (props) => {
  const { title, description, icon, children, actions } = props

  return (
    <Sheet
      title={title}
      onClose={props.onClose}
      description={description ?? ''}
    >
      <SheetHeader onClose={props.onClose} title={title} showClose />

      <div className="p-4">
        {icon ? (
          <div className="mb-4 flex justify-center">
            <Image
              src={ICON_SRC[icon]}
              alt={icon}
              width={120}
              height={120}
              className="size-[120px] object-contain"
            />
          </div>
        ) : null}

        {description ? (
          <div className="typo-label-medium text-text-secondary">
            {description}
          </div>
        ) : null}

        {children}

        <div className="mt-4 flex gap-2">
          {actions?.map((action) => (
            <Button
              key={action.id}
              {...action}
              className={cn('flex-1', action.className)}
            />
          ))}
        </div>
      </div>
    </Sheet>
  )
}

const ActionSheet = createSheet(ActionSheetComponent)

export default ActionSheet
