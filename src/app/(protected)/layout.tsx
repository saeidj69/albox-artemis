'use client'

import { FC, ReactNode, useEffect, useState } from 'react'

import { redirect } from 'next/navigation'

import { ROUTES } from '@/constants'
import { useAnalyticsAuthInit } from '@/hooks/useAnalyticsAuthInit'
import { useLogout } from '@/hooks/useLogout'
import { useSentryUserInit } from '@/hooks/useSentryUserInit'
import axios from 'axios'

import LoadingPage from '@/components/LoadingPage'
import ProtectedError from '@/components/ProtectedError'

import { useExperimentsBootstrap } from '@/modules/experiments'
import { useBasketSync } from '@/modules/purchase/hooks'

import { useProfile } from '@/api/functions/profile'

import { cn } from '@/lib/utils'

type ProtectedLayoutProps = {
  children: ReactNode
}

const ProtectedLayout: FC<ProtectedLayoutProps> = (props) => {
  const { children } = props

  const { data: profile, isError, error } = useProfile()

  useBasketSync({
    enabled: !!profile,
  })

  useExperimentsBootstrap({ enabled: !!profile })
  useAnalyticsAuthInit({ enabled: !!profile })
  useSentryUserInit({ enabled: !!profile })

  const { logout, isLoggingOut } = useLogout()

  const [shouldShowContent, setShouldShowContent] = useState(false)

  useEffect(() => {
    if (profile) {
      window.document.body.style.backgroundColor = '#FFF'

      setTimeout(() => {
        setShouldShowContent(true)
      }, 100)
    }
  }, [profile])

  const isUnauthorized =
    axios.isAxiosError(error) && error.response?.status === 401

  if (isUnauthorized) {
    redirect(ROUTES.AUTH.LOGIN)
  }

  if (isError) {
    return <ProtectedError onLogout={logout} isLoggingOut={isLoggingOut} />
  }

  if (!shouldShowContent) {
    return (
      <div className={cn(profile && 'opacity-0 duration-100')}>
        <LoadingPage />
      </div>
    )
  }

  return (
    <div className="border-border-lighter container flex min-h-dvh flex-col md:border-r md:border-l">
      {children}
    </div>
  )
}

export default ProtectedLayout
