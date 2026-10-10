import { Metadata } from 'next'

import PreparedPage from '@/modules/discovery/pages/prepared'
import TutorialManager from '@/modules/tutorial/components/tutorialManager'

export const metadata: Metadata = {
  title: 'صفحه اصلی',
  alternates: {
    canonical: '/',
  },
}

const DynamicPage = async () => {
  return (
    <>
      <TutorialManager />

      <PreparedPage path={'home'} />
    </>
  )
}

export default DynamicPage
