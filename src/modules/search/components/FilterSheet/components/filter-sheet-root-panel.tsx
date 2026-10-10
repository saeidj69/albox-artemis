'use client'

import { RiArrowLeftSLine } from '@remixicon/react'

import { useSearchFilterDraft } from '@/modules/search/hooks/use-search-filter-draft'

import Button from '@/lib/Button'
import Chip from '@/lib/Chip'
import Switch from '@/lib/Switch'

type FilterSheetRootPanelProps = {
  onOpenCategories: () => void
  onOpenBrands: () => void
}

const FilterSheetRootPanel = (props: FilterSheetRootPanelProps) => {
  const { onOpenCategories, onOpenBrands } = props
  const { draft, setAvailableOnly } = useSearchFilterDraft()

  const categoryCount = draft.categoryIds.size
  const brandCount = draft.brandIds.size

  const categoryCountLabel = categoryCount.toLocaleString('fa-IR')
  const brandCountLabel = brandCount.toLocaleString('fa-IR')

  return (
    <div className="flex flex-col gap-2">
      <section className="flex items-center justify-between gap-3 px-2 py-2">
        <div className="typo-body-medium text-text-primary min-w-0">
          فقط کالاهای موجود
        </div>
        <Switch
          checked={draft.availableOnly}
          onCheckedChange={setAvailableOnly}
          aria-label="فقط کالاهای موجود"
        />
      </section>

      <Button
        type="button"
        variant="text"
        className="typo-body-medium text-text-primary h-auto min-h-11 w-full justify-between px-2 py-3"
        endIcon={
          <span className="flex shrink-0 items-center gap-2">
            {categoryCount > 0 ? (
              <Chip
                as="span"
                variant="soft"
                size="small"
                content={categoryCountLabel}
                aria-label={`${categoryCountLabel} دسته انتخاب شده`}
              />
            ) : null}
            <RiArrowLeftSLine
              className="text-text-secondary size-5 shrink-0"
              aria-hidden
            />
          </span>
        }
        onClick={onOpenCategories}
      >
        دسته‌بندی‌ها
      </Button>

      <Button
        type="button"
        variant="text"
        className="typo-body-medium text-text-primary h-auto min-h-11 w-full justify-between px-2 py-3"
        endIcon={
          <span className="flex shrink-0 items-center gap-2">
            {brandCount > 0 ? (
              <Chip
                as="span"
                variant="soft"
                size="small"
                content={brandCountLabel}
                aria-label={`${brandCountLabel} برند انتخاب شده`}
              />
            ) : null}
            <RiArrowLeftSLine
              className="text-text-secondary size-5 shrink-0"
              aria-hidden
            />
          </span>
        }
        onClick={onOpenBrands}
      >
        برند
      </Button>
    </div>
  )
}

export default FilterSheetRootPanel
