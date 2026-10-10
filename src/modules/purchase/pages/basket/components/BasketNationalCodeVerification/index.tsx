import NationalCodeVerificationWarning from '@/components/NationalCodeVerificationWarning'

import { useNationalCodeVerification } from '@/modules/profile/hooks/useNationalCodeVerification'

const BasketNationalCodeVerification = () => {
  const { verificationStatus } = useNationalCodeVerification()

  return (
    <NationalCodeVerificationWarning
      verificationStatus={verificationStatus}
      hasAction
    />
  )
}

export default BasketNationalCodeVerification
