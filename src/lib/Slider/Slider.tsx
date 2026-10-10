'use client'

import * as React from 'react'

import { Slider as SliderPrimitive } from 'radix-ui'

import { cn } from '../utils'
import type { SliderProps } from './types'
import { sliderVariants } from './variants'

/**
 * # Slider
 * @param props - SliderProps
 * @description Range input for selecting one or two values along a track.
 * @example
 * <Slider defaultValue={[50]} max={100} step={1} />
 * <Slider defaultValue={[25, 75]} max={100} step={1} />
 */
const SliderComponent = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>((props, ref) => {
  const {
    className,
    classNames,
    defaultValue,
    value,
    min = 0,
    max = 100,
    ...otherProps
  } = props

  const thumbValues = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  )

  const slots = sliderVariants()

  return (
    <SliderPrimitive.Root
      ref={ref}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={slots.root({
        className: cn(className, classNames?.root),
      })}
      {...otherProps}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={slots.track({ className: classNames?.track })}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={slots.range({ className: classNames?.range })}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbValues.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={slots.thumb({ className: classNames?.thumb })}
        />
      ))}
    </SliderPrimitive.Root>
  )
})

SliderComponent.displayName = 'Slider'

export default SliderComponent
