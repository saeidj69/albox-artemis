import type { MetadataRoute } from 'next'

import { appUrl } from '@/utils/seo/app-url'

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: '*',
    allow: '/',
  },
  host: appUrl.origin,
})

export default robots
