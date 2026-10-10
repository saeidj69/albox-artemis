'use client'

import { useMemo } from 'react'

import { englishDigits, formatPrice, onlyDigits } from '@/utils/numbers'

import Input from '@/lib/Input'
import Slider from '@/lib/Slider'

import type { GlobalFilterPriceRangeOption } from './types'

export type GlobalFilterPriceRangeBodyProps = {
  option: GlobalFilterPriceRangeOption
  value?: { min: number; max: number }
  onChange: (min: number, max: number) => void
}

const GlobalFilterPriceRangeBody = (props: GlobalFilterPriceRangeBodyProps) => {
  const { option, value, onChange } = props
  const minBound = option.min
  const maxBound = option.max
  const step = option.step ?? 1
  const current = value ?? { min: minBound, max: maxBound }
  const format =
    option.formatValue ?? ((n: number) => n.toLocaleString('fa-IR'))
  const rangeAria = option.detailTitle ?? option.label

  const unit = (
    <span className="text-text-secondary typo-body-small whitespace-nowrap">
      تومان
    </span>
  )

  const minInputValue = useMemo(
    () => (current.min > 0 ? formatPrice(current.min) : ''),
    [current.min],
  )
  const maxInputValue = useMemo(
    () => (current.max > 0 ? formatPrice(current.max) : ''),
    [current.max],
  )

  const handleMinInputChange = (rawValue: string) => {
    const digits = onlyDigits(englishDigits(rawValue))
    const nextMin = digits ? Number(digits) : minBound
    const clampedMin = Math.max(minBound, Math.min(nextMin, current.max))
    onChange(clampedMin, current.max)
  }

  const handleMaxInputChange = (rawValue: string) => {
    const digits = onlyDigits(englishDigits(rawValue))
    const nextMax = digits ? Number(digits) : maxBound
    const clampedMax = Math.min(maxBound, Math.max(nextMax, current.min))
    onChange(current.min, clampedMax)
  }

  return (
    <div className="flex flex-col gap-4 px-1 py-2">
      <div className="grid grid-cols-2 gap-2">
        <Input
          inputMode="numeric"
          value={minInputValue}
          onChange={(event) => handleMinInputChange(event.target.value)}
          aria-label="حداقل قیمت"
          start={unit}
          label="حداقل قیمت"
        />
        <Input
          inputMode="numeric"
          value={maxInputValue}
          onChange={(event) => handleMaxInputChange(event.target.value)}
          aria-label="حداکثر قیمت"
          start={unit}
          label="حداکثر قیمت"
        />
      </div>

      <div className="typo-body-small text-text-secondary flex justify-between gap-2">
        <span>{format(current.min)}</span>
        <span>{format(current.max)}</span>
      </div>
      <Slider
        min={minBound}
        max={maxBound}
        step={step}
        value={[current.min, current.max]}
        onValueChange={(vals) => {
          const [a, b] = vals
          if (typeof a === 'number' && typeof b === 'number') {
            onChange(a, b)
          }
        }}
        aria-label={rangeAria}
      />
    </div>
  )
}

export default GlobalFilterPriceRangeBody
