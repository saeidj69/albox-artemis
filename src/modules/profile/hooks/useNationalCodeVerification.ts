import { useProfile } from '@/api/functions/profile'

export const useNationalCodeVerification = () => {
  const { data: profile } = useProfile()

  const verificationStatus =
    profile?.profile?.nationalCodeVerificationStatus?.value

  return { verificationStatus }
}
