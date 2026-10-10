'use client'

import { useEffect, useState } from 'react'

const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR

export type CountdownSegments = {
  /** Three values, most significant first. */
  values: [number, number, number]
  /** True while the values are days/hours/minutes instead of hours/minutes/seconds. */
  withDays: boolean
}

export type UseCountdownResult = {
  /** Seconds left, or `null` until the first client tick has run. */
  remaining: number | null
  segments: CountdownSegments | null
  isExpired: boolean
}

const remainingSeconds = (endsAt: number) =>
  Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))

/** Days/hours/minutes past the one-day mark, hours/minutes/seconds below it. */
export const toCountdownSegments = (remaining: number): CountdownSegments => {
  if (remaining >= SECONDS_PER_DAY) {
    return {
      values: [
        Math.floor(remaining / SECONDS_PER_DAY),
        Math.floor((remaining % SECONDS_PER_DAY) / SECONDS_PER_HOUR),
        Math.floor((remaining % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
      ],
      withDays: true,
    }
  }

  return {
    values: [
      Math.floor(remaining / SECONDS_PER_HOUR),
      Math.floor((remaining % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
      remaining % SECONDS_PER_MINUTE,
    ],
    withDays: false,
  }
}

/**
 * Ticks once a second down to `endsAt` and stops at zero.
 *
 * `remaining` stays `null` until the mount effect runs: `Date.now()` differs
 * between the server render and hydration, so the first paint must not depend
 * on it.
 */
export const useCountdown = (endsAt: number): UseCountdownResult => {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => {
      const next = remainingSeconds(endsAt)
      setRemaining(next)
      return next
    }

    if (tick() <= 0) return

    const intervalId = setInterval(() => {
      if (tick() <= 0) clearInterval(intervalId)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [endsAt])

  return {
    remaining,
    segments: remaining == null ? null : toCountdownSegments(remaining),
    isExpired: remaining != null && remaining <= 0,
  }
}
