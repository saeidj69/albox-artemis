import Animate from '@/components/Animate'
import Header, { HeaderLogo } from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import { ABOUT_PAGE_DATA } from '@/modules/about/constants/about-page-data'

const AboutPage = () => {
  const { title, data } = ABOUT_PAGE_DATA

  return (
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderBackButton />}
          center="درباره ما"
          left={<HeaderLogo />}
        />
      </Layout.Header>

      <main className="py-4">
        <div className="space-y-8">
          <h2 className="typo-title-large text-primary-600">{title}</h2>

          {data.map((item, index) => (
            <Animate key={item} animation="slideUp" delay={index * 300}>
              <p className="typo-body-large text-text-secondary text-justify leading-8">
                {item}
              </p>
            </Animate>
          ))}
        </div>

        <Animate
          animation="slideUp"
          delay={data.length * 300}
          className="border-border-main mt-12 border-t pt-6"
        >
          <div className="mx-auto max-w-xl text-center">
            <div className="rounded-brand bg-background-secondary p-6">
              <h3 className="text-primary-600 typo-title-large mb-3">
                آل‌باکس
              </h3>

              <p className="typo-body-medium text-text-secondary">
                تجربه‌ای متفاوت از خرید آنلاین
              </p>
              {/* <div className="mt-4 text-xs text-gray-500">
                  © ۱۴۰۳ آل‌باکس. تمامی حقوق محفوظ است.
                </div> */}
            </div>
          </div>
        </Animate>
      </main>
    </>
  )
}

export default AboutPage
