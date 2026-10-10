export const calculateRemainingSeconds = (expiresAt: number) => {
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
}
