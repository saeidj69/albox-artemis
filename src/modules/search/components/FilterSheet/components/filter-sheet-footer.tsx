'use client'

import Button from '@/lib/Button'
import { SheetFooter } from '@/lib/Sheet'

type FilterSheetFooterProps = {
  onDiscard: () => void
  onSubmit: () => void
}

const FilterSheetFooter = (props: FilterSheetFooterProps) => {
  const { onDiscard, onSubmit } = props

  return (
    <SheetFooter className="border-border-main bg-background-main shrink-0 border-t px-4 py-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="text"
          className="min-w-0 flex-1"
          onClick={onDiscard}
        >
          لغو تغییرات
        </Button>
        <Button
          type="button"
          variant="primary"
          className="min-w-0 flex-1"
          onClick={onSubmit}
        >
          اعمال فیلتر
        </Button>
      </div>
    </SheetFooter>
  )
}

export default FilterSheetFooter
