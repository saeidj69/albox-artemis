'use client'

import { useEffect, useState } from 'react'

/**
 * True when the page is visible and the window has focus.
 *
 * Chrome often keeps `visibilityState === 'visible'` when the window blurs
 * (other app/window). Relying on visibility alone never flips false → true,
 * so regain detection stalls. Pair with `document.hasFocus()`.
 */
function getIsWindowFocused() {
  if (typeof document === 'undefined') return true
  if (document.visibilityState === 'hidden') return false
  return document.hasFocus()
}

function subscribeWindowFocus(onChange: (focused: boolean) => void) {
  let previouslyFocused = getIsWindowFocused()

  const sync = () => {
    const next = getIsWindowFocused()
    if (next === previouslyFocused) return
    previouslyFocused = next
    onChange(next)
  }

  const capture = true

  document.addEventListener('visibilitychange', sync)
  window.addEventListener('focus', sync, capture)
  window.addEventListener('blur', sync, capture)
  window.addEventListener('pageshow', sync)
  window.addEventListener('pagehide', sync)
  // Page Lifecycle API (Chromium) — tab freeze / resume
  document.addEventListener('freeze', sync)
  document.addEventListener('resume', sync)

  return () => {
    document.removeEventListener('visibilitychange', sync)
    window.removeEventListener('focus', sync, capture)
    window.removeEventListener('blur', sync, capture)
    window.removeEventListener('pageshow', sync)
    window.removeEventListener('pagehide', sync)
    document.removeEventListener('freeze', sync)
    document.removeEventListener('resume', sync)
  }
}

/** Current window focus state (`visibility` + `document.hasFocus()`). */
export function useWindowFocus() {
  const [focused, setFocused] = useState(getIsWindowFocused)

  useEffect(() => subscribeWindowFocus(setFocused), [])

  return focused
}

/**
 * Fires `onFocus` when the window regains focus (was unfocused → focused).
 * Tracks previous state inside the event subscription — no React render lag.
 */
export function useOnWindowFocus(onFocus: () => void) {
  useEffect(() => {
    return subscribeWindowFocus((focused) => {
      if (focused) onFocus()
    })
  }, [onFocus])
}
