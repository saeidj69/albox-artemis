'use client'

import { useEffect, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import { useAtom } from 'jotai'

import { loginStateAtom } from '@/modules/authentication/atoms'
import AuthLayout from '@/modules/authentication/layout'
import OtpForm from '@/modules/authentication/pages/login/components/otp'
import PhoneNumberForm from '@/modules/authentication/pages/login/components/phone-number'
import type { LoginState } from '@/modules/authentication/types'

import { useProfile } from '@/api/functions/profile'

const initialLoginState: LoginState = {
  expiresAt: 0,
  resendAvailableAt: 0,
  phoneNumber: '',
  step: 'phoneNumber',
  previousStep: 'none',
}

const LoginPage = () => {
  const router = useRouter()

  const { data: profile } = useProfile()

  const [loginState, setLoginState] = useAtom(loginStateAtom)

  useEffect(() => {
    if (profile) {
      router.replace(ROUTES.HOME)
    }
  }, [profile, router])

  useEffect(() => {
    if (loginState.step !== loginState.previousStep) {
      const timeoutId = window.setTimeout(() => {
        setLoginState((prev) => ({ ...prev, previousStep: loginState.step }))
      }, 1000)

      return () => window.clearTimeout(timeoutId)
    }
  }, [loginState, setLoginState])

  useEffect(() => {
    if (loginState.step !== 'otp') return

    const expirationDelay = loginState.expiresAt - Date.now()

    if (expirationDelay <= 0) {
      setLoginState(initialLoginState)
      return
    }

    const timeoutId = window.setTimeout(() => {
      setLoginState(initialLoginState)
    }, expirationDelay)

    return () => window.clearTimeout(timeoutId)
  }, [loginState.expiresAt, loginState.step, setLoginState])

  const content = useMemo(() => {
    switch (loginState.step) {
      case 'phoneNumber':
        return <PhoneNumberForm />

      case 'otp':
        return <OtpForm />

      default:
        return null
    }
  }, [loginState])

  return (
    <AuthLayout topPanel={loginState.step === 'otp' ? 'compact' : 'full'}>
      {content}
    </AuthLayout>
  )
}

export default LoginPage
