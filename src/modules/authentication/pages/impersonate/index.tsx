'use client'

import { FC, useCallback, useEffect, useRef } from 'react'

import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import { toast } from 'sonner'

import ActionSheet from '@/components/ActionSheet'
import Animate from '@/components/Animate'

import AuthLayout from '@/modules/authentication/layout'

import { useImpersonate } from '@/api/functions/impersonation'
import { useProfile } from '@/api/functions/profile'

import { queryClient } from '@/providers/ReactQuery'

import { hideSheet, showSheet } from '@/lib/Sheet'
import Spinner from '@/lib/Spinner'

const IMPERSONATE_DELAY_MS = 1500
const HOME_REDIRECT_DELAY_MS = 1000

const formatFullName = (firstName?: string, lastName?: string) =>
  [firstName, lastName].filter(Boolean).join(' ')

export const ImpersonateView: FC<{ token: string }> = ({ token }) => {
  const router = useRouter()

  const { data: profileData, isPending: isProfilePending } = useProfile()
  const { mutate: impersonate } = useImpersonate()
  const hasHandledSessionCheckRef = useRef(false)

  const startImpersonation = useCallback(() => {
    impersonate(
      { data: { token } },
      {
        onSuccess(data) {
          localStorage.clear()
          queryClient.removeQueries()

          const name = formatFullName(
            data?.profile?.firstName,
            data?.profile?.lastName,
          )

          toast.success(`با موفقیت به حساب ${name} وارد شدید`)

          setTimeout(() => {
            router.replace(ROUTES.HOME)
          }, HOME_REDIRECT_DELAY_MS)
        },
      },
    )
  }, [impersonate, router, token])

  useEffect(() => {
    if (isProfilePending || hasHandledSessionCheckRef.current) {
      return
    }

    if (profileData) {
      hasHandledSessionCheckRef.current = true
      const currentName = formatFullName(
        profileData.profile?.firstName,
        profileData.profile?.lastName,
      )
      let replaceOnDismiss = true

      showSheet(ActionSheet, {
        icon: 'warning',
        title: 'قبلا با حساب دیگری وارد شده اید',
        description: `در حال حاضر با حساب ${currentName} وارد شده‌اید. در صورت تایید، حساب فعلی با حساب انتخاب‌ شده جایگزین می‌شود.`,
        onClose: () => {
          if (replaceOnDismiss) {
            router.replace(ROUTES.HOME)
          }
        },
        actions: [
          {
            id: 'cancel',
            children: 'انصراف',
            variant: 'text',
            onClick: () => {
              hideSheet(ActionSheet)
              router.replace(ROUTES.HOME)
            },
          },
          {
            id: 'confirm',
            children: 'جایگزینی حساب',
            variant: 'primary',
            onClick: () => {
              replaceOnDismiss = false
              hideSheet(ActionSheet)
              startImpersonation()
            },
          },
        ],
      })

      return
    }

    hasHandledSessionCheckRef.current = true

    const timeoutId = window.setTimeout(() => {
      startImpersonation()
    }, IMPERSONATE_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isProfilePending, profileData, router, startImpersonation])

  return (
    <AuthLayout>
      <div className="flex h-full flex-col justify-between p-5">
        <Animate animation="slideUp" delay={1000}>
          <div className="typo-label-large text-text-primary">
            خودتو بذار جای یکی دیگه
          </div>
        </Animate>

        <div className="grid h-full place-items-center">
          <Spinner size="large" className="text-primary-600" />
        </div>
      </div>
    </AuthLayout>
  )
}

const ImpersonatePage: FC<{ token: string }> = (props) => {
  return <ImpersonateView token={props.token} />
}

export default ImpersonatePage
