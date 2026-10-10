'use client'

import { Suspense } from 'react'

import {
  useNextAdapter,
  NavigationTracker as NextNavigationTracker,
} from 'navlens/next'

function Tracker() {
  const adapter = useNextAdapter()

  return <NextNavigationTracker adapter={adapter} />
}

export function NavigationTracker() {
  return (
    <Suspense>
      <Tracker />
    </Suspense>
  )
}
