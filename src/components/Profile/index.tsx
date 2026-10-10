'use client'

import { Fragment, ReactNode } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ROUTES, SUPPORT_PHONE_NUMBER } from '@/constants'
import { DEPLOYMENT_TAG } from '@/constants/deployment'
import { useActiveCampaign } from '@/hooks/useActiveCampaign'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { useLogout } from '@/hooks/useLogout'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import {
  ArrowRight2,
  Building,
  CallCalling,
  Coin,
  Coin1,
  Edit,
  EmptyWallet,
  Gift,
  Location,
  Logout,
  MessageQuestion,
  ShieldTick,
  Ticket,
  User,
  VideoPlay,
} from 'iconsax-reactjs'

import ActionSheet from '@/components/ActionSheet'
import SmartImage from '@/components/SmartImage'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

import { useProfile } from '@/api/functions/profile'
import {
  useGetClientBalance,
  useListClientGames,
} from '@/api/functions/tyche/client'
import { useGetVersion } from '@/api/functions/version'
import { useGetPaymentProfile } from '@/api/functions/wallet-management'

import Button from '@/lib/Button'
import Chip from '@/lib/Chip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/lib/Dialog'
import Divider from '@/lib/Divider'
import {
  createDrawer,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  hideDrawer,
  showDrawer,
  useDrawer,
} from '@/lib/Drawer'
import IconButton from '@/lib/IconButton'
import { hideSheet, showSheet } from '@/lib/Sheet'
import { cn } from '@/lib/utils'

import Animate from '../Animate'
import BounceJump from '../BounceJump'
import Header from '../Header'
import Layout from '../Layout'
import useProfileModal from './hooks'

type ProfileItem = {
  id: string
  title: string
  onClick: () => void
  variant: 'normal' | 'destructive'
  start: ReactNode
  end?: ReactNode
  badge?: ReactNode
}

type ProfileSection = {
  id: string
  items: ProfileItem[]
}

