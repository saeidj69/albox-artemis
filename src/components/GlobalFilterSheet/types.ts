import type { ReactNode } from 'react'

import type { ListingBrand, ListingCategory } from '@/api/models'

type UnionToIntersection<U> = (
  U extends unknown ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never

type SliceForOption<O> = O extends { kind: 'brands' }
  ? { brandIds: number[] }
  : O extends { kind: 'categories' }
    ? { categoryIds: number[] }
    : O extends { kind: 'available' }
      ? { availableOnly: boolean }
      : O extends { kind: 'priceRange' }
        ? { priceRange: { min: number; max: number } }
        : O extends {
              kind: 'custom'
              id: infer Id extends string
              defaultValue: infer V
            }
          ? Record<Id, V>
          : never

export type InferSubmitValues<O extends readonly GlobalFilterOption[]> = [
  O[number],
] extends [never]
  ? Record<string, never>
  : UnionToIntersection<SliceForOption<O[number]>>

type BaseOption = {
  id: string
  label: string
  /** Title shown in drill-in header animation; defaults to `label`. */
  detailTitle?: string
}

export type GlobalFilterAvailableOption = BaseOption & {
  kind: 'available'
  /** Row label (defaults applied in UI if omitted). */
  availableLabel?: string
}

export type GlobalFilterBrandsOption = BaseOption & {
  kind: 'brands'
  brands: ListingBrand[]
  isLoading?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
}

export type GlobalFilterCategoriesOption = BaseOption & {
  kind: 'categories'
  nodes: ListingCategory[]
  isLoading?: boolean
}

export type GlobalFilterPriceRangeOption = BaseOption & {
  kind: 'priceRange'
  min: number
  max: number
  step?: number
  formatValue?: (value: number) => string
}

export type GlobalFilterCustomOption<T = unknown> = BaseOption & {
  kind: 'custom'
  defaultValue: T
  render: (api: {
    value: T
    setValue: (v: T) => void
    goBack: () => void
  }) => ReactNode
}

export type GlobalFilterOption =
  | GlobalFilterAvailableOption
  | GlobalFilterBrandsOption
  | GlobalFilterCategoriesOption
  | GlobalFilterPriceRangeOption
  | GlobalFilterCustomOption

export function isDrillInOption(option: GlobalFilterOption): boolean {
  return option.kind !== 'available'
}
