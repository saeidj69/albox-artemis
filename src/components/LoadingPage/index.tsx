'use client'

import Image from 'next/image'

import MovingGradient from '@/components/MovingGradient'

import AspectRatio from '@/lib/AspectRatio'
import { cn } from '@/lib/utils'

const LoadingPage = () => {
  return (
    <MovingGradient className="bg-primary-600 fixed inset-0 h-dvh w-dvw">
      <div className="relative h-full w-full">
        <div
          className={cn(
            'absolute top-1/2 left-1/2 z-10 w-37.5 -translate-x-1/2 -translate-y-1/2',
          )}
        >
          <AspectRatio ratio={161 / 43}>
            <Image
              fill
              alt="logo"
              sizes="150px"
              loading="eager"
              src="/images/logo-type-white.svg"
            />
          </AspectRatio>
        </div>
      </div>
    </MovingGradient>
  )
}

export default LoadingPage
