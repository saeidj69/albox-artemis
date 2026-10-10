import { Metadata, NextPage } from 'next'

import OrderDetailPage from '@/modules/orders/pages/detail'

type PageProps = {
  params: Promise<{ orderId: string }>
}

export const metadata: Metadata = {
  title: 'جزئیات سفارش',
}

const Page: NextPage<PageProps> = async (props) => {
  const { orderId } = await props.params

  return <OrderDetailPage orderId={Number(orderId)} />
}

export default Page
