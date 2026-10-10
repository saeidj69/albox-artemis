export function sendClarityEvent(event: string): void {
  if (typeof window === 'undefined') return
  window.clarity?.('event', event)
}

export function setClarityTag(key: string, value: string): void {
  if (typeof window === 'undefined') return
  window.clarity?.('set', key, value)
}

export function identifyClarityUser(
  userId: string,
  friendlyName?: string,
): void {
  if (typeof window === 'undefined' || !userId) return

  if (friendlyName) {
    window.clarity?.('identify', userId, undefined, undefined, friendlyName)
    return
  }

  window.clarity?.('identify', userId)
}
