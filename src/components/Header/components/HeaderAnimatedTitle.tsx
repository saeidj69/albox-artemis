import { cn } from '@/lib/utils'

type HeaderAnimatedTitleProps = {
  primaryTitle: string
  secondaryTitle?: string
  isPrimaryVisible: boolean
  className?: string
}

const HeaderAnimatedTitle = (props: HeaderAnimatedTitleProps) => {
  const { primaryTitle, secondaryTitle, isPrimaryVisible, className } = props

  return (
    <div className={cn('relative h-5 overflow-hidden', className)}>
      <span
        className={cn(
          'block transition-all duration-200',
          isPrimaryVisible
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0',
        )}
      >
        {primaryTitle}
      </span>

      <span
        className={cn(
          'absolute inset-0 block w-full truncate transition-all duration-200',
          isPrimaryVisible
            ? 'translate-y-full opacity-0'
            : 'translate-y-0 opacity-100',
        )}
      >
        {secondaryTitle || primaryTitle}
      </span>
    </div>
  )
}

export default HeaderAnimatedTitle
