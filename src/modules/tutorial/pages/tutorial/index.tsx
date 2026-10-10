'use client'

import { Maximize3 } from 'iconsax-reactjs'

import Header, { HeaderLogo } from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import { useVideoFullscreen } from '@/modules/tutorial/hooks/use-video-fullscreen'

import Button from '@/lib/Button'

import TutorialVideoPlayer from './components/tutorialVideoPlayer'

const TutorialPage = () => {
  const { playerRef, enterFullscreen } = useVideoFullscreen()

  return (
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderBackButton />}
          center="راهنمای ثبت سفارش"
          left={<HeaderLogo />}
        />
      </Layout.Header>

      <main className="py-4">
        <div className="text-text-secondary typo-body-medium mb-8">
          در این ویدئو، مراحل انتخاب کالا، ثبت سفارش و انتخاب روش پرداخت را
          به‌صورت کامل برای شما توضیح داده‌ایم.
        </div>

        <TutorialVideoPlayer ref={playerRef} />
      </main>

      <Layout.Footer height={80} className="bg-background-main shadow-sm">
        <div className="p-4">
          <Button
            size="large"
            className="w-full"
            startIcon={<Maximize3 />}
            onClick={enterFullscreen}
          >
            مشاهده تمام صفحه
          </Button>
        </div>
      </Layout.Footer>
    </>
  )
}

export default TutorialPage
