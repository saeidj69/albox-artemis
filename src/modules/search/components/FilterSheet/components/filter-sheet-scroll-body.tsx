'use client'

import type { ReactNode } from 'react'

type FilterSheetScrollBodyProps = {
  children: ReactNode
}

/**
 * Scrollable region for filter panel content (footer stays fixed).
 */
const FilterSheetScrollBody = (props: FilterSheetScrollBodyProps) => {
  const { children } = props

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 [-webkit-overflow-scrolling:touch]">
      {children}
    </div>
  )
}

export default FilterSheetScrollBody
