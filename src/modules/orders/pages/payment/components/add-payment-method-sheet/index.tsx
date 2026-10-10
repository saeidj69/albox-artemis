'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { ROUTES, TOMAN } from '@/constants'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  buildOrderPayUrl,
  navigateToExternalUrl,
} from '@/modules/payment/utils/payment-navigation'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

import {
  getGetBarookWalletQueryKey,
  useDiscoverBarookCustomer,
  useGetBarookWallet,
} from '@/api/functions/barook'

import Button from '@/lib/Button'
import { createSheet, Sheet, SheetHeader, useSheet } from '@/lib/Sheet'

import { getBarookOptionState } from '../../utils/get-barook-option-state'
import BarookMethodOption from './barook-method-option'
import IpgMethodOption from './ipg-method-option'

type AddablePaymentMethod = 'ipg' | 'barook'

type AddPaymentMethodSheetProps = {
  orderId: number
  payableRial: number
}

const AddPaymentMethodSheetComponent = (props: AddPaymentMethodSheetProps) => {
  const { orderId, payableRial } = props

  const router = useRouter()
  const sheet = useSheet()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<AddablePaymentMethod>('ipg')
  const [discoverError, setDiscoverError] = useState<unknown>(null)
  const [discoverAttempted, setDiscoverAttempted] = useState(false)

  const walletParams = { outstandingAmount: payableRial }
  const {
    data: wallet,
    isLoading: isWalletLoading,
    error: walletError,
  } = useGetBarookWallet(walletParams, {
    query: {
      enabled: payableRial > 0,
      retry: false,
    },
    request: { skipErrorToast: true },
  })

  const barookState = getBarookOptionState({
    isLoading: isWalletLoading,
    error: discoverError ?? walletError,
    wallet,
    discoverAttempted,
  })

  const { mutate: discover, isPending: isDiscovering } =
    useDiscoverBarookCustomer({
      mutation: {
        onMutate: () => {
          setDiscoverError(null)
        },
        onSuccess: (data) => {
          setDiscoverError(null)
          void queryClient.invalidateQueries({
            queryKey: getGetBarookWalletQueryKey(walletParams),
          })
          if (!data.discovered) {
            toast.error('اعتبار باروک برای این کاربر یافت نشد.')
          }
        },
        onError: (error) => {
          setDiscoverError(error)
        },
        onSettled: () => {
          setDiscoverAttempted(true)
        },
      },
      request: { skipErrorToast: true },
    })

  const effectiveSelected =
    selected === 'barook' && barookState !== 'active' ? null : selected

  const canConfirm =
    effectiveSelected === 'ipg' ||
    (effectiveSelected === 'barook' && barookState === 'active')

  const handleDiscover = () => {
    if (isDiscovering) return
    discover()
  }

  const handleConfirm = () => {
    if (!canConfirm || effectiveSelected == null) return

    if (effectiveSelected === 'ipg') {
      sheet.hide()
      navigateToExternalUrl(buildOrderPayUrl(orderId))
      return
    }

    sheet.hide()
    router.push(ROUTES.PAYMENT.barook(orderId))
  }

  return (
    <Sheet title="انتخاب روش پرداخت" description="انتخاب روش پرداخت">
      <div className="flex flex-col">
        <SheetHeader title="انتخاب روش پرداخت" showClose />

        <div className="flex items-center justify-between gap-2 px-4 pb-3">
          <p className="typo-body-small text-text-secondary">
            مبلغ قابل پرداخت سفارش:
          </p>
          <p className="typo-title-x-small text-text-primary">
            {formatPrice(toTomanPrice(payableRial))} {TOMAN}
          </p>
        </div>

        <div className="bg-border-lighter mx-4 h-px" />

        <div className="flex flex-col gap-3 p-4">
          <IpgMethodOption
            selected={effectiveSelected === 'ipg'}
            onSelect={() => setSelected('ipg')}
          />

          <BarookMethodOption
            state={barookState}
            selected={effectiveSelected === 'barook'}
            commissionPercentage={wallet?.commissionPercentage}
            balanceRial={wallet?.balance ?? 0}
            isDiscovering={isDiscovering}
            onSelect={() => setSelected('barook')}
            onRetry={handleDiscover}
          />
        </div>

        <div className="px-4 pb-4">
          <Button
            variant="primary"
            size="large"
            className="w-full"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            انتخاب روش پرداخت
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

const AddPaymentMethodSheet = createSheet(AddPaymentMethodSheetComponent)

export { AddPaymentMethodSheetComponent }
export default AddPaymentMethodSheet
