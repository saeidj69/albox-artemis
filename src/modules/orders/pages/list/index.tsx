'use client'

import { useState } from 'react'

import { useDebouncedValue } from 'rooks'

import Header, { HeaderLogo, HeaderProfileButton } from '@/components/Header'
import Layout from '@/components/Layout'

import { OrderSearchSchema } from '@/modules/orders/validation/order-search-schema'

import SearchInput from '@/lib/SearchInput'

import OrdersList from './components/orders-list'

const OrdersPage = () => {
  const [orderSearch, setOrderSearch] = useState('')

  const [debouncedOrderSearch] = useDebouncedValue(orderSearch, 500)

  const orderSearchError =
    OrderSearchSchema.safeParse(orderSearch).error?.issues[0]?.message

  return (
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderProfileButton />}
          center="سفارش‌ها"
          left={<HeaderLogo />}
        />
      </Layout.Header>

      <div className="bg-background-main sticky top-16 right-0 left-0 z-10 py-4">
        <SearchInput
          value={orderSearch}
          onChange={(event) => setOrderSearch(event?.target?.value ?? '')}
          placeholder="جستجو در سفارشات"
          aria-label="جستجو در سفارشات"
          inputMode="numeric"
          error={!!orderSearchError}
          helperText={orderSearchError}
        />
      </div>

      <main className="pb-4">
        <OrdersList orderSearch={debouncedOrderSearch} />
      </main>
    </>
  )
}

export default OrdersPage
