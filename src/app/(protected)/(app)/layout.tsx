import { FC, PropsWithChildren } from 'react'

import BottomNavigation from '@/components/BottomNavigation'
import Layout from '@/components/Layout'

const AppLayout: FC<PropsWithChildren> = (props) => {
  const { children } = props

  return (
    <>
      {children}

      <Layout.Footer height={64} className="bg-background-main shadow-sm">
        <BottomNavigation />
      </Layout.Footer>
    </>
  )
}

export default AppLayout
