import { useEffect, useState } from 'react'

import { useThumbmark } from '@thumbmarkjs/react'

import type { UserDeviceFingerprint } from '@/api/models'

export const parseUserAgent = (userAgent: string) => {
  const uaData = (
    navigator as Navigator & { userAgentData?: { platform?: string } }
  ).userAgentData

  let osName = 'Unknown'
  let osVersion = 'Unknown'

  let match: RegExpMatchArray | null = null

  if ((match = userAgent.match(/Windows NT ([\d.]+)/))) {
    osName = 'Windows'
    osVersion = match[1]
  } else if ((match = userAgent.match(/Mac OS X ([\d_]+)/))) {
    osName = 'macOS'
    osVersion = match[1].replace(/_/g, '.')
  } else if ((match = userAgent.match(/Android ([\d.]+)/))) {
    osName = 'Android'
    osVersion = match[1]
  } else if ((match = userAgent.match(/OS ([\d_]+) like Mac OS X/))) {
    osName = 'iOS'
    osVersion = match[1].replace(/_/g, '.')
  } else if (/Linux/.test(userAgent)) {
    osName = 'Linux'
  }

  let browserName = 'Unknown'
  let browserVersion = 'Unknown'

  if ((match = userAgent.match(/Edg\/([\d.]+)/))) {
    browserName = 'Edge'
    browserVersion = match[1]
  } else if ((match = userAgent.match(/OPR\/([\d.]+)/))) {
    browserName = 'Opera'
    browserVersion = match[1]
  } else if ((match = userAgent.match(/Firefox\/([\d.]+)/))) {
    browserName = 'Firefox'
    browserVersion = match[1]
  } else if ((match = userAgent.match(/CriOS\/([\d.]+)/))) {
    browserName = 'Chrome'
    browserVersion = match[1]
  } else if ((match = userAgent.match(/Chrome\/([\d.]+)/))) {
    browserName = 'Chrome'
    browserVersion = match[1]
  } else if ((match = userAgent.match(/Version\/([\d.]+).*Safari/))) {
    browserName = 'Safari'
    browserVersion = match[1]
  }

  return {
    osName,
    osVersion,
    browserName,
    browserVersion,
    platform: uaData?.platform ?? navigator.platform ?? 'Unknown',
  }
}

const useFingerprint = () => {
  const [fingerprint, setFingerprint] = useState<UserDeviceFingerprint | null>(
    null,
  )

  const { thumbmark } = useThumbmark()

  useEffect(() => {
    if (thumbmark) {
      const { osName, osVersion, browserName, browserVersion, platform } =
        parseUserAgent(navigator.userAgent)

      setTimeout(() => {
        setFingerprint({
          id: thumbmark ?? '',
          platform,
          osName,
          osVersion,
          browserName,
          browserVersion,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          locale: navigator.language,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          viewportSize: `${window.innerWidth}x${window.innerHeight}`,
          deviceMemory:
            (navigator as Navigator & { deviceMemory?: number }).deviceMemory ??
            null,
          hardwareConcurrency: navigator.hardwareConcurrency ?? null,
        })
      }, 100)
    }
  }, [thumbmark])

  return {
    fingerprint,
  }
}

export default useFingerprint
