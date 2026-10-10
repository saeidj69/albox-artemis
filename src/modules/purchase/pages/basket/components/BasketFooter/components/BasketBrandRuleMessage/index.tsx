import { cn } from '@/lib/utils'

type BasketBrandRuleMessageProps = {
  minUniqueBrandsCount: number
  className?: string
}

/**
 * Footer copy when the min-unique-brands basket rule fails.
 * Same wording as checkout `basket-footer-summary` brand-rule branch.
 */
const BasketBrandRuleMessage = ({
  minUniqueBrandsCount,
  className,
}: BasketBrandRuleMessageProps) => {
  return (
    <p
      data-slot="basket-brand-rule-message"
      className={cn('typo-body-medium text-error-main', className)}
    >
      خرید از حداقل {minUniqueBrandsCount} برند متفاوت الزامی است
    </p>
  )
}

export default BasketBrandRuleMessage
