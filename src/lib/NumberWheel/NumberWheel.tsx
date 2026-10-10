'use client'

import {
  type CSSProperties,
  type FC,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'

import { cn } from '../utils'
import type { NumberWheelProps } from './types'
import { numberWheelVariants } from './variants'

const DEFAULT_ITEM_WIDTH = 56
const DEFAULT_HEIGHT = 72
const DEFAULT_HIGHLIGHT = 48

/**
 * Horizontal drum-style number picker. Momentum, snapping, and touch/trackpad
 * gestures come from native CSS `overflow-x` + `scroll-snap`. JS only adds
 * what the browser doesn't: (1) mouse-wheel → horizontal scroll translation,
 * (2) mouse click-drag to spin with smooth snap on release, and (3)
 * rAF-throttled active-index tracking via a direct `data-active` attribute
 * mutation (no React re-render during the spin).
 */
const NumberWheel: FC<NumberWheelProps> = (props) => {
  const {
    min,
    max,
    value,
    defaultValue,
    onChange,
    formatter = String,
    itemWidth = DEFAULT_ITEM_WIDTH,
    height = DEFAULT_HEIGHT,
    highlightSize = DEFAULT_HIGHLIGHT,
    className,
    classNames,
    style,
    ...rest
  } = props

  const trackRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<Array<HTMLDivElement | null>>([])
  const rafRef = useRef<number | null>(null)
  const activeIdxRef = useRef(-1)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startScrollLeft: number
  } | null>(null)

  const slots = numberWheelVariants()

  const numbers = useMemo(() => {
    const arr: number[] = []
    for (let n = min; n <= max; n++) arr.push(n)
    return arr
  }, [min, max])
  const count = numbers.length

  const clampIdx = useCallback(
    (n: number) => Math.max(0, Math.min(n - min, count - 1)),
    [min, count],
  )

  const activate = useCallback((idx: number) => {
    if (idx === activeIdxRef.current) return
    const prev = activeIdxRef.current
    if (prev >= 0) itemsRef.current[prev]?.removeAttribute('data-active')
    itemsRef.current[idx]?.setAttribute('data-active', 'true')
    activeIdxRef.current = idx
  }, [])

  // Initial scroll position (uncontrolled) — runs once after layout so the
  // track has its final width; no padding measurement is needed because the
  // centering is pure CSS.
  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return
    const initial = value ?? defaultValue ?? min
    const idx = clampIdx(initial)
    el.scrollLeft = idx * itemWidth
    activate(idx)
    // Intentionally run once on mount — `value` changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Controlled value sync — smooth-scroll to match external value changes.
  useEffect(() => {
    if (value === undefined) return
    const el = trackRef.current
    if (!el) return
    const idx = clampIdx(value)
    if (idx === activeIdxRef.current) return
    el.scrollTo({ left: idx * itemWidth, behavior: 'smooth' })
  }, [value, itemWidth, clampIdx])

  // rAF-throttled scroll listener: rounds scrollLeft to an index, mutates
  // `data-active` directly, and fires onChange only when the index flips.
  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const el = trackRef.current
      if (!el) return
      const idx = Math.max(
        0,
        Math.min(Math.round(el.scrollLeft / itemWidth), count - 1),
      )
      if (idx !== activeIdxRef.current) {
        activate(idx)
        onChange?.(min + idx)
      }
    })
  }, [count, itemWidth, min, onChange, activate])

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    },
    [],
  )

  // Mouse wheel → horizontal scroll. Attached natively so we can
  // preventDefault with { passive: false }. Skipped when the user is already
  // scrolling horizontally (e.g. trackpad two-finger swipe) so we don't
  // double up.
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      if (e.deltaY === 0) return
      e.preventDefault()
      el.scrollBy({ left: e.deltaY, behavior: 'auto' })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Pointer drag — runs for mouse, touch, and pen uniformly. Touch needs the
  // JS path because vaul injects `[data-vaul-drawer]{touch-action:none}`,
  // which kills native horizontal scroll on every descendant inside the
  // drawer. Programmatic `scrollLeft` and scroll-snap still work.
  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      const el = trackRef.current
      if (!el) return
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startScrollLeft: el.scrollLeft,
      }
      el.setPointerCapture(e.pointerId)
      el.dataset.dragging = 'true'
      el.style.scrollSnapType = 'none'
    },
    [],
  )

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current
      if (!drag || e.pointerId !== drag.pointerId) return
      const el = trackRef.current
      if (!el) return
      el.scrollLeft = drag.startScrollLeft - (e.clientX - drag.startX)
    },
    [],
  )

  const endDrag = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current
      if (!drag || e.pointerId !== drag.pointerId) return
      const el = trackRef.current
      dragRef.current = null
      if (!el) return
      try {
        el.releasePointerCapture(drag.pointerId)
      } catch {
        // pointer may already be released; safe to ignore.
      }
      delete el.dataset.dragging
      el.style.scrollSnapType = ''
      const target = Math.round(el.scrollLeft / itemWidth) * itemWidth
      el.scrollTo({ left: target, behavior: 'smooth' })
    },
    [itemWidth],
  )

  const rootStyle: CSSProperties = {
    ['--nw-item' as string]: `${itemWidth}px`,
    ['--nw-height' as string]: `${height}px`,
    ['--nw-highlight' as string]: `${highlightSize}px`,
    ...style,
  }

  return (
    <div
      data-slot="number-wheel"
      className={cn(slots.root({ className: classNames?.root }), className)}
      style={rootStyle}
      dir="ltr"
      {...rest}
    >
      <div
        aria-hidden
        data-slot="number-wheel-highlight"
        className={slots.highlight({ className: classNames?.highlight })}
      />

      <div
        ref={trackRef}
        data-slot="number-wheel-track"
        data-vaul-no-drag
        className={slots.track({ className: classNames?.track })}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {numbers.map((n, i) => (
          <div
            key={n}
            ref={(el) => {
              itemsRef.current[i] = el
            }}
            data-slot="number-wheel-item"
            className={slots.item({ className: classNames?.item })}
          >
            {formatter(n)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default NumberWheel
