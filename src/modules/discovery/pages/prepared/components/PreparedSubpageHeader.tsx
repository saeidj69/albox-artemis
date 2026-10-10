'use client'

import Header, { HeaderLogo } from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import SearchInputComponent from '@/lib/SearchInput'
import Skeleton from '@/lib/Skeleton'

type PreparedSubpageHeaderProps = {
  isLoading: boolean
  title: string
}

const PreparedSubpageHeader = (props: PreparedSubpageHeaderProps) => {
  const { isLoading, title } = props

  return (
    <>
      <Layout.Header height={64}>
        <Header
          left={<HeaderLogo />}
          center={
            <div className="flex justify-center">
              {isLoading ? (
                <Skeleton className="h-4 w-24 rounded-full" />
              ) : (
                title
              )}
            </div>
          }
          right={<HeaderBackButton />}
        />
      </Layout.Header>

      <div className="py-4">
        <SearchInputComponent
          className="w-app"
          navigateToExplore={true}
          aria-label="جست‌وجوی محصول"
        />
      </div>
    </>
  )
}

export default PreparedSubpageHeader
