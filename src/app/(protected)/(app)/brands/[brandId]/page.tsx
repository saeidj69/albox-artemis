import { Metadata, NextPage } from 'next'

import BrandDetailsPage from '@/modules/brands/pages/details'

type PageProps = {
  params: Promise<{ brandId: string }>
}

export const metadata: Metadata = {
  title: 'جزئیات برند',
}

const Page: NextPage<PageProps> = async (props) => {
  const { brandId } = await props.params

  return <BrandDetailsPage brandId={Number(brandId)} />
}

export default Page
