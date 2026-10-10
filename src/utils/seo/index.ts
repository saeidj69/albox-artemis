import type { Metadata, Viewport } from 'next'

import { appUrl } from './app-url'

const APP_NAME = 'آل‌باکس'
const APP_DEFAULT_TITLE = 'آل‌باکس | تأمین آنلاین کالای سوپرمارکتی'
const APP_TITLE_TEMPLATE = '%s | آل‌باکس'
const APP_DESCRIPTION =
  'خرید آنلاین محصولات سوپرمارکتی برای فروشگاه‌ها و خرده‌فروشان، با قیمت شفاف و توزیع مطمئن.'

export const metadata: Metadata = {
  metadataBase: appUrl,
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },

  description: APP_DESCRIPTION,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: [
      {
        url: '/images/og.png',
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: ['/images/og.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
}
