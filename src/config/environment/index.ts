import { STORAGE_KEYS } from '@/constants'

export const STAGE_API_BASE_URLS = [
  'https://jupiter.allbox.work',
  'https://jupiter-1.allbox.work',
  'https://jupiter-2.allbox.work',
  'https://jupiter-3.allbox.work',
] as const

export type StageApiBaseUrl = (typeof STAGE_API_BASE_URLS)[number]
export type AppEnv = 'staging' | 'production'

const isStageApiBaseUrl = (baseUrl: string): baseUrl is StageApiBaseUrl =>
  STAGE_API_BASE_URLS.includes(baseUrl as StageApiBaseUrl)

const resolveAppEnv = (value: string | undefined): AppEnv =>
  value === 'production' ? 'production' : 'staging'

class EnvironmentManager {
  getAppEnv(): AppEnv {
    return resolveAppEnv(process.env.APP_ENV)
  }

  /** Client override only on non-production deployments (and local when APP_ENV unset). */
  canOverrideApiUrl(): boolean {
    return this.getAppEnv() !== 'production'
  }

  isApiSwitcherEnabled(): boolean {
    return this.canOverrideApiUrl()
  }

  getApiUrl(): string {
    if (this.canOverrideApiUrl() && typeof window !== 'undefined') {
      const overriddenApiUrl = window.localStorage.getItem(
        STORAGE_KEYS.STAGE_API_BASE_URL,
      )

      if (overriddenApiUrl != null && isStageApiBaseUrl(overriddenApiUrl)) {
        return overriddenApiUrl
      }
    }

    return process.env.API_URL ?? ''
  }

  setApiUrl(apiUrl: string): void {
    if (typeof window === 'undefined' || !this.canOverrideApiUrl()) {
      return
    }

    if (!isStageApiBaseUrl(apiUrl)) {
      throw new Error('The selected API base URL is not an approved stage URL.')
    }

    window.localStorage.setItem(STORAGE_KEYS.STAGE_API_BASE_URL, apiUrl)
  }
}

export const environmentManager = new EnvironmentManager()
