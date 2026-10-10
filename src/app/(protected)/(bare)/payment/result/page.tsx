import { Suspense } from 'react'

import { Metadata } from 'next'

import PaymentResultPage from '@/modules/payment/pages/result'

export const metadata: Metadata = {
  title: 'نتیجه پرداخت',
}

const PaymentResultRoute = () => (
  <Suspense fallback={null}>
    <PaymentResultPage />
  </Suspense>
)

export default PaymentResultRoute
