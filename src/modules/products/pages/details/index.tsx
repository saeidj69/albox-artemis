'use client'

import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import {
  EVENTS,
  track,
  GtmTransformer,
  WETransformer,
} from '@/helpers/analytics'
import { useProductListTracking } from '@/hooks/useProductListTracking'

import Header from '@/components/Header'
import HeaderAnimatedTitle from '@/components/Header/components/HeaderAnimatedTitle'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import HeaderLogo from '@/components/Header/components/HeaderLogo'
import HorizontalProductList from '@/components/HorizontalProductList'
import Layout from '@/components/Layout'

import { useLocation } from '@/modules/addresses/hooks'

import { useGetProductListing } from '@/api/functions/catalogue'

import ProductBreadcrumb from './components/product-breadcrumb'
import ProductDetailsPageSkeleton from './components/product-details-page.skeleton'
import ProductFooterBar from './components/product-footer'
import ProductImageSection from './components/product-image-section'
import ProductInfoHeader from './components/product-info-header'
import ProductPriceTable from './components/product-price-table'

type ProductDetailsPageProps = {
  productId: number
}

const ProductDetailsPage = (props: ProductDetailsPageProps) => {
  const { productId } = props

  const { location, isLoading: isLocationLoading } = useLocation()

  const { data: productData } = useGetProductListing(
    productId,
    { latitude: location.latitude, longitude: location.longitude },
    { query: { enabled: !isLocationLoading } },
  )

  const product = productData?.product
  const relatedProducts = productData?.metadata?.relatedProducts ?? []

  const { ref: titleRef, inView: isTitleVisible } = useInView({
    initialInView: true,
  })

  useEffect(() => {
    if (!product) return

    track(EVENTS.VIEW_ITEM, {
      gtm: {
        ecommerce: GtmTransformer.toViewItem(product),
      },
      webengage: WETransformer.toViewItem(product),
    })
  }, [product])

  const { onProductVisible, onProductOpen } = useProductListTracking({
    itemListId: 'related-products',
    itemListName: 'related-products',
  })

  if (!product || isLocationLoading) return <ProductDetailsPageSkeleton />

  return (
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderBackButton />}
          center={
            <HeaderAnimatedTitle
              primaryTitle="جزئیات محصول"
              secondaryTitle={product.name}
              isPrimaryVisible={isTitleVisible}
            />
          }
          left={<HeaderLogo />}
        />
      </Layout.Header>

      <main className="flex flex-col gap-4 py-4">
        <ProductBreadcrumb
          categoryId={product.category.id}
          categoryName={product.category.name}
        />

        <ProductImageSection product={product} />

        <ProductInfoHeader
          name={product.name}
          brandId={product.brand.id}
          brandName={product.brand.name}
          unitInBox={product.unitInBox}
          titleRef={titleRef}
        />

        <ProductPriceTable product={product} />

        <HorizontalProductList
          className="mt-4"
          title="محصولات مشابه"
          products={relatedProducts}
          onProductFullyVisible={onProductVisible}
          onProductOpen={onProductOpen}
        />
      </main>

      <ProductFooterBar product={product} />
    </>
  )
}

export default ProductDetailsPage
