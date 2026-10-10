import type { ChangeEvent, HTMLAttributes, KeyboardEventHandler } from 'react'

import type { SearchInputSlots } from './variants'

type SearchInputBase = {
  className?: string
  classNames?: Partial<Record<SearchInputSlots, string>>
  'aria-label'?: string
  /**
   * Native `placeholder` on the input. When omitted, the default empty-state
   * overlay (“جستجو در” + logo) is shown instead.
   */
  placeholder?: string
  autoFocus?: boolean
}

export type SearchInputNavigateProps = SearchInputBase & {
  navigateToExplore: true
}

export type SearchInputActiveProps = SearchInputBase & {
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
  /**
   * If the input is in error state
   */
  error?: boolean
  /**
   * Helper text rendered under the field (styled as error when `error` is set)
   */
  helperText?: string
}

export type SearchInputProps = SearchInputNavigateProps | SearchInputActiveProps

export function isSearchInputNavigateProps(
  props: SearchInputProps,
): props is SearchInputNavigateProps {
  return (
    'navigateToExplore' in props &&
    (props as SearchInputNavigateProps).navigateToExplore === true
  )
}
