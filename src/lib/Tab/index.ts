import {
  TabContentComponent,
  TabListComponent,
  TabRootComponent,
  TabTriggerComponent,
} from './Tab'

export type { TabSize } from './context'
export type {
  TabContentProps,
  TabListProps,
  TabRootProps,
  TabTriggerProps,
} from './types'
export type { TabSlots } from './variants'

const Tab = Object.assign(TabRootComponent, {
  List: TabListComponent,
  Trigger: TabTriggerComponent,
  Content: TabContentComponent,
})

export default Tab

export {
  TabContentComponent as TabContent,
  TabListComponent as TabList,
  TabRootComponent as TabRoot,
  TabTriggerComponent as TabTrigger,
}
