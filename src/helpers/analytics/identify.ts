import { identifyClarityUser } from './adapters/clarity'
import { clearGtmUserId, setGtmUserId } from './adapters/gtm'
import {
  loginWebEngageUser,
  logoutWebEngageUser,
  setWebEngageUserAttributes,
} from './adapters/webengage'

export type AnalyticsUserIdentity = {
  id: string
  mobileNumber?: string
  firstName?: string
  lastName?: string
}

function buildFriendlyName(
  firstName?: string,
  lastName?: string,
): string | undefined {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim()
  return name || undefined
}

/** Bind the authenticated user across analytics vendors (session restore / login). */
export function identifyAnalyticsUser(user: AnalyticsUserIdentity): void {
  if (!user.id) return

  const friendlyName = buildFriendlyName(user.firstName, user.lastName)

  loginWebEngageUser(user.id)
  setWebEngageUserAttributes({
    we_phone: user.mobileNumber,
    we_first_name: user.firstName,
    we_last_name: user.lastName,
  })

  identifyClarityUser(user.id, friendlyName)
  setGtmUserId(user.id)
}

/** Detach the authenticated user on logout so later traffic stays anonymous. */
export function clearAnalyticsUser(): void {
  logoutWebEngageUser()
  clearGtmUserId()
}
