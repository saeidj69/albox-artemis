import { PropsWithChildren } from 'react'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'سیستم طراحی',
}

const DesignSystemLayout = ({ children }: PropsWithChildren) => children

export default DesignSystemLayout
