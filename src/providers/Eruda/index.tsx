'use client'

import { useEffect } from 'react'

import { useSearchParams } from 'next/navigation'

export function ErudaProvider() {
  const searchParams = useSearchParams()

  const isErudaEnabled = searchParams.get('debug') === '1'

  useEffect(() => {
    if (!isErudaEnabled) return

    let destroyed = false

    import('eruda').then(({ default: eruda }) => {
      if (destroyed) return
      eruda.init()
    })

    return () => {
      destroyed = true
      import('eruda').then(({ default: eruda }) => eruda.get()?.destroy())
    }
  }, [isErudaEnabled])

  return null
}
