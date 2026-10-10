'use client'

import { useState } from 'react'

import { PAYMENT_REFERENCE_ENTITY } from '@/constants'
import { toast } from 'sonner'

import {
  generateDeliveryReceipt,
  type ReceiptData,
} from '@/modules/orders/utils/delivery-receipt'

import { useShowCustomerOrder } from '@/api/functions/order'
import { useLatestPaymentByReference } from '@/api/functions/payment-management'
import { useProfile } from '@/api/functions/profile'

export const useOrderReceipt = (orderId: number) => {
  const { data: orderData } = useShowCustomerOrder(orderId)
  const { data: paymentData } = useLatestPaymentByReference(
    PAYMENT_REFERENCE_ENTITY.ORDER,
    orderId,
  )
  const { data: profileData } = useProfile()
  const [isGenerating, setIsGenerating] = useState(false)

  const order = orderData?.order
  const payment = paymentData?.payment

  const download = async () => {
    if (!order) return

    const profile = profileData?.profile
    const giftWalletDeduction =
      payment?.simplifiedAllocations
        .filter((allocation) => allocation.method.value === 'gift')
        .reduce((sum, allocation) => sum + allocation.amount, 0) ?? 0

    const data: ReceiptData = {
      orderId: order.id,
      createdAt: order.createdAt,
      customerName: profile
        ? `${profile.firstName} ${profile.lastName}`.trim()
        : '',
      mobileNumber: profile?.mobileNumber ?? '',
      nationalCode: null,
      address: order.address?.address ?? '',
      postalCode: null,
      proofOfDeliveryCode: order.deliveryDetails.proofOfDeliveryCode ?? null,
      products: order.products.map((product) => ({
        name: product.name,
        unitInBox: product.unitInBox,
        retailPrice: product.retailPrice,
        quantity: product.quantity,
        discountAmount: product.discountAmount,
        netPrice: product.netPrice,
        totalNetPrice: product.totalNetPrice,
        vat: 0,
      })),
      totalProductsPrice: order.totalProductsPrice,
      totalDiscountAmount: order.totalDiscountAmount,
      netDeliveryFee: order.netDeliveryFee,
      netTotal: order.netTotal,
      giftWalletDeduction,
    }

    try {
      setIsGenerating(true)
      await generateDeliveryReceipt(data)
    } catch {
      toast.error('خطا در دریافت رسید.')
    } finally {
      setIsGenerating(false)
    }
  }

  return { download, isGenerating, canDownload: Boolean(order) }
}
