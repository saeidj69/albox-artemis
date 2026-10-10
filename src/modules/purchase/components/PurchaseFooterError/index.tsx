'use client'

import { ReactNode } from 'react'

import Animate from '@/components/Animate'

import { cn } from '@/lib/utils'

type PurchaseFooterErrorProps = {
  message: string
  className?: string
}

const PurchaseFooterError = ({
  message,
  className,
}: PurchaseFooterErrorProps) => {
  return (
    <p
      data-slot="purchase-footer-error"
      className={cn('typo-body-small text-error-main leading-6', className)}
    >
      {message}
    </p>
  )
}

export const purchaseFooterHeader = (content: ReactNode): ReactNode => (
  <Animate animation="slideUp" className="mb-4">
    {content}
  </Animate>
)

export const purchaseFooterErrorHeader = (message: string): ReactNode =>
  purchaseFooterHeader(<PurchaseFooterError message={message} />)

export default PurchaseFooterError
