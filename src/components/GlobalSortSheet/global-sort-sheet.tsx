'use client'

import type { FC } from 'react'

import { RiCheckLine } from '@remixicon/react'

import {
  createSheet,
  Sheet,
  SheetHeader,
  showSheet,
  useSheet,
} from '@/lib/Sheet'
import { cn } from '@/lib/utils'

export type GlobalSortOption<T extends string = string> = {
  value: T
  label: string
}

export type GlobalSortSheetProps<T extends string = string> = {
  title?: string
  description?: string
  options: readonly GlobalSortOption<T>[]
  selectedValue: T
  onSelect: (value: T) => void
}

function GlobalSortSheetInner<T extends string = string>(
  props: GlobalSortSheetProps<T>,
) {
  const {
    title = 'مرتب‌سازی',
    description = 'مرتب‌سازی نتایج',
    options,
    selectedValue,
    onSelect,
  } = props
  const sheet = useSheet()

  const handleSelect = (value: T) => {
    onSelect(value)
    sheet.hide()
  }

  return (
    <Sheet title={title} description={description}>
      <div className="flex flex-col">
        <SheetHeader title={title} showClose />

        <ul className="flex flex-col">
          {options.map((option, index) => {
            const active = option.value === selectedValue

            return (
              <li key={option.value} className="flex flex-col">
                {index > 0 && <div className="bg-border-lighter mx-4 h-px" />}

                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="flex w-full cursor-pointer items-center justify-between px-4 py-4"
                >
                  <span
                    className={cn(
                      'typo-body-medium',
                      active
                        ? 'text-primary-700 font-semibold'
                        : 'text-text-primary',
                    )}
                  >
                    {option.label}
                  </span>

                  {active ? (
                    <RiCheckLine className="text-primary-700 size-5" />
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </Sheet>
  )
}

const GlobalSortSheetModal = createSheet(
  GlobalSortSheetInner as FC<GlobalSortSheetProps<string>>,
)

export function showGlobalSortSheet<const T extends string = string>(
  props: GlobalSortSheetProps<T>,
): void {
  const normalizedProps: GlobalSortSheetProps<string> = {
    ...props,
    options: props.options.map((option) => ({
      value: option.value,
      label: option.label,
    })),
    selectedValue: props.selectedValue,
    onSelect: (value) => props.onSelect(value as T),
  }

  showSheet(GlobalSortSheetModal, normalizedProps)
}

export { GlobalSortSheetModal }
