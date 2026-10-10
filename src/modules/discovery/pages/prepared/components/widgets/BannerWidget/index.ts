import BannerWidgetComponent from './BannerWidget'
import BannerWidgetSkeletonComponent from './BannerWidget.Skeleton'

const BannerWidget = Object.assign(BannerWidgetComponent, {
  Skeleton: BannerWidgetSkeletonComponent,
})

export default BannerWidget
