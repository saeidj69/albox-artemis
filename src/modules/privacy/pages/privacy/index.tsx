import Header, { HeaderLogo } from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import { PRIVACY_POLICY_DATA } from '@/modules/privacy/constants/privacy-policy-data'

const PrivacyPage = () => {
  const { sections } = PRIVACY_POLICY_DATA

  return (
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderBackButton />}
          center="قوانین و مقررات"
          left={<HeaderLogo />}
        />
      </Layout.Header>

      <main className="py-4">
        <div className="space-y-8">
          {sections.map((section) => (
            <section
              key={section.id}
              className="border-b-border-lighter space-y-3 border-b pb-4"
            >
              <h2 className="typo-title-large text-primary-600">
                {section.title}
              </h2>

              <p className="typo-body-large text-text-secondary whitespace-pre-line">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </main>
    </>
  )
}

export default PrivacyPage
