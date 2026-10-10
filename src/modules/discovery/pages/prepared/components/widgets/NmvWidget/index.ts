import { NmvWidgetComponent } from './NmvWidget'
import { NmvWidgetSkeletonComponent } from './NmvWidget.Skeleton'

const NmvWidget = Object.assign(NmvWidgetComponent, {
  Skeleton: NmvWidgetSkeletonComponent,
})

export default NmvWidget
