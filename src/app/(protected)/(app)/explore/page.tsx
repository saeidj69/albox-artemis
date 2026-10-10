import { Metadata } from 'next'

import ExplorePage from '@/modules/discovery/pages/explore'

export const metadata: Metadata = {
  title: 'جستجو',
}

const ExploreRoutePage = () => {
  return <ExplorePage />
}

export default ExploreRoutePage
