import { CSSProperties, FC, ReactNode } from 'react'

import { cn } from '@/lib/utils'

import SafeInset from './components/SafeInset'

type FooterComponentProps = {
  children?: ReactNode
  className?: string
  height: CSSProperties['height']
  variant?: 'fixed' | 'sticky' | 'absolute'
}

const FooterComponent: FC<FooterComponentProps> = (props) => {
  const { children, className, height, variant = 'fixed' } = props

  return (
    <div className="relative -mx-4">
      <SafeInset direction="bottom" />

      <div style={{ height }} />

      <div
        className={cn(
          'w-app fixed right-0 bottom-0 left-0 z-50',
          variant === 'sticky' && 'sticky',
          variant === 'absolute' && 'absolute',
          className,
        )}
      >
        {children}

        <SafeInset direction="bottom" />
      </div>
    </div>
  )
}

export default FooterComponent
