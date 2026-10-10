'use client'

import { EmptyWallet, Gift } from 'iconsax-reactjs'

import Animate from '@/components/Animate'
import Header, { HeaderLogo } from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import { useGetPaymentProfile } from '@/api/functions/wallet-management'

import Alert from '@/lib/Alert'

import BalanceCard from './components/BalanceCard'
import BarookWalletCard from './components/BarookWalletCard'
import WalletTypeCard from './components/WalletTypeCard'

const WalletPage = () => {
  const { data } = useGetPaymentProfile({
    query: {
      select(data) {
        const creditAmount =
          data?.amounts.find((item) => item.type.value === 'credit')?.amount ??
          0

        const giftAmount =
          data?.amounts.find((item) => item.type.value === 'gift')?.amount ?? 0

        const barookAmount =
          data?.amounts.find((item) => item.type.value === 'barook')?.amount ??
          0

        const barookSpendableAmount =
          data?.amounts.find((item) => item.type.value === 'barook')
            ?.spendableAmount ?? 0

        return {
          creditAmount,
          giftAmount,
          barookAmount,
          barookSpendableAmount,
          totalAmount: data.totalAmount,
        }
      },
    },
  })

  return (
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderBackButton />}
          center="کیف پول"
          left={<HeaderLogo />}
        />
      </Layout.Header>

      <main className="w-app grid gap-4 py-4">
        {!data ? (
          <BalanceCard.Skeleton />
        ) : (
          <BalanceCard balance={data.totalAmount} />
        )}

        <div className="grid grid-cols-2 gap-3">
          {!data ? (
            <div className="col-span-2">
              <BarookWalletCard.Skeleton />
            </div>
          ) : data.barookAmount > 0 && data.barookSpendableAmount > 0 ? (
            <div className="col-span-2">
              <BarookWalletCard
                amount={data.barookAmount}
                spendableAmount={data.barookSpendableAmount}
              />
            </div>
          ) : null}

          {!data ? (
            <>
              <WalletTypeCard.Skeleton />
              <WalletTypeCard.Skeleton />
            </>
          ) : (
            <>
              <WalletTypeCard
                index={0}
                title="شارژ کیف پول"
                amount={data.creditAmount}
                icon={<EmptyWallet className="text-primary-500 size-5" />}
              />

              <WalletTypeCard
                index={1}
                title="هدیه"
                amount={data.giftAmount}
                icon={<Gift className="text-primary-500 size-5" />}
              />
            </>
          )}

          <div className="col-span-2">
            {data && (
              <Animate animation="slideUp" delay={400}>
                <Alert
                  variant="info"
                  title="شما می‌توانید با فعال کردن گزینه &laquo;کیف پول&raquo; در مرحله‌ی آخر پرداخت از موجودی کیف پول خود استفاده کنید."
                />
              </Animate>
            )}
          </div>
        </div>
      </main>

      {/* <Layout.Footer height={64} className="bg-background-main shadow-sm">
        <div className="p-4">
          <Button
            disabled
            size="large"
            className="w-full"
            startIcon={<Add />}
            onClick={() => router.push(ROUTES.WALLET.CHARGE)}
          >
            افزایش موجودی کیف پول
          </Button>
        </div>
      </Layout.Footer> */}
    </>
  )
}

export default WalletPage
