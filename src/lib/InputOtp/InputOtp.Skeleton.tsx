import { type FC } from 'react'

import Skeleton from '../Skeleton'
import { cn } from '../utils'
import type { InputOtpSkeletonProps } from './types'
import { inputOtpSkeletonVariants } from './variants'

const InputOtpSkeletonComponent: FC<InputOtpSkeletonProps> = (props) => {
  const { className, classNames, length = 5 } = props

  const slots = inputOtpSkeletonVariants()

  return (
    <div
      dir="ltr"
      data-slot="input-otp-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
    >
      <div
        data-slot="input-otp-skeleton-container"
        className={slots.container({ className: classNames?.container })}
      >
        {Array.from({ length }, (_, i) => (
          <Skeleton
            key={i}
            data-slot="input-otp-skeleton-cell"
            className={slots.cell({ className: classNames?.cell })}
          />
        ))}
      </div>
    </div>
  )
}

export default InputOtpSkeletonComponent
