import Header, { HeaderLogo, HeaderProfileButton } from '@/components/Header'
import Layout from '@/components/Layout'

import BrandsList from '@/modules/brands/pages/list/components/brands-list'

import SearchInput from '@/lib/SearchInput'

const BrandsListPage = () => {
  return (
    <>
      <Layout.Header height={64}>
        <Header
          left={<HeaderLogo />}
          center="برند‌ها"
          right={<HeaderProfileButton />}
        />
      </Layout.Header>

      <div className="bg-background-main sticky top-16 right-0 left-0 z-10 py-4">
        <SearchInput navigateToExplore={true} aria-label="جست‌وجوی محصول" />
      </div>

      <main className="pb-4">
        <BrandsList />
      </main>
    </>
  )
}

export default BrandsListPage
