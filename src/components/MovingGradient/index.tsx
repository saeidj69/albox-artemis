import { ComponentPropsWithoutRef, FC } from 'react'

import { cn } from '@/lib/utils'

interface MovingGradientProps extends ComponentPropsWithoutRef<'div'> {
  animated?: boolean
  gradientClassName?: string
}

const MovingGradient: FC<MovingGradientProps> = ({
  children,
  className,
  animated = true,
  gradientClassName,
  ...props
}) => {
  const backgroundClassName = 'pointer-events-none absolute h-full w-full'

  return (
    <div
      {...props}
      className={cn('relative overflow-hidden bg-white', className)}
    >
      <div
        className={cn(
          'from-primary-600 via-primary-700 to-primary-800 bg-linear-to-br from-30% via-50% to-80%',
          'opacity-100',
          {
            [backgroundClassName]: true,
            'animate-bg-position bg-size-[300%_auto]': animated,
          },
          gradientClassName,
        )}
      />

      <div className={cn(backgroundClassName, 'z-1 blur-lg')} />

      {children}
    </div>
  )
}

export default MovingGradient
