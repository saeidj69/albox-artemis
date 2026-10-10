'use client'

import type { ListingBrand } from '@/api/models'

import Button from '@/lib/Button'
import Checkbox from '@/lib/Checkbox'

export type BrandFilterListProps = {
  brands: ListingBrand[]
  selectedIds: Set<number>
  onToggle: (id: number) => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  showLoadMore: boolean
}

const BrandFilterList = (props: BrandFilterListProps) => {
  const {
    brands,
    selectedIds,
    onToggle,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
    showLoadMore,
  } = props

  if (brands.length === 0) {
    return (
      <p className="typo-body-small text-text-secondary py-8 text-center">
        برندی پیدا نشد
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1" role="list">
      {brands.map((brand) => (
        <label
          key={brand.id}
          className="rounded-brand flex cursor-pointer items-center gap-3 px-2 py-2.5"
        >
          <Checkbox
            checked={selectedIds.has(brand.id)}
            onCheckedChange={(value) => {
              if (value === 'indeterminate') return
              onToggle(brand.id)
            }}
            aria-label={brand.name}
          />
          <span className="typo-body-medium text-text-primary min-w-0 flex-1 text-start">
            {brand.name}
          </span>
        </label>
      ))}

      {showLoadMore && hasNextPage ? (
        <Button
          type="button"
          variant="text"
          size="small"
          className="typo-body-small mt-2 self-center"
          loading={isFetchingNextPage}
          disabled={isFetchingNextPage}
          onClick={() => onLoadMore()}
        >
          نمایش بیشتر
        </Button>
      ) : null}
    </div>
  )
}

export default BrandFilterList
