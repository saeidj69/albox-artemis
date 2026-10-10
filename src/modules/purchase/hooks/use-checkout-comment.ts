import { useCheckoutData } from './use-checkout-data'

export function useCheckoutComment() {
  const { checkout, setComment } = useCheckoutData()

  return { comment: checkout.comment, setComment }
}
