'use client'

import { memo, useEffect, useRef } from 'react'

import { useClientState } from '@/hooks/useClientState'

import { cn } from '@/lib/utils'

type PreviewLabelProps = {
  showLabel: boolean
  className?: string
  labelClassName?: string
}

const PreviewLabelComponent = (props: PreviewLabelProps) => {
  const { showLabel, className, labelClassName } = props

  const { setValue } = useClientState('addToCartPreview')

  const wasShownRef = useRef(false)

  useEffect(() => {
    if (showLabel) {
      wasShownRef.current = true
    } else if (wasShownRef.current) {
      wasShownRef.current = false

      setValue((prev) => ({
        ...prev,
        ordersCount: prev?.ordersCount ?? 0,
        lastTimestamp: Math.floor(Date.now() / 1000),
      }))
    }
  }, [showLabel, setValue])

  return (
    <div
      data-slot="add-to-basket-preview-label"
      className={className}
      aria-hidden={!showLabel}
    >
      <span className={cn(labelClassName, 'inline-block whitespace-nowrap')}>
        افزودن به سبد
      </span>
    </div>
  )
}

export default memo(PreviewLabelComponent)
