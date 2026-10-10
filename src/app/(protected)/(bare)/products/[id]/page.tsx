import { Metadata, NextPage } from 'next'

import ProductDetailsPage from '@/modules/products/pages/details'

type PageProps = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'جزئیات محصول',
}

const Page: NextPage<PageProps> = async (props) => {
  const { id } = await props.params

  return <ProductDetailsPage productId={Number(id)} />
}

export default Page
