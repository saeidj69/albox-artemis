import BillboardWidgetComponent from './BillboardWidget'
import BillboardWidgetSkeletonComponent from './BillboardWidget.Skeleton'

const BillboardWidget = Object.assign(BillboardWidgetComponent, {
  Skeleton: BillboardWidgetSkeletonComponent,
})

export default BillboardWidget
