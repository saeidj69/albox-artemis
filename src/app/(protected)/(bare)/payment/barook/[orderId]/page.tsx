import { Metadata, NextPage } from 'next'

import BarookCalculatorPage from '@/modules/payment/pages/barook'

type PageProps = {
  params: Promise<{ orderId: string }>
}

export const metadata: Metadata = {
  title: 'پرداخت با باروک',
}

const Page: NextPage<PageProps> = async (props) => {
  const { orderId } = await props.params

  return <BarookCalculatorPage orderId={Number(orderId)} />
}

export default Page
