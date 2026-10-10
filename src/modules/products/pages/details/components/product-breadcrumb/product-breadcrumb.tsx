import Link from 'next/link'

import { ROUTES } from '@/constants'

import Breadcrumb from '@/lib/Breadcrumb'

type ProductBreadcrumbProps = {
  categoryId: number
  categoryName: string
}

const ProductBreadcrumb = (props: ProductBreadcrumbProps) => {
  const { categoryId, categoryName } = props

  return (
    <Breadcrumb>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link asChild>
            <Link href={ROUTES.HOME} prefetch={false}>
              صفحه اصلی
            </Link>
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator>/</Breadcrumb.Separator>
        <Breadcrumb.Item>
          <Breadcrumb.Link asChild>
            <Link href={ROUTES.CATEGORIES.detail(categoryId)} prefetch={false}>
              {categoryName}
            </Link>
          </Breadcrumb.Link>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  )
}

export default ProductBreadcrumb
