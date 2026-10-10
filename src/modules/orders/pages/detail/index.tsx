'use client'

import { PAYMENT_REFERENCE_ENTITY } from '@/constants'

import Header from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import { composeIsoDateTime, formatJalaliDayMonth } from '@/utils/date'

import { useShowCustomerOrder } from '@/api/functions/order'
import { useLatestPaymentByReference } from '@/api/functions/payment-management'

import OrderAddressSection from './components/order-address-section'
import OrderCanceledInfo from './components/order-canceled-info'
import OrderDeliveryCode from './components/order-delivery-code'
import OrderDetailFooter from './components/order-detail-footer'
import OrderDetailSkeleton from './components/order-detail-skeleton'
import OrderDriverInfo from './components/order-driver-info'
import OrderInfoGrid from './components/order-info-grid'
import OrderProductCard from './components/order-product-card'
import OrderStatusIndicator from './components/order-status-indicator'

type OrderDetailPageProps = {
  orderId: number
}

const OrderDetailPage = (props: OrderDetailPageProps) => {
  const { orderId } = props
  const { data, isLoading, isError } = useShowCustomerOrder(orderId)
  const { data: paymentData } = useLatestPaymentByReference(
    PAYMENT_REFERENCE_ENTITY.ORDER,
    orderId,
  )

  const order = data?.order

  if (isLoading) return <OrderDetailSkeleton />

  if (isError || !order) {
    return (
      <>
        <Layout.Header height={64}>
          <Header right={<HeaderBackButton />} center="جزئیات سفارش" />
        </Layout.Header>

        <main className="grid place-items-center py-12">
          <p className="typo-body-medium text-text-secondary text-center">
            این سفارش وجود ندارد.
          </p>
        </main>
      </>
    )
  }

  const isCanceled = order.status.value === 'canceled'

  const showCanceledRefundInfo =
    isCanceled &&
    !!paymentData?.payment &&
    (paymentData.payment.simplifiedAllocations?.length ?? 0) > 0

  const paymentMethodLabel = paymentData?.payment
    ? Array.from(
        new Set(
          paymentData.payment.simplifiedAllocations.map(
            (item) => item.method.label,
          ),
        ),
      ).join(' و ')
    : undefined

  const driver =
    order.deliveryDetails.driverName && order.deliveryDetails.driverMobile
      ? {
          name: order.deliveryDetails.driverName,
          mobile: order.deliveryDetails.driverMobile,
        }
      : undefined

  const paymentRowLabel = paymentMethodLabel
    ? 'نحوه‌ی پرداخت:'
    : 'وضعیت پرداخت:'
  const paymentRowValue = paymentMethodLabel ?? order.paymentStatus.label

  const deliveredDescription =
    order.status.value === 'delivered'
      ? `سفارش شما در تاریخ ${formatJalaliDayMonth(
          composeIsoDateTime(order.deliveryDate, order.deliveryStartTime),
        )} تحویل داده شد.`
      : undefined

  const showDeliveryCode =
    !!order.deliveryDetails.proofOfDeliveryCode && !isCanceled

  return (
    <>
      <Layout.Header height={64}>
        <Header right={<HeaderBackButton />} center="جزئیات سفارش" />
      </Layout.Header>

      <main className="w-app flex flex-col py-4">
        <div className="flex flex-col gap-3">
          {!isCanceled && (
            <OrderAddressSection
              address={order.address.address}
              shipmentStartsAt={composeIsoDateTime(
                order.deliveryDate,
                order.deliveryStartTime,
              )}
              shipmentEndsAt={composeIsoDateTime(
                order.deliveryDate,
                order.deliveryEndTime,
              )}
            />
          )}

          <div className="flex flex-col gap-3">
            <OrderStatusIndicator
              status={order.status}
              paymentStatusValue={order.paymentStatus.value}
              description={deliveredDescription}
            />

            {driver && <OrderDriverInfo driver={driver} />}

            {showDeliveryCode && (
              <OrderDeliveryCode
                code={order.deliveryDetails.proofOfDeliveryCode!}
              />
            )}
          </div>

          {showCanceledRefundInfo && <OrderCanceledInfo />}
        </div>

        <OrderInfoGrid
          orderId={order.id}
          createdAt={order.createdAt}
          paymentLabel={paymentRowLabel}
          paymentValue={paymentRowValue}
        />

        <div className="bg-border-lighter -mx-4 mt-4 mb-3 h-1.5 shrink-0" />

        <div className="divide-border-lighter flex flex-col divide-y">
          {order.products.map((product) => (
            <div key={product.id} className="py-3 first:pt-0 last:pb-0">
              <OrderProductCard product={product} isInactive={isCanceled} />
            </div>
          ))}
        </div>
      </main>

      <OrderDetailFooter orderId={order.id} />
    </>
  )
}

export default OrderDetailPage
