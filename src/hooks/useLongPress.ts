'use client'

import { useCallback, useEffect, useRef } from 'react'
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'

type UseLongPressOptions = {
  /** Short tap / synthetic click handler. */
  onClick?: (e: ReactMouseEvent) => void
  /** Fires when held for `duration` ms without breaking move threshold or pointer cancel (e.g. scroll). */
  onLongPress?: () => void
  duration?: number
  /** Maximum pointer drift in CSS px before cancelling (prevents scroll-from-button false long-press). */
  moveThreshold?: number
  /** When true, does not arm long press (short taps still run `onClick`). */
  disabled?: boolean
}

/**
 * Pointer-based long-press. Subscribes to `window` `pointermove` / `pointercancel` during the hold so
 * list scrolling cancels reliably even once the finger has left this element.
 */
export function useLongPress({
  onClick,
  onLongPress,
  duration = 450,
  moveThreshold = 12,
  disabled = false,
}: UseLongPressOptions) {
  const timerRef = useRef<number | null>(null)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const triggeredRef = useRef(false)
  const teardownDocListenersRef = useRef<(() => void) | null>(null)

  const removeDocListeners = useCallback(() => {
    teardownDocListenersRef.current?.()
    teardownDocListenersRef.current = null
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    startRef.current = null
    removeDocListeners()
  }, [removeDocListeners])

  useEffect(() => () => clearTimer(), [clearTimer])

  const armDocTracking = useCallback(() => {
    if (typeof window === 'undefined') return

    const onMove = (ev: PointerEvent) => {
      if (!startRef.current || timerRef.current === null) return
      const dx = ev.clientX - startRef.current.x
      const dy = ev.clientY - startRef.current.y
      if (dx * dx + dy * dy > moveThreshold * moveThreshold) {
        clearTimer()
      }
    }

    const onEnd = () => {
      clearTimer()
    }

    window.addEventListener('pointermove', onMove, {
      capture: true,
      passive: true,
    })
    window.addEventListener('pointerup', onEnd, {
      capture: true,
    })
    window.addEventListener('pointercancel', onEnd, {
      capture: true,
    })

    teardownDocListenersRef.current = () => {
      window.removeEventListener('pointermove', onMove, { capture: true })
      window.removeEventListener('pointerup', onEnd, { capture: true })
      window.removeEventListener('pointercancel', onEnd, {
        capture: true,
      })
    }
  }, [clearTimer, moveThreshold])

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (disabled) return
      if (e.pointerType === 'mouse' && e.button !== 0) return

      clearTimer()
      triggeredRef.current = false
      startRef.current = { x: e.clientX, y: e.clientY }
      armDocTracking()

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        removeDocListeners()

        triggeredRef.current = true

        const swallow = (evt: MouseEvent) => {
          evt.preventDefault()
          evt.stopPropagation()
          evt.stopImmediatePropagation()
        }
        window.addEventListener('click', swallow, {
          capture: true,
          once: true,
        })
        window.setTimeout(() => {
          window.removeEventListener('click', swallow, {
            capture: true,
          })
          triggeredRef.current = false
        }, 500)

        onLongPress?.()
      }, duration)
    },
    [
      armDocTracking,
      clearTimer,
      disabled,
      duration,
      onLongPress,
      removeDocListeners,
    ],
  )

  const handlePointerEnd = useCallback(() => {
    clearTimer()
  }, [clearTimer])

  const handleContextMenu = useCallback((e: ReactMouseEvent) => {
    e.preventDefault()
  }, [])

  const handleClick = useCallback(
    (e: ReactMouseEvent) => {
      if (triggeredRef.current) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      onClick?.(e)
    },
    [onClick],
  )

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerEnd,
    onPointerLeave: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
    onContextMenuCapture: handleContextMenu,
    onClick: handleClick,
  }
}
