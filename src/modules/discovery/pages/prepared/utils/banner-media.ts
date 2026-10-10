import type { ListingBannerHydratedWidget, Media } from '@/api/models'

import type { PreparedHomeWidget } from '../hooks/use-home-data-populate'

export const isBannerWidget = (
  widget: PreparedHomeWidget,
): widget is ListingBannerHydratedWidget => widget.type === 'banner'

/** Width descriptors for the renditions the media actually ships. */
export const bannerSrcSet = (media: Media | undefined): string =>
  [
    [media?.sm, 480],
    [media?.md, 960],
    [media?.lg, 1440],
    [media?.xl, 1920],
  ]
    .filter((candidate): candidate is [string, number] => Boolean(candidate[0]))
    .map(([url, width]) => `${url} ${width}w`)
    .join(', ')

/** Largest rendition the banner actually ships; empty when it has no artwork. */
export const toBannerSource = (widget: ListingBannerHydratedWidget): string => {
  const media = widget.image
  return media?.lg ?? media?.md ?? media?.original ?? ''
}
