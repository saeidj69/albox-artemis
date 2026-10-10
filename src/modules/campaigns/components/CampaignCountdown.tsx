'use client'

import { useEffect, useState } from 'react'

import FlipDigits from '@/lib/FlipDigits'

type CountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const SECOND_MS = 1000
const MINUTE_MS = 60 * SECOND_MS
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

const DAY_UNITS = [
  { key: 'minutes', label: 'دقیقه' },
  { key: 'hours', label: 'ساعت' },
  { key: 'days', label: 'روز' },
] as const

const LAST_DAY_UNITS = [
  { key: 'seconds', label: 'ثانیه' },
  { key: 'minutes', label: 'دقیقه' },
  { key: 'hours', label: 'ساعت' },
] as const

const remainingMs = (endAt: string, now: number) => {
  const end = new Date(endAt).getTime()
  return Number.isFinite(end) ? Math.max(0, end - now) : 0
}

const toParts = (diff: number): CountdownParts => ({
  days: Math.floor(diff / DAY_MS),
  hours: Math.floor(diff / HOUR_MS) % 24,
  minutes: Math.floor(diff / MINUTE_MS) % 60,
  seconds: Math.floor(diff / SECOND_MS) % 60,
})

type CampaignCountdownProps = {
  endAt: string
}

const CampaignCountdown = (props: CampaignCountdownProps) => {
  const { endAt } = props
  const [diff, setDiff] = useState(() => remainingMs(endAt, Date.now()))

  useEffect(() => {
    const tick = () => {
      const next = remainingMs(endAt, Date.now())
      setDiff(next)
      if (next <= 0) window.clearInterval(id)
    }

    const id = window.setInterval(tick, SECOND_MS)
    tick()

    return () => window.clearInterval(id)
  }, [endAt])

  if (diff <= 0) {
    return null
  }

  const parts = toParts(diff)
  const units = parts.days === 0 ? LAST_DAY_UNITS : DAY_UNITS

  return (
    <div data-slot="campaign-countdown" className="flex shrink-0 items-start">
      {units.map((unit, index) => (
        <div key={unit.key} className="flex items-start">
          {index > 0 ? (
            <span className="text-text-secondary typo-label-medium mt-0.5 flex items-center px-1">
              :
            </span>
          ) : null}

          <div className="flex flex-col items-center gap-1">
            <div className="border-primary-100 flex size-6 items-center justify-center rounded-lg border bg-white">
              <FlipDigits
                value={parts[unit.key]}
                minDigits={2}
                className="typo-body-small text-text-primary mt-0.5"
              />
            </div>

            <span className="text-text-secondary typo-label-x-small">
              {unit.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CampaignCountdown
