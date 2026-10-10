import { Metadata } from 'next'

import AuthImpersonatePage from '@/modules/authentication/pages/impersonate'

export const metadata: Metadata = {
  title: 'خودتو بذار جای یکی دیگه',
}

type PageProps = {
  searchParams: Promise<{ token: string }>
}

const ImpersonatePage = async (props: PageProps) => {
  const searchParams = await props.searchParams

  return <AuthImpersonatePage token={searchParams.token} />
}

export default ImpersonatePage
