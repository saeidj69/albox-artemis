'use client'

import { useCheckoutComment } from '@/modules/purchase/hooks'

import TextArea from '@/lib/TextArea'

const CheckoutComment = () => {
  const { comment, setComment } = useCheckoutComment()

  return (
    <section>
      <h3 className="typo-title-small text-text-primary mb-3">توضیحات:</h3>

      <TextArea
        rows={3}
        maxLength={512}
        placeholder="توضیح درمورد ارسال سفارش"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
    </section>
  )
}

export default CheckoutComment
