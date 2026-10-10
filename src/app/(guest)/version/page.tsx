import { Metadata } from 'next'

import { DEPLOYMENT_TAG } from '@/constants/deployment'

export const metadata: Metadata = {
  title: 'نسخه',
}

export default function VersionPage() {
  const version = DEPLOYMENT_TAG ?? '-'

  return (
    <main className="w-app bg-background-main container flex min-h-dvh flex-col items-center justify-center py-8">
      <p className="typo-title-medium text-text-primary">{version}</p>
    </main>
  )
}
