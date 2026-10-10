'use client'

import { FC } from 'react'

import { cn } from '@/lib/utils/cn'

const ANIMATION_CLASSES = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  slideLeft: 'animate-slide-left',
  slideRight: 'animate-slide-right',
  scaleIn: 'animate-scale-in',
} as const

export type AnimationType = keyof typeof ANIMATION_CLASSES

export interface AnimateProps extends React.HTMLAttributes<HTMLDivElement> {
  animation?: AnimationType
  duration?: number
  delay?: number
  as?: React.ElementType
}

const Animate: FC<AnimateProps> = ({
  animation = 'fadeIn',
  duration = 350,
  delay = 0,
  as: Component = 'div',
  className,
  style,
  children,
  ...props
}) => {
  return (
    <Component
      className={cn(ANIMATION_CLASSES[animation], className)}
      style={{
        ...style,
        animationDuration: `${duration}ms`,
        ...(delay > 0 && { animationDelay: `${delay}ms` }),
      }}
      {...props}
    >
      {children}
    </Component>
  )
}

export default Animate
