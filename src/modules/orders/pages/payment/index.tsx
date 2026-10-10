'use client'

import { useRouter } from 'next/navigation'

import { PAYMENT_REFERENCE_ENTITY, ROUTES } from '@/constants'
import { Add } from 'iconsax-reactjs'

import Header from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import { useShowCustomerOrder } from '@/api/functions/order'
import { useLatestPaymentByReference } from '@/api/functions/payment-management'
import { useProfile } from '@/api/functions/profile'

import Button from '@/lib/Button'
import { showSheet } from '@/lib/Sheet'
import Skeleton from '@/lib/Skeleton'

import AddPaymentMethodSheet from './components/add-payment-method-sheet'
import OrderPaymentSummary from './components/order-payment-summary'
import RegisteredPaymentMethod from './components/registered-payment-method'
import { useOrderReceipt } from './hooks/use-order-receipt'
import { getPaidSimplifiedTransactions } from './utils/get-paid-simplified-transactions'
import { getPaymentMethodIcon } from './utils/get-payment-method-icon'
import { getWalletPaymentMethod } from './utils/get-wallet-payment-method'

type OrderPaymentPageProps = {
  orderId: number
}

const FOOTER_HEIGHT = 80

const OrderPaymentPage = (props: OrderPaymentPageProps) => {
  const { orderId } = props

  const router = useRouter()
  const {
    download: downloadReceipt,
    isGenerating,
    canDownload,
  } = useOrderReceipt(orderId)

  const {
    data: orderData,
    isLoading: isOrderLoading,
    isError: isOrderError,
  } = useShowCustomerOrder(orderId)
  const {
    data: paymentData,
    isLoading: isPaymentLoading,
    isError: isPaymentError,
  } = useLatestPaymentByReference(PAYMENT_REFERENCE_ENTITY.ORDER, orderId)
  const { data: profileData } = useProfile()

  const order = orderData?.order
  const payment = paymentData?.payment
  const isLoading = isOrderLoading || isPaymentLoading
  const isError = isOrderError || isPaymentError || !order

  const isPendingPayment = payment?.status.value === 'pending'
  const remainingRial = payment?.pendingAmount ?? order?.netTotal ?? 0
  const totalRial = payment?.amount ?? order?.netTotal ?? 0
  const paidTransactions = getPaidSimplifiedTransactions(
    payment?.simplifiedTransactions,
  )
  const isFulfilled = Boolean(order) && remainingRial <= 0
  const customerName = profileData?.profile
    ? `${profileData.profile.firstName} ${profileData.profile.lastName}`.trim()
    : undefined

  const handleConfirm = () => {
    router.push(ROUTES.ORDERS.detail(orderId))
  }

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      )
    }

    if (isError) {
      return (
        <p className="typo-body-medium text-text-secondary py-12 text-center">
          اطلاعات پرداخت در دسترس نیست.
        </p>
      )
    }

    return (
      <>
        <OrderPaymentSummary
          orderId={order.id}
          createdAt={order.createdAt}
          remainingRial={remainingRial}
          totalRial={totalRial}
          fulfilled={isFulfilled}
          customerName={customerName}
          paidLabel={payment?.status.label ?? order.paymentStatus.label}
        />

        <section className="space-y-3">
          <h2 className="typo-title-small text-text-primary">
            روش‌های پرداخت شده
          </h2>

          {paidTransactions.length === 0 ? (
            <p className="typo-body-small text-text-secondary">
              هنوز روش پرداختی ثبت نشده است.
            </p>
          ) : (
            paidTransactions.map((transaction) => {
              const Icon = getPaymentMethodIcon(
                getWalletPaymentMethod(transaction.source.type.value),
              )

              return (
                <RegisteredPaymentMethod
                  key={transaction.id}
                  title={transaction.source.type.label}
                  amountRial={transaction.amount}
                  icon={<Icon className="text-primary-600 size-5" />}
                />
              )
            })
          )}

          {!isFulfilled && (
            <Button
              variant="text"
              size="large"
              className="bg-primary-50 w-full"
              startIcon={<Add />}
              onClick={() =>
                showSheet(AddPaymentMethodSheet, {
                  orderId,
                  payableRial: remainingRial,
                })
              }
              disabled={isPendingPayment}
            >
              افزودن روش پرداخت
            </Button>
          )}
        </section>
      </>
    )
  }

  return (
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderBackButton fallback={ROUTES.ORDERS.detail(orderId)} />}
          center="پرداخت"
        />
      </Layout.Header>

      <main className="w-app space-y-4 py-4">{renderBody()}</main>

      <Layout.Footer height={FOOTER_HEIGHT} className="bg-background-main">
        <div className="flex gap-3 p-4">
          {isFulfilled && (
            <Button
              variant="ghost"
              size="large"
              className="flex-1"
              classNames={{
                root: 'text-primary-600 border-primary-600',
              }}
              loading={isGenerating}
              disabled={!canDownload}
              onClick={() => void downloadReceipt()}
            >
              دریافت رسید
            </Button>
          )}

          <Button
            variant={isFulfilled ? 'primary' : 'ghost'}
            size="large"
            className="flex-1"
            classNames={
              isFulfilled
                ? undefined
                : { root: 'text-primary-600 border-primary-600' }
            }
            onClick={handleConfirm}
          >
            تایید و بازگشت
          </Button>
        </div>
      </Layout.Footer>
    </>
  )
}

export default OrderPaymentPage
