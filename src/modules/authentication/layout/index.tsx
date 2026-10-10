'use client'

import { FC, PropsWithChildren, useState } from 'react'

import Image from 'next/image'

import { useIntervalWhen, useLockBodyScroll } from 'rooks'

import Animate from '@/components/Animate'
import MovingGradient from '@/components/MovingGradient'

import AspectRatio from '@/lib/AspectRatio'
import { cn } from '@/lib/utils'

type AuthLayoutProps = PropsWithChildren<{
  topPanel?: 'full' | 'compact' | 'none'
}>

const AuthLayout: FC<AuthLayoutProps> = ({ children, topPanel = 'full' }) => {
  const [shouldShowContent, setShouldShowContent] = useState(false)

  useLockBodyScroll(true)

  useIntervalWhen(
    () => {
      requestAnimationFrame(() => {
        setShouldShowContent(true)
      })
    },
    750,
    true,
  )

  const showTopPanel = topPanel !== 'none'

  return (
    <div className="bg-background-main flex h-dvh w-dvw items-start justify-center overflow-hidden">
      <div className="w-app flex h-full flex-col">
        {showTopPanel && (
          <MovingGradient
            className={cn(
              'bg-primary-600 w-full flex-none',
              'transition-[height] duration-700 ease-out',
              !shouldShowContent && 'h-dvh',
              shouldShowContent && topPanel === 'full' && 'h-[20dvh]',
              shouldShowContent && topPanel === 'compact' && 'h-[15dvh]',
            )}
          >
            <div className="relative z-10 flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Animate
                  animation="slideUp"
                  duration={500}
                  className="w-[150px]"
                >
                  <AspectRatio ratio={161 / 43}>
                    <Image
                      fill
                      preload
                      alt="logo"
                      sizes="150px"
                      loading="eager"
                      src="/images/logo-type-white.svg"
                    />
                  </AspectRatio>
                </Animate>

                {topPanel === 'full' && (
                  <Animate animation="slideUp" duration={500} delay={500}>
                    <h1 className="typo-label-large text-white">
                      به آل‌باکس خوش‌ آمدید
                    </h1>
                  </Animate>
                )}
              </div>
            </div>
          </MovingGradient>
        )}

        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  )
}

export default AuthLayout
