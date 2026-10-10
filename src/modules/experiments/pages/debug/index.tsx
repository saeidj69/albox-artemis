'use client'

import { CLIENT_STATE_KEYS } from '@/constants/client-state-keys'
import { useClientState } from '@/hooks/useClientState'

import Header, { HeaderLogo } from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import { useProfile } from '@/api/functions/profile'

import Button from '@/lib/Button'
import Chip from '@/lib/Chip'
import Dropdown from '@/lib/Dropdown'

import { EXPERIMENTS } from '../../constants/experiments'
import { assignVariant } from '../../utils/assignVariant'

const variantLabel = (
  variants: readonly { key: string; label: string }[],
  key: string | undefined,
) => {
  if (!key) return undefined
  return variants.find((variant) => variant.key === key)?.label
}

const ExperimentsDebugPage = () => {
  const { data: profile } = useProfile()
  const { value, setValue, isLoading } = useClientState(
    CLIENT_STATE_KEYS.EXPERIMENTS,
    { shareWithImpersonators: true },
  )

  const handleVariantChange = (experimentId: string, variantKey: string) => {
    setValue((prev) => ({
      ...(prev ?? {}),
      [experimentId]: {
        variant: variantKey,
        assignedAt: Date.now(),
        overridden: true,
      },
    }))
  }

  const handleResetOverride = (
    experimentId: string,
    naturalVariantKey: string,
  ) => {
    setValue((prev) => ({
      ...(prev ?? {}),
      [experimentId]: {
        variant: naturalVariantKey,
        assignedAt: Date.now(),
        overridden: false,
      },
    }))
  }

  return (
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderBackButton />}
          center="آزمایش‌های محصول"
          left={<HeaderLogo />}
        />
      </Layout.Header>

      <main className="w-app space-y-4 py-4">
        <p className="text-text-secondary typo-body-medium">
          هر آزمایش چند نسخه از یک قابلیت را به کاربران نشان می‌دهد. نسخه شما
          معمولاً به‌صورت خودکار انتخاب می‌شود. از این صفحه می‌توانید نسخه را
          دستی عوض کنید.
        </p>

        {isLoading && (
          <p className="text-text-secondary typo-body-medium">
            در حال بارگذاری...
          </p>
        )}

        {!isLoading &&
          Object.values(EXPERIMENTS).map((experiment) => {
            const assignment = value?.[experiment.id]
            const naturalKey = profile
              ? assignVariant(profile.profile.mobileNumber, experiment).key
              : undefined
            const naturalLabel = variantLabel(experiment.variants, naturalKey)
            const currentLabel =
              variantLabel(experiment.variants, assignment?.variant) ??
              naturalLabel
            const isOverridden = Boolean(assignment?.overridden)

            return (
              <div
                key={experiment.id}
                className="border-border-lighter bg-background-main space-y-3 rounded-xl border p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <p className="text-text-primary typo-body-medium-strong">
                      {experiment.title}
                    </p>
                  </div>

                  <Chip
                    as="div"
                    size="small"
                    variant={isOverridden ? 'secondary' : 'soft'}
                    content={isOverridden ? 'بازنویسی دستی' : 'انتخاب خودکار'}
                    classNames={{ root: 'shrink-0' }}
                  />
                </div>

                <p className="text-text-secondary typo-caption">
                  {experiment.description}
                </p>

                <p className="text-text-primary typo-body-medium">
                  نسخه فعلی: {currentLabel ?? '—'}
                </p>

                {isOverridden && naturalKey && naturalLabel && (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-text-secondary typo-caption">
                      نسخه خودکار شما: {naturalLabel}
                    </p>
                  </div>
                )}

                <Dropdown
                  size="small"
                  label="تغییر نسخه"
                  placeholder="انتخاب نسخه"
                  className="w-full"
                  value={assignment?.variant ?? naturalKey}
                  onValueChange={(variantKey) =>
                    handleVariantChange(experiment.id, variantKey)
                  }
                  options={experiment.variants.map((variant) => ({
                    value: variant.key,
                    label: `${variant.label} (${variant.weight}٪)`,
                  }))}
                />

                {naturalKey && isOverridden && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() =>
                      handleResetOverride(experiment.id, naturalKey)
                    }
                  >
                    بازگشت به خودکار
                  </Button>
                )}
              </div>
            )
          })}
      </main>
    </>
  )
}

export default ExperimentsDebugPage
