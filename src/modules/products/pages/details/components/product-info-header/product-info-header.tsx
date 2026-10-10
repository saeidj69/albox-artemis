import Link from 'next/link'

import { ROUTES } from '@/constants'

import { persianDigits } from '@/utils/numbers'

import Chip from '@/lib/Chip'

type ProductInfoHeaderProps = {
  name: string
  brandId: number
  brandName: string
  unitInBox: number
  titleRef: (node?: Element | null) => void
}

const ProductInfoHeader = (props: ProductInfoHeaderProps) => {
  const { name, brandId, brandName, unitInBox, titleRef } = props

  return (
    <>
      <div ref={titleRef}>
        <div className="typo-label-medium my-2">{name}</div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Link
          passHref
          prefetch={false}
          href={ROUTES.BRANDS.detail(brandId)}
          className="text-primary-500 typo-body-medium"
        >
          {brandName}
        </Link>

        <Chip
          as="div"
          size="medium"
          variant="secondary"
          content={<>کارتن {persianDigits(unitInBox)} عددی</>}
        />
      </div>
    </>
  )
}

export default ProductInfoHeader
