import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type MethodOptionFrameProps = {
  selected: boolean
  disabled?: boolean
  error?: boolean
  loading?: boolean
  onSelect?: () => void
  children: ReactNode
}

const MethodOptionFrame = (props: MethodOptionFrameProps) => {
  const {
    selected,
    disabled = false,
    error = false,
    loading = false,
    onSelect,
    children,
  } = props

  const className = cn(
    'rounded-brand w-full border p-3 text-right duration-100',
    selected ? 'border-primary-600' : 'border-border-main',
    disabled
      ? 'cursor-default'
      : 'active:bg-background-secondary cursor-pointer',
    error && 'border-error-lighter bg-error-light',
    loading && 'bg-background-secondary',
  )

  if (disabled) {
    return (
      <div data-slot="payment-method-option" className={className}>
        {children}
      </div>
    )
  }

  return (
    <button
      type="button"
      data-slot="payment-method-option"
      data-selected={selected || undefined}
      className={className}
      onClick={onSelect}
    >
      {children}
    </button>
  )
}

export default MethodOptionFrame
