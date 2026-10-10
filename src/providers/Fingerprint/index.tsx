'use client'

import { FC, PropsWithChildren } from 'react'

import { ThumbmarkProvider } from '@thumbmarkjs/react'

const FingerprintProvider: FC<PropsWithChildren> = ({ children }) => {
  return <ThumbmarkProvider>{children}</ThumbmarkProvider>
}

export default FingerprintProvider
