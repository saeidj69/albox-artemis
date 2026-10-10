import { type FC } from 'react'

import Skeleton from '../Skeleton'
import { cn } from '../utils'
import type { SwitchSkeletonProps } from './types'
import { switchSkeletonVariants } from './variants'

const SwitchSkeletonComponent: FC<SwitchSkeletonProps> = (props) => {
  const { className, classNames, size = 'medium' } = props

  const slots = switchSkeletonVariants({ size })

  return (
    <Skeleton
      data-slot="switch-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
    />
  )
}

export default SwitchSkeletonComponent
