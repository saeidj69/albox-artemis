export type LoginState = {
  step: 'phoneNumber' | 'otp'
  previousStep: 'phoneNumber' | 'otp' | 'none'
  phoneNumber: string
  expiresAt: number
  resendAvailableAt: number
}
