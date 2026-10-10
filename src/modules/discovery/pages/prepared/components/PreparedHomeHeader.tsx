'use client'

import useDetectScrollDirection from '@/hooks/useDetectScrollDirection'

import Header, { HeaderProfileButton } from '@/components/Header'
import HeaderLogoWhite from '@/components/Header/components/HeaderLogoWhite'
import Layout from '@/components/Layout'

import ActiveAddress from '@/modules/addresses/components/active-address'

import SearchInputComponent from '@/lib/SearchInput'
import { cn } from '@/lib/utils'

const PreparedHomeHeader = () => {
  const scrollDirection = useDetectScrollDirection()

  return (
    <Layout.Header
      height={64 + 16 + 56}
      className={cn(
        'bg-primary-600 duration-500',
        scrollDirection === 'down' && '-translate-y-[64px]',
      )}
    >
      <Header
        left={<HeaderLogoWhite />}
        center={<ActiveAddress />}
        right={<HeaderProfileButton variant="home" />}
        classNames={{
          root: 'w-full bg-transparent',
          right: 'text-white',
        }}
      />

      <div
        className={cn(
          'bg-background-main h-4 rounded-t-4xl duration-500',
          scrollDirection === 'down' && 'rounded-t-none',
        )}
      />

      <div className="bg-background-main z-50 px-4 pb-4">
        <SearchInputComponent
          className="w-app"
          navigateToExplore={true}
          aria-label="جست‌وجوی محصول"
        />
      </div>
    </Layout.Header>
  )
}

export default PreparedHomeHeader
