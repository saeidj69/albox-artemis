'use client'

import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

export interface BounceJumpProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode
  duration?: number
  delay?: number
}

const BounceJump: FC<BounceJumpProps> = ({
  children,
  className,
  duration = 2500,
  delay = 0,
  style,
  ...props
}) => {
  return (
    <div
      data-slot="bounce-jump"
      className={cn(
        'animate-mac-dock-bounce inline-flex origin-bottom',
        className,
      )}
      style={{
        ...style,
        animationDuration: `${duration}ms`,
        ...(delay > 0 && { animationDelay: `${delay}ms` }),
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export default BounceJump
