import { useState, useEffect } from 'react'

type Platform = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown'
type Browser = 'safari' | 'chrome' | 'firefox' | 'edge' | 'samsung' | 'unknown'

interface SafeArea {
  top: number
  bottom: number
  left: number
  right: number
}

interface AppEnv {
  isStandalone: boolean
  platform: Platform
  browser: Browser
  safeArea: SafeArea
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  if (/android/i.test(ua)) return 'android'
  if (/win/i.test(navigator.platform)) return 'windows'
  if (/mac/i.test(navigator.platform)) return 'macos'
  if (/linux/i.test(navigator.platform)) return 'linux'
  return 'unknown'
}

function detectBrowser(): Browser {
  const ua = navigator.userAgent
  if (/samsungbrowser/i.test(ua)) return 'samsung'
  if (/edg\//i.test(ua)) return 'edge'
  if (/firefox|fxios/i.test(ua)) return 'firefox'
  if (/chrome|crios/i.test(ua)) return 'chrome'
  if (/safari/i.test(ua)) return 'safari'
  return 'unknown'
}

function detectStandalone(): boolean {
  const isIOSStandalone =
    (navigator as Navigator & { standalone: boolean }).standalone === true
  const isMediaStandalone = window.matchMedia(
    '(display-mode: standalone)',
  ).matches
  return isIOSStandalone || isMediaStandalone
}

function readSafeArea(): SafeArea {
  const style = getComputedStyle(document.documentElement)
  const parse = (val: string) => parseFloat(val) || 0
  return {
    top: parse(style.getPropertyValue('--sat')),
    bottom: parse(style.getPropertyValue('--sab')),
    left: parse(style.getPropertyValue('--sal')),
    right: parse(style.getPropertyValue('--sar')),
  }
}

function injectSafeAreaVars() {
  const id = '__safe-area-bridge__'
  if (document.getElementById(id)) return
  const el = document.createElement('style')
  el.id = id
  el.textContent = `
    :root {
      --sat: env(safe-area-inset-top);
      --sab: env(safe-area-inset-bottom);
      --sal: env(safe-area-inset-left);
      --sar: env(safe-area-inset-right);
    }
  `
  document.head.appendChild(el)
}

function useAppEnv(): AppEnv {
  const [env, setEnv] = useState<AppEnv>(() => ({
    isStandalone: detectStandalone(),
    platform: detectPlatform(),
    browser: detectBrowser(),
    safeArea: { top: 0, bottom: 0, left: 0, right: 0 },
  }))

  useEffect(() => {
    injectSafeAreaVars()

    // env() values are only readable after paint
    const rafId = requestAnimationFrame(() => {
      setEnv((prev) => ({ ...prev, safeArea: readSafeArea() }))
    })

    const media = window.matchMedia('(display-mode: standalone)')
    const handler = () => {
      setEnv((prev) => ({
        ...prev,
        isStandalone: detectStandalone(),
        safeArea: readSafeArea(),
      }))
    }

    media.addEventListener('change', handler)
    return () => {
      cancelAnimationFrame(rafId)
      media.removeEventListener('change', handler)
    }
  }, [])

  return env
}

export default useAppEnv