const ProfileComponent = () => {
  const router = useRouter()
  const isDesktop = useIsDesktop()
  const profileDrawer = useDrawer()

  const [animateParent] = useAutoAnimate()

  const { data: profile } = useProfile()
  const { data: games } = useListClientGames()
  const { setShowProfileModal } = useProfileModal()
  const { data: gameBalance } = useGetClientBalance()
  const { data: paymentProfile } = useGetPaymentProfile()
  const { campaign: activeCampaign } = useActiveCampaign()

  const { data: backendVersion } = useGetVersion()

  const user = profile?.profile
  const userName = user?.firstName + ' ' + user?.lastName
  const phoneNumber = user?.mobileNumber.replace('+98', '0')

  const walletBalance =
    paymentProfile?.amounts.reduce((sum, item) => sum + item.amount, 0) ?? 0

  const onCloseDrawer = () => {
    profileDrawer.hide()
    setShowProfileModal(false)
  }

  const { logout, isLoggingOut } = useLogout({
    onSuccess: () => {
      setShowProfileModal(false)
      hideSheet(ActionSheet)
      onCloseDrawer()
    },
  })

  const onOpenChange = (open: boolean) => {
    if (!open) onCloseDrawer()
  }

  const onLogoutClick = () => {
    showSheet(ActionSheet, {
      title: 'خروج',
      description: 'آیا برای خروج از حساب کاربری خود مطمئن هستید؟',
      actions: [
        {
          id: 'cancel',
          children: 'انصراف',
          variant: 'ghost',
          className:
            'w-full border-primary-400 bg-white text-primary-700 hover:bg-primary-50 active:bg-primary-100',
          classNames: { content: 'text-primary-700' },
          disabled: isLoggingOut,
          onClick: () => {
            hideSheet(ActionSheet)
            showDrawer(Profile)
          },
        },
        {
          id: 'logout',
          children: 'بله، خروج',
          variant: 'destructive-soft',
          className:
            'w-full bg-error-light text-error-dark hover:bg-error-light active:bg-error-light',
          classNames: { content: 'text-error-dark' },
          loading: isLoggingOut,
          disabled: isLoggingOut,
          onClick: logout,
        },
      ],
    })
  }

  const version = DEPLOYMENT_TAG + ' | ' + backendVersion?.version

  const sections: ProfileSection[] = [
    {
      id: 'account',
      items: [
        {
          id: 'wallet',
          title: 'کیف پول و هدیه',
          variant: 'normal',
          start: <EmptyWallet />,
          end: walletBalance > 0 && (
            <Animate
              animation="slideRight"
              className="flex flex-col justify-center"
            >
              <Chip
                content={`${formatPrice(toTomanPrice(walletBalance))} تومان`}
                variant="ghost"
                classNames={{
                  root: 'bg-primary-50 border-primary-300',
                  content: 'text-primary-600',
                }}
              />
            </Animate>
          ),
          onClick: () => {
            hideDrawer(Profile)
            router.push(ROUTES.WALLET.ROOT)
          },
        },
        {
          id: 'addresses',
          title: 'آدرس‌ها',
          variant: 'normal',
          start: <Location />,
          onClick: () => {
            hideDrawer(Profile)
            router.push(ROUTES.ADDRESSES.ROOT)
          },
        },
      ],
    },
    {
      id: 'games',
      items:
        games?.games?.map((game) => ({
          id: game.id.toString(),
          title: game?.shortDescription,
          variant: 'normal',
          badge: game?.badges?.length > 0 && (
            <BounceJump>
              <Chip
                content={game?.badges?.[0]?.text}
                variant="ghost"
                styles={{
                  root: {
                    backgroundColor: game.badges?.[0]?.backgroundColor,
                  },
                  content: {
                    color: game.badges?.[0]?.color,
                  },
                }}
              />
            </BounceJump>
          ),
          start: (
            <SmartImage
              fill
              className="size-6"
              sizes="24px"
              src={game?.icon ?? ''}
              alt={game?.shortDescription ?? ''}
            />
          ),
          end: Boolean(gameBalance?.balance) && (
            <Animate animation="slideRight">
              <Chip
                content={formatPrice(gameBalance?.balance ?? 0) + ' بلیط فعال'}
                variant="ghost"
                classNames={{
                  root: 'bg-secondary-50',
                  content: 'text-secondary-600',
                }}
                start={<Ticket className="text-secondary-600 size-4" />}
              />
            </Animate>
          ),
          onClick: () => {
            profileDrawer.hide()
            router.push(ROUTES.GAME(game.id))
          },
        })) || [],
    },
    {
      id: 'nmv',
      items: [
        {
          id: 'nmv',
          title: 'سود بی‌نهایت',
          variant: 'normal',
          start: <Coin1 />,
          onClick: () => {
            hideDrawer(Profile)
            router.push(
              activeCampaign
                ? ROUTES.CAMPAIGNS.detail(activeCampaign.id)
                : ROUTES.CAMPAIGNS.ROOT,
            )
          },
        },
      ],
    },
    {
      id: 'support',
      items: [
        {
          id: 'tutorial',
          title: 'راهنمای ثبت سفارش',
          variant: 'normal',
          start: <VideoPlay />,
          onClick: () => {
            hideDrawer(Profile)
            router.push(ROUTES.TUTORIAL)
          },
        },
        {
          id: 'faq',
          title: 'سوالات پرتکرار',
          variant: 'normal',
          start: <MessageQuestion />,
          onClick: () => {
            hideDrawer(Profile)
            router.push(ROUTES.FAQ)
          },
        },
        {
          id: 'about',
          title: 'درباره ما',
          variant: 'normal',
          start: <Building />,
          end: !!version && (
            <Animate animation="slideRight">
              <Chip content={version} variant="soft" />
            </Animate>
          ),
          onClick: () => {
            hideDrawer(Profile)
            router.push(ROUTES.ABOUT)
          },
        },
        {
          id: 'terms',
          title: 'قوانین و مقررات',
          variant: 'normal',
          start: <ShieldTick />,
          onClick: () => {
            hideDrawer(Profile)
            router.push(ROUTES.PRIVACY)
          },
        },
      ],
    },
    {
      id: 'logout',
      items: [
        {
          id: 'logout',
          title: 'خروج از حساب کاربری',
          variant: 'destructive',
          start: <Logout className="text-error-main" />,
          onClick: onLogoutClick,
        },
      ],
    },
  ]

  const Content = isDesktop ? DialogContent : DrawerContent
  const Title = isDesktop ? DialogTitle : DrawerTitle
  const Description = isDesktop ? DialogDescription : DrawerDescription

  const body = (
    <Content
      className={cn(
        'flex flex-col overflow-hidden p-0',
        isDesktop
          ? 'top-0 left-1/2 h-dvh max-h-dvh max-w-md -translate-x-1/2 translate-y-0 rounded-none shadow-none'
          : 'h-dvh max-h-dvh data-[vaul-drawer-direction=right]:rounded-none',
      )}
    >
      <Title className="sr-only">حساب کاربری</Title>
      <Description className="sr-only">
        مدیریت حساب کاربری، آدرس‌ها، کیف پول و تنظیمات
      </Description>

      <Header
        right={
          <IconButton
            variant="ghost"
            icon={<ArrowRight2 />}
            onClick={onCloseDrawer}
          />
        }
        center="حساب کاربری"
        className="shadow-none"
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-4 pt-2">
        <div
          className={cn(
            'border-border-lighter rounded-brand flex shrink-0 items-center justify-between border',
            'p-3',
          )}
        >
          <div className="flex items-center gap-2">
            <div className="bg-secondary-50 rounded-full p-4">
              <User className="text-primary-600 size-8" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-text-primary typo-body-large">
                {userName}
              </div>
              <div className="text-text-secondary typo-body-small">
                {phoneNumber}
              </div>
            </div>
          </div>

          <Link href={ROUTES.PROFILE.EDIT} prefetch={false}>
            <IconButton
              onClick={() => hideDrawer(Profile)}
              variant="ghost"
              size="large"
              icon={<Edit />}
            />
          </Link>
        </div>

        <div ref={animateParent} className="mt-4 min-h-0 min-w-0 flex-1">
          {sections.map((section, sectionIndex) => {
            if (!section?.items?.length) {
              return null
            }

            return (
              <Fragment key={section.id}>
                {section.items.map((item, itemIndex) => {
                  return (
                    <Fragment key={item.id}>
                      <Animate delay={sectionIndex * 50 + itemIndex * 50}>
                        <button
                          onClick={item.onClick}
                          className={cn(
                            'rounded-brand flex w-full cursor-pointer items-center justify-between px-4 py-3',
                            'hover:bg-background-secondary active:bg-background-darker h-14 duration-100',
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {item.start}

                            <div
                              className={cn(
                                'min-w-0',
                                item.variant === 'destructive' &&
                                  'text-error-main',
                              )}
                            >
                              {item.title}
                            </div>

                            {item?.badge}
                          </div>

                          {item.end}
                        </button>
                      </Animate>

                      {itemIndex !== section.items.length - 1 && (
                        <Animate
                          delay={sectionIndex * 50 + itemIndex * 50 + 50}
                        >
                          <Divider className="my-1" />
                        </Animate>
                      )}
                    </Fragment>
                  )
                })}

                {sectionIndex !== sections.length - 1 && (
                  <Divider className="my-1" size="large" />
                )}
              </Fragment>
            )
          })}
        </div>
      </div>

      <Layout.Footer height={64} className="p-4">
        <Button
          as="a"
          href={`tel:${SUPPORT_PHONE_NUMBER}`}
          variant="primary"
          size="medium"
          className="w-full"
          startIcon={<CallCalling />}
          onClick={onCloseDrawer}
        >
          تماس با پشتیبانی
        </Button>
      </Layout.Footer>
    </Content>
  )

  return isDesktop ? (
    <Dialog open={profileDrawer.visible} onOpenChange={onOpenChange}>
      {body}
    </Dialog>
  ) : (
    <Drawer
      direction="right"
      open={profileDrawer.visible}
      onOpenChange={onOpenChange}
    >
      {body}
    </Drawer>
  )
}

const Profile = createDrawer(ProfileComponent)

export default Profile
