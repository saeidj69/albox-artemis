import { CSSProperties, FC, ReactNode } from 'react'

import { cn } from '@/lib/utils'

import SafeInset from './components/SafeInset'

type HeaderComponentProps = {
  children?: ReactNode
  className?: string
  height: CSSProperties['height']
}

const HeaderComponent: FC<HeaderComponentProps> = (props) => {
  const { children, className, height } = props

  return (
    <div>
      <SafeInset direction="top" />

      <div style={{ height }} />

      <div className={cn('w-app fixed top-0 right-0 left-0 z-50', className)}>
        <SafeInset direction="top" />

        {children}
      </div>
    </div>
  )
}

export default HeaderComponent
