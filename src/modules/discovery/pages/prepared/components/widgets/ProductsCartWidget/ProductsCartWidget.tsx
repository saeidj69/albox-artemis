'use client'

import { useClientState } from '@/hooks/useClientState'
import { useProductListTracking } from '@/hooks/useProductListTracking'
import { RiArrowLeftSLine } from '@remixicon/react'

import HorizontalProductList from '@/components/HorizontalProductList'

import type { ListingProductsCartHydratedWidget } from '@/api/models'

import Countdown from '@/lib/Countdown'
import { cn, readableTextClass, type ReadableTextColor } from '@/lib/utils'

import { childTrackingId } from '../../../utils/tracking-ids'
import { resolveWidgetScallopHeader } from '../../../utils/widget-header'
import { resolveWidgetCountdown } from '../../../utils/widget-timer'
import WidgetScallopBand from '../../WidgetScallopBand'

type ProductsCartWidgetProps = {
  widget: ListingProductsCartHydratedWidget
  /** Tracking id of the widget; each product derives its own from it. */
  trackingId: string
  index: number
  /** Readable text color over the row band background; undefined = no band. */
  bandTextColor?: ReadableTextColor
}

const ProductsCartWidget = (props: ProductsCartWidgetProps) => {
  const { widget, trackingId, index, bandTextColor } = props
  const products = widget.products ?? []
  const { value } = useClientState('addToCartPreview')
  const showPreview = index === 2 && value?.lastTimestamp == null

  const { onProductVisible, onProductOpen } = useProductListTracking({
    itemListId: String(widget.id),
    itemListName: widget.name,
  })

  if (products.length === 0) {
    return null
  }

  const scallop = resolveWidgetScallopHeader(widget.styles)
  const countdown = resolveWidgetCountdown(widget.styles)
  // Scallop fill is its own surface (white type). Otherwise the row band wins.
  const bandTextClass = scallop
    ? 'text-white'
    : readableTextClass(bandTextColor)

  return (
    <HorizontalProductList
      title={widget.name}
      products={products}
      titleHref={widget.href ?? undefined}
      showAddToCartPreview={showPreview}
      itemGap={widget.styles?.gap || undefined}
      headerBackdrop={
        scallop ? <WidgetScallopBand color={scallop.color} /> : undefined
      }
      headerAside={
        countdown ? (
          <Countdown
            endsAt={countdown.endsAt}
            classNames={{ separator: bandTextClass }}
          />
        ) : undefined
      }
      // The scalloped band is too tight for the timer plus a full label.
      moreLinkContent={
        countdown && scallop ? <RiArrowLeftSLine size={16} /> : undefined
      }
      onProductFullyVisible={onProductVisible}
      onProductOpen={onProductOpen}
      getProductTrackingId={(product) =>
        childTrackingId(trackingId, 'product', product.id)
      }
      classNames={{
        header: scallop
          ? cn(
              // Extra bottom padding sits content in the solid band.
              'mb-2 px-3 pt-1 pb-3',
              countdown ? 'min-h-[62px]' : 'min-h-14',
            )
          : undefined,
        title: bandTextClass,
        moreLink: bandTextClass,
      }}
    />
  )
}

export default ProductsCartWidget
