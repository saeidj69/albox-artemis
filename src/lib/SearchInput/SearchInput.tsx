'use client'

import { type FC, useCallback, useEffect, useId, useRef, useState } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import { RiCloseLine, RiInformationLine, RiSearchLine } from '@remixicon/react'

import AspectRatio from '@/lib/AspectRatio'
import { cn } from '@/lib/utils'

import type { SearchInputProps } from './types'
import { isSearchInputNavigateProps } from './types'
import { searchInputVariants } from './variants'

/**
 * Search field chrome: icon, optional clear, optional `placeholder` or default logo overlay.
 * With `navigateToExplore: true`, opens `/explore` on interaction (non-editable).
 * Otherwise controlled via `value` / `onChange`.
 */
const SearchInputComponent: FC<SearchInputProps> = (props) => {
  const {
    className,
    classNames,
    'aria-label': ariaLabel = 'جست‌وجو',
    placeholder: placeholderProp,
  } = props

  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const helperTextId = useId()

  const [isFocused, setIsFocused] = useState(false)

  const navigateMode = isSearchInputNavigateProps(props)
  const error = !navigateMode && !!props.error
  const helperText = navigateMode ? undefined : props.helperText
  const slots = searchInputVariants({ navigateMode, error })

  const value = navigateMode ? '' : props.value
  const showClear = !navigateMode && value.trim().length > 0

  const hasCustomPlaceholder = placeholderProp !== undefined
  const inputPlaceholder = hasCustomPlaceholder ? placeholderProp : undefined

  const showPlaceholderGraphic =
    !hasCustomPlaceholder && !isFocused && (navigateMode || value.length === 0)

  const inputSlots = searchInputVariants({
    navigateMode,
    showPlaceholderGraphic,
    error,
  })

  const goExplore = useCallback(() => {
    router.push(ROUTES.EXPLORE)
  }, [router])

  const handleChromePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (!navigateMode) return
    const target = event.target as HTMLElement
    if (target.closest('[data-slot="search-input-clear"]')) return
    event.preventDefault()
    goExplore()
  }

  const handleClear = () => {
    if (navigateMode) return
    props.onChange({
      target: { value: '' },
      currentTarget: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  useEffect(() => {
    if (props?.autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 500)
    }
  }, [props.autoFocus])

  return (
    <div
      data-slot="search-input"
      className={slots.root({ className: cn(className, classNames?.root) })}
      onPointerDown={handleChromePointerDown}
    >
      <div
        data-slot="search-input-field"
        className={slots.field({ className: classNames?.field })}
      >
        <div
          data-slot="search-input-content"
          className={slots.content({ className: classNames?.content })}
        >
          <RiSearchLine
            data-slot="search-input-icon"
            className={slots.icon({ className: classNames?.icon })}
            aria-hidden
          />

          <input
            type="text"
            value={value}
            ref={inputRef}
            readOnly={navigateMode}
            tabIndex={navigateMode ? -1 : undefined}
            autoFocus={!navigateMode && props.autoFocus}
            placeholder={inputPlaceholder}
            inputMode={navigateMode ? undefined : props.inputMode}
            onChange={navigateMode ? undefined : props.onChange}
            onKeyDown={navigateMode ? undefined : props.onKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoComplete="off"
            role="searchbox"
            aria-label={ariaLabel}
            aria-invalid={error || undefined}
            aria-describedby={helperText ? helperTextId : undefined}
            className={inputSlots.input({ className: classNames?.input })}
          />

          {showClear ? (
            <button
              type="button"
              data-slot="search-input-clear"
              className={slots.clearButton({
                className: classNames?.clearButton,
              })}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation()
                handleClear()
              }}
              aria-label="پاک کردن"
            >
              <RiCloseLine
                data-slot="search-input-clear-icon"
                className={slots.clearIcon({
                  className: classNames?.clearIcon,
                })}
              />
            </button>
          ) : null}
        </div>

        {showPlaceholderGraphic ? (
          <div
            data-slot="search-input-placeholder"
            className={slots.placeholder({
              className: classNames?.placeholder,
            })}
            aria-hidden
          >
            <span>جستجو در</span>
            <div
              className={slots.placeholderLogoWrapper({
                className: classNames?.placeholderLogoWrapper,
              })}
            >
              <AspectRatio ratio={161 / 43}>
                <Image
                  fill
                  alt=""
                  sizes="25vw"
                  loading="eager"
                  src="/images/logo-type.svg"
                />
              </AspectRatio>
            </div>
          </div>
        ) : null}
      </div>

      {helperText ? (
        <div
          data-slot="search-input-helper-text-wrapper"
          className={slots.helperTextWrapper({
            className: classNames?.helperTextWrapper,
          })}
        >
          <RiInformationLine
            data-slot="search-input-helper-text-icon"
            className={slots.helperTextIcon({
              className: classNames?.helperTextIcon,
            })}
            aria-hidden
          />
          <p
            id={helperTextId}
            data-slot="search-input-helper-text"
            role={error ? 'alert' : undefined}
            className={slots.helperText({ className: classNames?.helperText })}
          >
            {helperText}
          </p>
        </div>
      ) : null}
    </div>
  )
}

export default SearchInputComponent
