import { FC, PropsWithChildren, Suspense } from 'react'

import PlausibleProvider from 'next-plausible'

import ThirdPartyScripts from '@/scripts'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import StageApiSwitcher from '@/components/StageApiSwitcher'

import { IranSans } from '@/utils/font'
import { metadata, viewport } from '@/utils/seo'

import { AppOpenedTracker } from '@/providers/AppOpenedTracker'
import { ErudaProvider } from '@/providers/Eruda'
import FingerprintProvider from '@/providers/Fingerprint'
import { NavigationTracker } from '@/providers/NavigationTracker'
import NiceModalProvider from '@/providers/NiceModal'
import ReactQueryProvider from '@/providers/ReactQuery'
import { RouterProgressProvider } from '@/providers/RouterProgress'

import Toaster from '@/lib/Toast'

import './globals.css'

export { metadata, viewport }

const plausibleUrl = process.env.PLAUSIBLE_URL

const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${IranSans.variable} antialiased`}>
        <ThirdPartyScripts />

        <Suspense fallback={null}>
          <ErudaProvider />
        </Suspense>

        <PlausibleProvider enabled={!!plausibleUrl} src={plausibleUrl ?? ''}>
          <AppOpenedTracker />

          <NuqsAdapter>
            <NavigationTracker />

            <FingerprintProvider>
              <ReactQueryProvider>
                <RouterProgressProvider>
                  <NiceModalProvider>{children}</NiceModalProvider>
                </RouterProgressProvider>

                <Toaster />
                <StageApiSwitcher />
              </ReactQueryProvider>
            </FingerprintProvider>
          </NuqsAdapter>
        </PlausibleProvider>
      </body>
    </html>
  )
}

export default RootLayout
