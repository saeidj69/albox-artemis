import { Metadata, NextPage } from 'next'

import OrderPaymentPage from '@/modules/orders/pages/payment'

type PageProps = {
  params: Promise<{ orderId: string }>
}

export const metadata: Metadata = {
  title: 'پرداخت',
}

const Page: NextPage<PageProps> = async (props) => {
  const { orderId } = await props.params

  return <OrderPaymentPage orderId={Number(orderId)} />
}

export default Page
