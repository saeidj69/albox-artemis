'use client'

import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants/routes'
import { ArrowRight2 } from 'iconsax-reactjs'

import Header, { HeaderLogo } from '@/components/Header'
import Layout from '@/components/Layout'

import {
  useAutoBasketCheck,
  useBasketRemoteSync,
} from '@/modules/purchase/hooks'

import IconButton from '@/lib/IconButton'

import BasketFooter from './components/BasketFooter'
import BasketProducts from './components/BasketProducts'
import BasketRecommendations from './components/BasketRecommendations'
import BasketTitle from './components/BasketTitle'

const BasketPage = () => {
  const router = useRouter()

  useBasketRemoteSync()
  useAutoBasketCheck()

  return (
    <>
      <Layout.Header height={64}>
        <Header
          left={<HeaderLogo asLink={false} />}
          center={<BasketTitle />}
          //right={<HeaderBackButton />}
          //hardcoded home button
          right={
            <IconButton
              variant="ghost"
              onClick={() => router.push(ROUTES.HOME)}
            >
              <ArrowRight2 />
            </IconButton>
          }
        />
      </Layout.Header>

      <main className="space-y-4 py-4">
        <BasketProducts />
        <BasketRecommendations />
      </main>

      <BasketFooter />
    </>
  )
}

export default BasketPage
