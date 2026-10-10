import { useCallback, useEffect, useRef } from 'react'

import { useRouter } from 'next/navigation'

import { ERROR_CODES, PAYMENT_REFERENCE_ENTITY } from '@/constants'

import ActionSheet from '@/components/ActionSheet'

import {
  buildPaymentResultUrl,
  navigateToExternalUrl,
} from '@/modules/payment/utils/payment-navigation'

import { useInitiateBarookPayment } from '@/api/functions/barook'
import { getErrorCodeFromErrorResponse } from '@/api/mutator/utils/error-message'

import { hideSheet, showSheet } from '@/lib/Sheet'

import { BAROOK_PAGE_COPY } from '../constants'

type InitiateOptions = {
  force?: boolean
  principalAmount?: number
}

type AttemptKey = {
  orderId: number
  principal: number
  key: string
}

export const useBarookInitiate = (orderId: number, principalRial: number) => {
  const router = useRouter()
  const attemptRef = useRef<AttemptKey | null>(null)
  const initiateRef = useRef<(options?: InitiateOptions) => void>(() => {})

  const { mutate, isPending } = useInitiateBarookPayment({
    request: { skipErrorToast: true },
  })

  const takeKey = useCallback(
    (principal: number, rotate: boolean) => {
      const current = attemptRef.current
      if (
        !rotate &&
        current &&
        current.orderId === orderId &&
        current.principal === principal
      ) {
        return current.key
      }

      const key = crypto.randomUUID()
      attemptRef.current = { orderId, principal, key }
      return key
    },
    [orderId],
  )

  const initiate = useCallback(
    (options?: InitiateOptions) => {
      const force = options?.force ?? false
      const principalAmount = options?.principalAmount ?? principalRial

      if (principalAmount < 1 || isPending) return

      mutate(
        {
          data: {
            referenceEntity: PAYMENT_REFERENCE_ENTITY.ORDER,
            referenceId: String(orderId),
            principalAmount,
            idempotencyKey: takeKey(principalAmount, force),
            ...(force ? { force: true } : {}),
          },
        },
        {
          onSuccess: (data) => {
            if (data.redirectUrl) {
              navigateToExternalUrl(data.redirectUrl)
              return
            }

            router.replace(
              buildPaymentResultUrl({
                status: 'success',
                type: 'barook',
                referenceId: String(orderId),
              }),
            )
          },
          onError: (error, variables) => {
            if (
              getErrorCodeFromErrorResponse(error.response?.data) !==
              ERROR_CODES.BAROOK_ATTEMPT_ALREADY_IN_PROGRESS
            ) {
              return
            }

            showSheet(ActionSheet, {
              icon: 'warning',
              title: BAROOK_PAGE_COPY.pendingTitle,
              description: BAROOK_PAGE_COPY.pendingDescription,
              actions: [
                {
                  id: 'cancel',
                  children: BAROOK_PAGE_COPY.pendingCancel,
                  variant: 'ghost',
                  onClick: () => hideSheet(ActionSheet),
                },
                {
                  id: 'proceed',
                  children: BAROOK_PAGE_COPY.pendingProceed,
                  onClick: () => {
                    hideSheet(ActionSheet)
                    initiateRef.current({
                      force: true,
                      principalAmount: variables.data.principalAmount,
                    })
                  },
                },
              ],
            })
          },
        },
      )
    },
    [isPending, mutate, orderId, principalRial, router, takeKey],
  )

  useEffect(() => {
    initiateRef.current = initiate
  }, [initiate])

  return { initiate, isPending }
}
