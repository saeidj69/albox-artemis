import { FC, ReactNode } from 'react'

import { cn } from '@/lib/utils'

import HeaderLogo from './components/HeaderLogo'
import HeaderProfileButton from './components/HeaderProfileButton'
import { headerVariants } from './variants'

type HeaderProps = {
  left?: ReactNode
  right?: ReactNode
  center?: ReactNode
  className?: string

  classNames?: {
    root?: string
    left?: string
    right?: string
    center?: string
  }
}

const Header: FC<HeaderProps> = (props) => {
  const { left, right, center, className, classNames } = props

  const slots = headerVariants()

  return (
    <div className={cn(slots.root({ className: classNames?.root }), className)}>
      <div className={cn(slots.right({ className: classNames?.right }))}>
        {right}
      </div>

      <div className={cn(slots.center({ className: classNames?.center }))}>
        {center}
      </div>

      <div className={cn(slots.left({ className: classNames?.left }))}>
        {left}
      </div>
    </div>
  )
}

export default Header

export { HeaderLogo, HeaderProfileButton }
