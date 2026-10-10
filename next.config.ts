import type { NextConfig } from 'next'

import { withSentryConfig } from '@sentry/nextjs/config'

const releaseVersion = process.env.DEPLOYMENT_TAG || process.env.GIT_SHA

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    APP_URL: process.env.APP_URL,
    API_URL: process.env.API_URL,
    APP_ENV: process.env.APP_ENV,
    TYCHE_API_URL: process.env.TYCHE_API_URL,
    SUPPORT_PHONE_NUMBER: process.env.SUPPORT_PHONE_NUMBER,
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
    FALLBACK_IMAGE_URL: process.env.FALLBACK_IMAGE_URL,
    DEPLOYMENT_TAG: process.env.DEPLOYMENT_TAG,
    MAPSI_BASE_URL: process.env.MAPSI_BASE_URL,
    TUTORIAL_VIDEO_URL: process.env.TUTORIAL_VIDEO_URL,
    TUTORIAL_VIDEO_POSTER_URL: process.env.TUTORIAL_VIDEO_POSTER_URL,
    PLAUSIBLE_URL: process.env.PLAUSIBLE_URL,
    GTM_ID: process.env.GTM_ID,
    CLARITY_ID: process.env.CLARITY_ID,
    CASHBACK_PERCENT: process.env.CASHBACK_PERCENT,
    SENTRY_TRACES_SAMPLE_RATE: process.env.SENTRY_TRACES_SAMPLE_RATE,
    ENABLE_PAGE_BUILDER_PRESENTATIONS:
      process.env.ENABLE_PAGE_BUILDER_PRESENTATIONS,
  },
  devIndicators: false,
  poweredByHeader: false,
  transpilePackages: ['navlens'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
}

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'sentry',

  project: 'artemis',
  sentryUrl: 'https://sentry.allbox.work/',

  // Release = `artemis@<version tag>` (e.g. v1.4.0-prd), falling back to the git SHA
  // for untagged builds. Both are passed in by CI at build time.
  release: {
    name: releaseVersion ? `artemis@${releaseVersion}` : undefined,
  },

  // Upload source maps to Sentry, then delete them so they are never served publicly.
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  webpack: {
    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
})
