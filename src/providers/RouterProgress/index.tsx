'use client'

import type { FC, ReactNode } from 'react'

import { AppProgressProvider as BaseProgressProvider } from '@bprogress/next'

const RouterProgressProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <BaseProgressProvider
      options={{
        showSpinner: false,
        direction: 'rtl',
      }}
      color="#015049"
      height="2px"
    >
      {children}
    </BaseProgressProvider>
  )
}

export { RouterProgressProvider }
