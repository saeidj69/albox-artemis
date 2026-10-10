'use client'

import type { FC, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { RiArrowLeftSLine } from '@remixicon/react'

import HeaderAnimatedTitle from '@/components/Header/components/HeaderAnimatedTitle'

import Button from '@/lib/Button'
import Chip from '@/lib/Chip'
import {
  createSheet,
  Sheet,
  SheetFooter,
  SheetHeader,
  showSheet,
  useSheet,
} from '@/lib/Sheet'
import Switch from '@/lib/Switch'

import { cloneSubmitValues } from './clone-submit-values'
import GlobalFilterBackRow from './global-filter-back-row'
import GlobalFilterBrandsBody from './global-filter-brands-body'
import GlobalFilterCategoriesBody from './global-filter-categories-body'
import GlobalFilterCustomBody from './global-filter-custom-body'
import GlobalFilterPriceRangeBody from './global-filter-price-range-body'
import type { GlobalFilterOption, InferSubmitValues } from './types'
import { isDrillInOption } from './types'

export type GlobalFilterSheetProps<
  O extends readonly GlobalFilterOption[] = readonly GlobalFilterOption[],
> = {
  title: string
  options: O
  initialDraft: InferSubmitValues<O>
  onSubmit: (values: InferSubmitValues<O>) => void
  onDiscard?: () => void
}

function FilterSheetScrollBody({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 [-webkit-overflow-scrolling:touch]">
      {children}
    </div>
  )
}

function GlobalFilterSheetInner<O extends readonly GlobalFilterOption[]>(
  props: GlobalFilterSheetProps<O>,
) {
  const { title, options, initialDraft, onSubmit, onDiscard } = props
  const sheet = useSheet()

  const [activePanel, setActivePanel] = useState<string>('root')
  const [draft, setDraft] = useState<Record<string, unknown>>({})
  const baselineRef = useRef<Record<string, unknown>>({})
  const wasVisibleRef = useRef(false)

  const goRoot = useCallback(() => {
    setActivePanel('root')
  }, [])

  useEffect(() => {
    if (sheet.visible && !wasVisibleRef.current) {
      wasVisibleRef.current = true
      const frame = requestAnimationFrame(() => {
        const next = cloneSubmitValues(
          initialDraft as InferSubmitValues<typeof options>,
        ) as Record<string, unknown>
        baselineRef.current = cloneSubmitValues(
          initialDraft as InferSubmitValues<typeof options>,
        ) as Record<string, unknown>
        setDraft(next as Record<string, unknown>)
        setActivePanel('root')
      })
      return () => cancelAnimationFrame(frame)
    }
    if (!sheet.visible) {
      wasVisibleRef.current = false
    }
    return undefined
  }, [sheet.visible, initialDraft])

  const activeOption = useMemo(
    () => options.find((o) => o.id === activePanel) ?? null,
    [options, activePanel],
  )

  const sheetDescription = useMemo(() => {
    if (activePanel === 'root') return title
    if (activeOption) {
      return activeOption.detailTitle ?? activeOption.label
    }
    return title
  }, [activePanel, activeOption, title])

  const secondaryAnimatedTitle =
    activeOption?.detailTitle ?? activeOption?.label ?? ''

  const toggleBrandId = useCallback((id: number) => {
    setDraft((prev) => {
      const raw = prev.brandIds
      const list = Array.isArray(raw) ? [...(raw as number[])] : []
      const ix = list.indexOf(id)
      if (ix >= 0) list.splice(ix, 1)
      else list.push(id)
      return { ...prev, brandIds: list }
    })
  }, [])

  const toggleCategoryId = useCallback((id: number) => {
    setDraft((prev) => {
      const raw = prev.categoryIds
      const list = Array.isArray(raw) ? [...(raw as number[])] : []
      const ix = list.indexOf(id)
      if (ix >= 0) list.splice(ix, 1)
      else list.push(id)
      return { ...prev, categoryIds: list }
    })
  }, [])

  const setAvailableOnly = useCallback((value: boolean) => {
    setDraft((prev) => ({ ...prev, availableOnly: value }))
  }, [])

  const setPriceRange = useCallback((min: number, max: number) => {
    setDraft((prev) => ({
      ...prev,
      priceRange: { min, max },
    }))
  }, [])

  const setCustomValue = useCallback((id: string, value: unknown) => {
    setDraft((prev) => ({ ...prev, [id]: value }))
  }, [])

  const handleDiscard = useCallback(() => {
    setDraft(
      cloneSubmitValues(baselineRef.current as InferSubmitValues<O>) as Record<
        string,
        unknown
      >,
    )
    onDiscard?.()
    void sheet.hide()
  }, [onDiscard, sheet])

  const handleSubmit = useCallback(() => {
    const normalizedDraft = options.reduce<Record<string, unknown>>(
      (acc, option) => {
        switch (option.kind) {
          case 'brands':
            acc.brandIds = Array.isArray(draft.brandIds)
              ? draft.brandIds
              : Array.isArray(acc.brandIds)
                ? acc.brandIds
                : []
            return acc
          case 'categories':
            acc.categoryIds = Array.isArray(draft.categoryIds)
              ? draft.categoryIds
              : Array.isArray(acc.categoryIds)
                ? acc.categoryIds
                : []
            return acc
          case 'available':
            acc.availableOnly = Boolean(
              draft.availableOnly ?? acc.availableOnly,
            )
            return acc
          case 'priceRange': {
            const nextRange = draft.priceRange as
              | { min?: number; max?: number }
              | undefined
            const prevRange = acc.priceRange as
              | { min?: number; max?: number }
              | undefined
            acc.priceRange = {
              min: nextRange?.min ?? prevRange?.min ?? option.min,
              max: nextRange?.max ?? prevRange?.max ?? option.max,
            }
            return acc
          }
          case 'custom':
            acc[option.id] =
              draft[option.id] === undefined
                ? option.defaultValue
                : draft[option.id]
            return acc
          default:
            return acc
        }
      },
      {
        ...(baselineRef.current ?? {}),
      },
    )

    onSubmit(normalizedDraft as InferSubmitValues<O>)
    void sheet.hide()
  }, [draft, onSubmit, options, sheet])

  const brandIds = useMemo(
    () => (draft.brandIds as number[] | undefined) ?? [],
    [draft.brandIds],
  )
  const categoryIds = useMemo(
    () => (draft.categoryIds as number[] | undefined) ?? [],
    [draft.categoryIds],
  )
  const availableOnly = Boolean(draft.availableOnly)
  const priceRange = draft.priceRange as
    | { min: number; max: number }
    | undefined

  const brandIdSet = useMemo(() => new Set(brandIds), [brandIds])
  const categoryIdSet = useMemo(() => new Set(categoryIds), [categoryIds])

  const renderRoot = () => (
    <div className="flex flex-col gap-2">
      {[...options]
        .sort((a, b) => {
          if (a.kind === 'available' && b.kind !== 'available') return 1
          if (a.kind !== 'available' && b.kind === 'available') return -1
          return 0
        })
        .map((option) => {
          if (option.kind === 'available') {
            const rowLabel = option.availableLabel ?? 'فقط کالاهای موجود'
            return (
              <section
                key={option.id}
                className="flex items-center justify-between gap-3 px-2 py-2"
              >
                <div className="typo-body-medium min-w-0">{rowLabel}</div>
                <Switch
                  checked={availableOnly}
                  onCheckedChange={setAvailableOnly}
                  aria-label={rowLabel}
                />
              </section>
            )
          }

          if (!isDrillInOption(option)) return null

          let chip: ReactNode = null
          let showActiveDot = false

          if (option.kind === 'brands') {
            const n = brandIds.length
            if (n > 0) {
              const label = n.toLocaleString('fa-IR')
              chip = (
                <Chip
                  as="span"
                  variant="primary"
                  size="small"
                  content={label}
                  aria-label={`${label} برند انتخاب شده`}
                />
              )
            }
          } else if (option.kind === 'categories') {
            const n = categoryIds.length
            if (n > 0) {
              const label = n.toLocaleString('fa-IR')
              chip = (
                <Chip
                  as="span"
                  variant="soft"
                  size="small"
                  content={label}
                  aria-label={`${label} دسته انتخاب شده`}
                />
              )
            }
          } else if (option.kind === 'priceRange') {
            const currentMin = priceRange?.min ?? option.min
            const currentMax = priceRange?.max ?? option.max
            showActiveDot = currentMin > option.min || currentMax < option.max
          }

          return (
            <Button
              key={option.id}
              type="button"
              variant="text"
              className="typo-body-medium w-full justify-between px-2"
              classNames={{
                content: 'text-black',
                endIcon: 'w-auto',
              }}
              endIcon={
                <span className="flex shrink-0 items-center gap-1">
                  {showActiveDot ? (
                    <span
                      className="bg-primary-600 size-2 rounded-full"
                      aria-label="بازه قیمت انتخاب شده"
                    />
                  ) : null}
                  {chip}
                  <RiArrowLeftSLine
                    className="text-text-secondary size-5 shrink-0"
                    aria-hidden
                  />
                </span>
              }
              onClick={() => setActivePanel(option.id)}
            >
              {option.label}
            </Button>
          )
        })}
    </div>
  )

  const renderDrillIn = () => {
    if (!activeOption) return null

    switch (activeOption.kind) {
      case 'brands':
        return (
          <GlobalFilterBrandsBody
            brands={activeOption.brands}
            isLoading={activeOption.isLoading}
            hasNextPage={activeOption.hasNextPage}
            isFetchingNextPage={activeOption.isFetchingNextPage}
            onLoadMore={activeOption.onLoadMore}
            selectedIds={brandIdSet}
            onToggle={toggleBrandId}
          />
        )
      case 'categories': {
        return (
          <GlobalFilterCategoriesBody
            nodes={activeOption.nodes}
            isLoading={activeOption.isLoading}
            selectedIds={categoryIdSet}
            onToggleCategory={toggleCategoryId}
          />
        )
      }
      case 'priceRange': {
        return (
          <GlobalFilterPriceRangeBody
            option={activeOption}
            value={priceRange}
            onChange={setPriceRange}
          />
        )
      }
      case 'custom': {
        const v = draft[activeOption.id]
        const value =
          v === undefined
            ? activeOption.defaultValue
            : (v as typeof activeOption.defaultValue)
        return (
          <GlobalFilterCustomBody
            option={activeOption}
            value={value}
            onChange={(next) => setCustomValue(activeOption.id, next)}
            goBack={goRoot}
          />
        )
      }
      default:
        return null
    }
  }
  return (
    <Sheet
      title={title}
      description={sheetDescription}
      open={sheet.visible}
      onClose={goRoot}
    >
      <div className="flex h-[80vh] max-h-[80vh] flex-col gap-0 overflow-hidden p-0">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SheetHeader
            title={
              <div className="w-app w-screen">
                <HeaderAnimatedTitle
                  primaryTitle={title}
                  secondaryTitle={secondaryAnimatedTitle}
                  isPrimaryVisible={activePanel === 'root'}
                />
              </div>
            }
            showClose
            onClose={goRoot}
          />
          {activePanel !== 'root' ? (
            <GlobalFilterBackRow onBack={goRoot} />
          ) : null}

          <FilterSheetScrollBody>
            {activePanel === 'root' ? renderRoot() : renderDrillIn()}
          </FilterSheetScrollBody>

          <SheetFooter className="border-border-main bg-background-main shrink-0 border-t px-4 py-3">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="primary"
                className="min-w-0 flex-1"
                onClick={handleSubmit}
              >
                اعمال فیلتر
              </Button>
              <Button
                type="button"
                variant="text"
                className="min-w-0 flex-1"
                onClick={handleDiscard}
              >
                حذف فیلتر‌ها
              </Button>
            </div>
          </SheetFooter>
        </div>
      </div>
    </Sheet>
  )
}

const GlobalFilterSheetModal = createSheet(
  GlobalFilterSheetInner as FC<
    GlobalFilterSheetProps<readonly GlobalFilterOption[]>
  >,
)

export function showGlobalFilterSheet<
  const O extends readonly GlobalFilterOption[],
>(props: GlobalFilterSheetProps<O>): void {
  showSheet(
    GlobalFilterSheetModal,
    props as GlobalFilterSheetProps<readonly GlobalFilterOption[]>,
  )
}

export { GlobalFilterSheetModal }
