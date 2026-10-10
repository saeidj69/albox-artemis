import Header, { HeaderLogo, HeaderProfileButton } from '@/components/Header'
import Layout from '@/components/Layout'

import CategoriesList from '@/modules/categories/pages/list/components/categories-list'

import SearchInputComponent from '@/lib/SearchInput'

const CategoriesPage = () => {
  return (
    <>
      <Layout.Header height={64}>
        <Header
          left={<HeaderLogo />}
          center="دسته‌بندی‌ها"
          right={<HeaderProfileButton />}
        />
      </Layout.Header>

      <div className="bg-background-main sticky top-16 right-0 left-0 z-10 py-4">
        <SearchInputComponent
          navigateToExplore={true}
          aria-label="جست‌وجوی محصول"
        />
      </div>

      <main className="pb-4">
        <CategoriesList />
      </main>
    </>
  )
}

export default CategoriesPage
