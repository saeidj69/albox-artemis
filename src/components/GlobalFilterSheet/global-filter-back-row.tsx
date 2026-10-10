'use client'

import { RiArrowRightLine } from '@remixicon/react'

import Button from '@/lib/Button'

type GlobalFilterBackRowProps = {
  onBack: () => void
}

const GlobalFilterBackRow = (props: GlobalFilterBackRowProps) => {
  const { onBack } = props

  return (
    <div className="mb-2 px-4">
      <Button
        size="small"
        variant="text"
        onClick={onBack}
        startIcon={<RiArrowRightLine className="size-6" aria-hidden />}
      >
        بازگشت{' '}
      </Button>
    </div>
  )
}

export default GlobalFilterBackRow
