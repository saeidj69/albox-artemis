import { FC, PropsWithChildren } from 'react'

import { cn } from '@/lib/utils'

const NmvWidgetLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={cn(
        'from-secondary-300 via-primary-300 to-primary-200 bg-linear-to-l',
        'rounded-brand p-px',
      )}
    >
      <div className={cn('bg-white', 'size-full rounded-[11px]')}>
        <div
          className={cn(
            'from-secondary-300/12 via-primary-300/12 to-primary-200/12 bg-linear-to-l',
            'size-full p-3',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default NmvWidgetLayout
