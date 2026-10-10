'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'

import type { FilterSheetPanel } from '@/modules/search/components/FilterSheet/filter-sheet-types'
import { useSearchFilterDraft } from '@/modules/search/hooks/use-search-filter-draft'

import { createSheet, Sheet, SheetHeader, useSheet } from '@/lib/Sheet'
import {
  parseListingFiltersFromRoute,
  type ListingFiltersRouteSearchParams,
} from '@/lib/utils/listing-filters-query'

import FilterSheetBrandsPanel from './components/filter-sheet-brands-panel'
import FilterSheetCategoriesPanel from './components/filter-sheet-categories-panel'
import FilterSheetFooter from './components/filter-sheet-footer'
import FilterSheetHeader from './components/filter-sheet-header'
import FilterSheetRootPanel from './components/filter-sheet-root-panel'
import FilterSheetScrollBody from './components/filter-sheet-scroll-body'

type FilterSheetProps = {
  searchParams: ListingFiltersRouteSearchParams
}

function FilterSheetComponent(props: FilterSheetProps) {
  const { searchParams } = props
  const router = useRouter()
  const sheet = useSheet()
  const { draft, syncFromSearchParams } = useSearchFilterDraft()

  const [panel, setPanel] = useState<FilterSheetPanel>('root')

  const wasSheetVisibleRef = useRef(false)

  useEffect(() => {
    if (sheet.visible) {
      if (!wasSheetVisibleRef.current) {
        wasSheetVisibleRef.current = true
        const frame = requestAnimationFrame(() => {
          setPanel('root')
          syncFromSearchParams(searchParams)
        })
        return () => cancelAnimationFrame(frame)
      }
    } else {
      wasSheetVisibleRef.current = false
    }
  }, [searchParams, sheet.visible, syncFromSearchParams])

  const openCategoriesPanel = useCallback(() => {
    setPanel('categories')
  }, [])

  const openBrandsPanel = useCallback(() => {
    setPanel('brands')
  }, [])

  const goRoot = useCallback(() => {
    setPanel('root')
  }, [])

  const handleDiscard = useCallback(() => {
    syncFromSearchParams(searchParams)
  }, [searchParams, syncFromSearchParams])

  const handleSubmit = useCallback(() => {
    const parsed = parseListingFiltersFromRoute(searchParams)
    router.replace(
      ROUTES.search({
        ...parsed,
        categories:
          draft.categoryIds.size > 0 ? [...draft.categoryIds] : undefined,
        brands: draft.brandIds.size > 0 ? [...draft.brandIds] : undefined,
        inStock: draft.availableOnly ? true : undefined,
      }),
    )
    sheet.hide()
  }, [draft, router, searchParams, sheet])

  const filterPanelSubtitle = useMemo(() => {
    if (panel === 'categories') return 'دسته‌بندی‌ها'
    if (panel === 'brands') return 'برند'
    return undefined
  }, [panel])

  const sheetDescription = filterPanelSubtitle ?? 'فیلتر نتایج جست‌وجو'

  return (
    <Sheet
      title="فیلتر"
      description={sheetDescription}
      open={sheet.visible}
      onClose={() => {
        goRoot()
      }}
    >
      <div className="flex h-[80vh] max-h-[80vh] flex-col gap-0 overflow-hidden p-0">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SheetHeader title="فیلتر" showClose onClose={goRoot} />
          <FilterSheetHeader
            subtitle={filterPanelSubtitle}
            onBack={panel === 'root' ? undefined : goRoot}
          />

          <FilterSheetScrollBody>
            {panel === 'root' ? (
              <FilterSheetRootPanel
                onOpenCategories={openCategoriesPanel}
                onOpenBrands={openBrandsPanel}
              />
            ) : null}

            {panel === 'categories' ? <FilterSheetCategoriesPanel /> : null}

            {panel === 'brands' ? (
              <FilterSheetBrandsPanel
                queryEnabled={sheet.visible && panel === 'brands'}
              />
            ) : null}
          </FilterSheetScrollBody>

          <FilterSheetFooter
            onDiscard={handleDiscard}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </Sheet>
  )
}

const FilterSheet = createSheet(FilterSheetComponent)

export default FilterSheet
