'use client'

import { FC, ReactNode } from 'react'

type ProtectedLayoutProps = {
  children: ReactNode
}

const ProtectedLayout: FC<ProtectedLayoutProps> = (props) => {
  const { children } = props

  return (
    <div className="border-border-lighter bg-background-main container flex min-h-dvh flex-col md:border-r md:border-l">
      {children}
    </div>
  )
}

export default ProtectedLayout
