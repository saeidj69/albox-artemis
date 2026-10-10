'use client'

import { useEffect, useState } from 'react'

import { useDebouncedValue } from 'rooks'

const useDetectScrollDirection = (options: { threshold?: number } = {}) => {
  const { threshold = 0 } = options

  const [scrollDirection, setScrollDirection] = useState<
    'up' | 'down' | 'still'
  >('still')

  const [debouncedScrollDirection] = useDebouncedValue(scrollDirection, 100)

  useEffect(() => {
    let lastScrollY = window.pageYOffset
    let ticking = false

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false
        return
      }
      setScrollDirection(scrollY > lastScrollY ? 'down' : 'up')
      lastScrollY = scrollY > 0 ? scrollY : 0
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [scrollDirection])

  return debouncedScrollDirection
}

export default useDetectScrollDirection
