'use client'

import Link from 'next/link'

import { ROUTES } from '@/constants'
import { useModal } from '@ebay/nice-modal-react'
import { RiHeartLine, RiSearchLine } from '@remixicon/react'
import { toast } from 'sonner'

import Accordion from '@/lib/Accordian'
import Alert from '@/lib/Alert'
import Breadcrumb from '@/lib/Breadcrumb'
import Button from '@/lib/Button'
import Checkbox from '@/lib/Checkbox'
import Chip from '@/lib/Chip'
import Divider from '@/lib/Divider'
import Dropdown from '@/lib/Dropdown'
import IconButton from '@/lib/IconButton'
import Input from '@/lib/Input'
import InputOtp from '@/lib/InputOtp'
import RadioGroup from '@/lib/Radio'
import { createSheet, Sheet, SheetHeader, showSheet } from '@/lib/Sheet'
import Slider from '@/lib/Slider'
import Spinner from '@/lib/Spinner'
import Switch from '@/lib/Switch'
import Tab from '@/lib/Tab'
import TextArea from '@/lib/TextArea'

const SECTION_TITLE =
  'text-lg font-semibold text-[var(--color-text-primary)] mb-2'
const GROUP_TITLE =
  'text-sm font-medium text-[var(--color-text-secondary)] mb-1'
const CARD =
  'rounded-lg border border-[var(--color-border-main)] bg-[var(--color-background-main)] p-4'

function ShowcaseSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-10">
      <h2 className={SECTION_TITLE}>{title}</h2>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  )
}

function VariantGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className={CARD}>
      <h3 className={GROUP_TITLE}>{title}</h3>
      <div className="flex flex-wrap items-center gap-3 pt-2">{children}</div>
    </div>
  )
}

const DesignSystemDemoSheet = createSheet(
  function DesignSystemDemoSheetContent() {
    const modal = useModal()
    return (
      <Sheet title="نمایش شیت" description="شیت نمونه طراحی سیستم">
        <SheetHeader title="نمایش شیت" showClose />
        <div className="flex flex-col gap-4 p-4">
          <p className="text-text-primary">
            محتوای نمونه با دادهٔ فارسی برای نمایش شیت.
          </p>
          <Button onClick={modal.hide}>بستن</Button>
        </div>
      </Sheet>
    )
  },
)

export default function DesignSystemPage() {
  return (
    <main className="bg-background-secondary min-h-dvh p-6">
      <header className="mb-8">
        <h1 className="text-text-primary text-2xl font-bold">
          طراحی سیستم — نمایش اجزا
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <ShowcaseSection title="دکمه (Button)">
          <VariantGroup title="نوع (variant): primary, secondary, destructive, text, ghost">
            <Button variant="primary">دکمه اصلی</Button>
            <Button variant="secondary">دکمه ثانویه</Button>
            <Button variant="destructive">دکمه مخرب</Button>
            <Button variant="text">دکمه متنی</Button>
            <Button variant="ghost">دکمه شبح</Button>
          </VariantGroup>
          <VariantGroup title="نوع معنایی (variant): error, warning, info, success">
            <Button variant="error">خطا</Button>
            <Button variant="error-light">خطا روشن</Button>
            <Button variant="warning">هشدار</Button>
            <Button variant="warning-light">هشدار روشن</Button>
            <Button variant="info">اطلاعات</Button>
            <Button variant="info-light">اطلاعات روشن</Button>
            <Button variant="success">موفقیت</Button>
            <Button variant="success-light">موفقیت روشن</Button>
          </VariantGroup>
          <VariantGroup title="سایز (size): large, medium, small">
            <Button size="large">بزرگ</Button>
            <Button size="medium">متوسط</Button>
            <Button size="small">کوچک</Button>
          </VariantGroup>
          <VariantGroup title="با آیکون">
            <Button startIcon={<RiSearchLine />}>جستجو</Button>
            <Button endIcon={<RiHeartLine />}>علاقه‌مندی</Button>
          </VariantGroup>
          <VariantGroup title="حالت‌ها: loading, disabled">
            <Button loading>در حال بارگذاری</Button>
            <Button disabled>غیرفعال</Button>
          </VariantGroup>
          <VariantGroup title="اسکلتون">
            <Button.Skeleton size="large">بزرگ</Button.Skeleton>
            <Button.Skeleton size="medium">متوسط</Button.Skeleton>
            <Button.Skeleton size="small">کوچک</Button.Skeleton>
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="هشدار (Alert)">
          <VariantGroup title="نوع: basic, info, warning, success, error">
            <Alert variant="basic" title="پیام پایه" className="w-full">
              این یک هشدار پایه است.
            </Alert>
            <Alert variant="info" title="اطلاعات" className="w-full">
              این یک پیام اطلاع‌رسانی است.
            </Alert>
            <Alert variant="warning" title="هشدار" className="w-full">
              لطفاً این بخش را با دقت بررسی کنید.
            </Alert>
            <Alert variant="success" title="موفقیت" className="w-full">
              عملیات با موفقیت انجام شد.
            </Alert>
            <Alert variant="error" title="خطا" className="w-full">
              متأسفیم، خطایی رخ داد.
            </Alert>
          </VariantGroup>
          <VariantGroup title="با اکشن">
            <Alert
              variant="info"
              title="به‌روزرسانی موجود است"
              className="w-full"
              actions={[
                { id: 'update', children: 'به‌روزرسانی', variant: 'text' },
                { id: 'dismiss', children: 'رد کردن', variant: 'ghost' },
              ]}
            >
              نسخه جدیدی از برنامه در دسترس است.
            </Alert>
            <Alert
              variant="error"
              title="خطا در پرداخت"
              className="w-full"
              actions={[
                { id: 'retry', children: 'تلاش مجدد', variant: 'text' },
              ]}
            >
              پرداخت ناموفق بود، لطفاً دوباره امتحان کنید.
            </Alert>
          </VariantGroup>
          <VariantGroup title="اسکلتون">
            <Alert.Skeleton className="w-full" />
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="آکاردئون (Accordion)">
          <VariantGroup title="تکی — collapsible، یک پنل در هر زمان">
            <Accordion
              type="single"
              collapsible
              defaultValue="ds-acc-1"
              className="border-border-lighter bg-background-main w-full min-w-0 overflow-hidden rounded-xl border"
            >
              <Accordion.Item value="ds-acc-1">
                <Accordion.Trigger>
                  ارسال به چه صورت انجام می‌شود؟
                </Accordion.Trigger>
                <Accordion.Content>
                  سفارش‌ها طبق بازهٔ زمانی انتخاب‌شده تحویل داده می‌شوند.
                </Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="ds-acc-2">
                <Accordion.Trigger>
                  آیا امکان مرجوع وجود دارد؟
                </Accordion.Trigger>
                <Accordion.Content>
                  بله، طبق قوانین مرجوعی درج‌شده در سایت.
                </Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="ds-acc-3">
                <Accordion.Trigger>پشتیبانی چگونه است؟</Accordion.Trigger>
                <Accordion.Content>
                  از طریق چت در اپلیکیشن و تماس تلفنی در دسترس هستیم.
                </Accordion.Content>
              </Accordion.Item>
            </Accordion>
          </VariantGroup>
          <VariantGroup title="چندتایی — چند پنل می‌تواند همزمان باز باشد">
            <Accordion
              type="multiple"
              defaultValue={['ds-acc-m1']}
              className="border-border-lighter bg-background-main w-full min-w-0 overflow-hidden rounded-xl border"
            >
              <Accordion.Item value="ds-acc-m1">
                <Accordion.Trigger>بخش اول</Accordion.Trigger>
                <Accordion.Content>محتوای بخش اول.</Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="ds-acc-m2">
                <Accordion.Trigger>بخش دوم</Accordion.Trigger>
                <Accordion.Content>محتوای بخش دوم.</Accordion.Content>
              </Accordion.Item>
            </Accordion>
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="مسیر (Breadcrumb)">
          <VariantGroup title="پایه با لینک و صفحه جاری">
            <Breadcrumb className="w-full">
              <Breadcrumb.List>
                <Breadcrumb.Item>
                  <Breadcrumb.Link asChild>
                    <Link href={ROUTES.HOME}>صفحه اصلی</Link>
                  </Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  <Breadcrumb.Link asChild>
                    <Link href={ROUTES.CATEGORIES.ROOT}>دسته‌بندی</Link>
                  </Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  <Breadcrumb.Page>محصول نمونه</Breadcrumb.Page>
                </Breadcrumb.Item>
              </Breadcrumb.List>
            </Breadcrumb>
          </VariantGroup>
          <VariantGroup title="با سه‌نقطه (Ellipsis)">
            <Breadcrumb className="w-full">
              <Breadcrumb.List>
                <Breadcrumb.Item>
                  <Breadcrumb.Link asChild>
                    <Link href={ROUTES.HOME}>خانه</Link>
                  </Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  <Breadcrumb.Ellipsis />
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  <Breadcrumb.Page>صفحه عمیق</Breadcrumb.Page>
                </Breadcrumb.Item>
              </Breadcrumb.List>
            </Breadcrumb>
          </VariantGroup>
          <VariantGroup title="اسکلتون">
            <Breadcrumb.Skeleton className="w-full" segmentCount={5} />
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="دکمه آیکون (IconButton)">
          <VariantGroup title="نوع: primary, secondary, ghost">
            <IconButton icon={<RiSearchLine />} variant="primary" />
            <IconButton icon={<RiHeartLine />} variant="secondary" />
            <IconButton icon={<RiHeartLine />} variant="ghost" />
          </VariantGroup>
          <VariantGroup title="سایز: large, medium, small">
            <IconButton icon={<RiSearchLine />} size="large" />
            <IconButton icon={<RiSearchLine />} size="medium" />
            <IconButton icon={<RiSearchLine />} size="small" />
          </VariantGroup>
          <VariantGroup title="اسکلتون">
            <IconButton.Skeleton size="large" />
            <IconButton.Skeleton size="medium" />
            <IconButton.Skeleton size="small" />
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="شیت (Sheet)">
          <VariantGroup title="نمایش شیت نمونه">
            <Button
              variant="secondary"
              onClick={() => showSheet(DesignSystemDemoSheet)}
            >
              باز کردن شیت
            </Button>
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="اعلان (Toast)">
          <VariantGroup title="انواع: success, error, warning, info, message">
            <Button
              variant="primary"
              onClick={() => toast.success('عملیات با موفقیت انجام شد.')}
            >
              موفقیت
            </Button>
            <Button
              variant="primary"
              onClick={() => toast.error('خطایی رخ داد.')}
            >
              خطا
            </Button>
            <Button
              variant="primary"
              onClick={() => toast.warning('هشدار: لطفاً بررسی کنید.')}
            >
              هشدار
            </Button>
            <Button
              variant="primary"
              onClick={() => toast.info('این یک پیام اطلاع‌رسانی است.')}
            >
              اطلاعات
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast('پیام پیش‌فرض با دادهٔ فارسی.')}
            >
              پیام
            </Button>
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="چیپ (Chip)">
          <VariantGroup title="نوع: default، primary، secondary (حاشیه‌دار / پر)">
            <Chip content="پیش‌فرض" variant="default" />
            <Chip content="چیپ اصلی" variant="primary" />
            <Chip content="چیپ ثانویه" variant="secondary" />
          </VariantGroup>
          <VariantGroup title="بدون حاشیه: ghost، soft؛ حاشیه تیره شفاف: outlineInk">
            <Chip content="شبح" variant="ghost" />
            <Chip content="نرم" variant="soft" />
            <Chip content="حاشیه جوهر" variant="outlineInk" />
            <Chip
              content="شبح"
              variant="ghost"
              onClick={() => toast('ghost')}
            />
            <Chip content="نرم" variant="soft" onClick={() => toast('soft')} />
            <Chip
              content="حاشیه جوهر"
              variant="outlineInk"
              onClick={() => toast('outlineInk')}
            />
          </VariantGroup>
          <VariantGroup title="قابل کلیک (با onClick: hover، active، فوکوس)">
            <Chip
              content="کلیک"
              variant="default"
              onClick={() => toast('چیپ پیش‌فرض')}
            />
            <Chip
              content="کلیک"
              variant="primary"
              onClick={() => toast('چیپ اصلی')}
            />
            <Chip
              content="کلیک"
              variant="secondary"
              onClick={() => toast('چیپ ثانویه')}
            />
          </VariantGroup>
          <VariantGroup title="اندازه: small, medium, large">
            <Chip content="بزرگ" size="large" variant="primary" />
            <Chip content="متوسط" size="medium" variant="primary" />
            <Chip content="کوچک" size="small" variant="primary" />
            <Chip content="بزرگ" size="large" variant="secondary" />
            <Chip content="متوسط" size="medium" variant="secondary" />
            <Chip content="کوچک" size="small" variant="secondary" />
          </VariantGroup>
          <VariantGroup title="شروع و پایان (start / end)">
            <Chip content="برچسب" start={<RiHeartLine />} variant="primary" />
            <Chip content="برچسب" end={<RiHeartLine />} variant="primary" />
          </VariantGroup>
          <VariantGroup title="اسکلتون">
            <Chip.Skeleton size="large" className="w-24" />
            <Chip.Skeleton size="medium" className="w-24" />
            <Chip.Skeleton size="small" className="w-24" />
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="ورودی (Input)">
          <VariantGroup title="پایه">
            <Input
              label="ایمیل"
              placeholder="example@mail.com"
              className="min-w-64"
            />
          </VariantGroup>
          <VariantGroup title="با شروع و پایان (start/end)">
            <Input
              label="جستجو"
              placeholder="جستجو کنید..."
              start={<RiSearchLine className="size-5" />}
              className="min-w-64"
            />
          </VariantGroup>
          <VariantGroup title="حالت‌ها: optional, error, disabled, helperText, showLength">
            <Input
              label="نام"
              optional
              placeholder="اختیاری"
              className="min-w-64"
            />
            <Input
              label="کد خطا"
              error
              helperText="این فیلد الزامی است."
              className="min-w-64"
            />
            <Input
              label="غیرفعال"
              disabled
              placeholder="غیرفعال"
              className="min-w-64"
            />
            <Input
              label="محدودیت طول"
              maxLength={20}
              showLength
              placeholder="حداکثر ۲۰ کاراکتر"
              className="min-w-64"
            />
          </VariantGroup>
          <VariantGroup title="اسکلتون">
            <Input.Skeleton className="min-w-64" />
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="کشویی (Dropdown)">
          <VariantGroup title="پایه">
            <Dropdown
              label="شهر"
              placeholder="انتخاب کنید"
              className="min-w-64"
              options={[
                { value: 'tehran', label: 'تهران' },
                { value: 'mashhad', label: 'مشهد' },
                { value: 'isfahan', label: 'اصفهان' },
              ]}
            />
          </VariantGroup>
          <VariantGroup title="سایز: small, medium, large">
            <Dropdown
              size="small"
              label="کوچک"
              placeholder="انتخاب کنید"
              className="min-w-64"
              options={[
                { value: 'a', label: 'گزینه ۱' },
                { value: 'b', label: 'گزینه ۲' },
              ]}
            />
            <Dropdown
              size="medium"
              label="متوسط"
              placeholder="انتخاب کنید"
              className="min-w-64"
              options={[
                { value: 'a', label: 'گزینه ۱' },
                { value: 'b', label: 'گزینه ۲' },
              ]}
            />
            <Dropdown
              size="large"
              label="بزرگ"
              placeholder="انتخاب کنید"
              className="min-w-64"
              options={[
                { value: 'a', label: 'گزینه ۱' },
                { value: 'b', label: 'گزینه ۲' },
              ]}
            />
          </VariantGroup>
          <VariantGroup title="حالت‌ها: optional, error, disabled">
            <Dropdown
              label="اختیاری"
              optional
              placeholder="انتخاب کنید"
              className="min-w-64"
              options={[{ value: 'a', label: 'گزینه ۱' }]}
            />
            <Dropdown
              label="با خطا"
              error
              helperText="این فیلد الزامی است."
              placeholder="انتخاب کنید"
              className="min-w-64"
              options={[{ value: 'a', label: 'گزینه ۱' }]}
            />
            <Dropdown
              label="غیرفعال"
              disabled
              placeholder="غیرفعال"
              className="min-w-64"
              options={[{ value: 'a', label: 'گزینه ۱' }]}
            />
          </VariantGroup>
          <VariantGroup title="اسکلتون">
            <Dropdown.Skeleton size="small" className="min-w-64" />
            <Dropdown.Skeleton size="medium" className="min-w-64" />
            <Dropdown.Skeleton size="large" className="min-w-64" />
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="تب (Tab)">
          <VariantGroup title="سایز: small, medium, large">
            <Tab defaultValue="t1" size="small" className="min-w-64">
              <Tab.List>
                <Tab.Trigger value="t1">تب اول</Tab.Trigger>
                <Tab.Trigger value="t2">تب دوم</Tab.Trigger>
              </Tab.List>
              <Tab.Content value="t1">محتوای تب اول.</Tab.Content>
              <Tab.Content value="t2">محتوای تب دوم.</Tab.Content>
            </Tab>
            <Tab defaultValue="t1" size="medium" className="min-w-64">
              <Tab.List>
                <Tab.Trigger value="t1">تب اول</Tab.Trigger>
                <Tab.Trigger value="t2">تب دوم</Tab.Trigger>
              </Tab.List>
              <Tab.Content value="t1">محتوای تب اول.</Tab.Content>
              <Tab.Content value="t2">محتوای تب دوم.</Tab.Content>
            </Tab>
            <Tab defaultValue="t1" size="large" className="min-w-64">
              <Tab.List>
                <Tab.Trigger value="t1">تب اول</Tab.Trigger>
                <Tab.Trigger value="t2">تب دوم</Tab.Trigger>
              </Tab.List>
              <Tab.Content value="t1">محتوای تب اول.</Tab.Content>
              <Tab.Content value="t2">محتوای تب دوم.</Tab.Content>
            </Tab>
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="ناحیه متنی (TextArea)">
          <VariantGroup title="پایه و حالت‌ها">
            <TextArea
              label="پیام"
              placeholder="متن خود را بنویسید..."
              className="min-w-64"
            />
            <TextArea
              label="با خطا"
              error
              helperText="لطفاً مقدار معتبر وارد کنید."
              className="min-w-64"
            />
            <TextArea
              label="اختیاری"
              optional
              placeholder="(اختیاری)"
              className="min-w-64"
            />
          </VariantGroup>
          <VariantGroup title="اسکلتون">
            <TextArea.Skeleton className="min-w-64" />
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="ورودی OTP (InputOtp)">
          <VariantGroup title="پایه و خطا">
            <InputOtp length={5} label="کد تأیید" className="min-w-0" />
            <InputOtp
              length={6}
              error
              value="12"
              label="کد با خطا"
              className="min-w-0"
            />
          </VariantGroup>
          <VariantGroup title="اسکلتون">
            <InputOtp.Skeleton length={5} />
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="سوئیچ (Switch)">
          <VariantGroup title="سایز: medium, small">
            <Switch size="medium" />
            <Switch size="small" />
          </VariantGroup>
          <VariantGroup title="حالت پیش‌فرض روشن">
            <Switch defaultChecked />
          </VariantGroup>
          <VariantGroup title="اسکلتون">
            <Switch.Skeleton />
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="اسلایدر (Slider)">
          <VariantGroup title="حالت تک‌دسته">
            <Slider
              defaultValue={[30]}
              max={100}
              step={1}
              className="min-w-64"
            />
          </VariantGroup>
          <VariantGroup title="حالت بازه قیمت">
            <Slider
              defaultValue={[100000, 450000]}
              min={0}
              max={500000}
              step={10000}
              className="min-w-64"
            />
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="چک‌باکس (Checkbox)">
          <VariantGroup title="حالت‌ها">
            <Checkbox />
            <Checkbox defaultChecked />
            <Checkbox checked="indeterminate" />
            <Checkbox disabled />
          </VariantGroup>
          <VariantGroup title="اسکلتون">
            <Checkbox.Skeleton />
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="گروه رادیو (RadioGroup)">
          <VariantGroup title="گزینه‌ها">
            <RadioGroup defaultValue="a">
              <RadioGroup.Item value="a" />
              <RadioGroup.Item value="b" />
              <RadioGroup.Item value="c" />
            </RadioGroup>
          </VariantGroup>
          <VariantGroup title="اسکلتون">
            <RadioGroup.Skeleton count={3} />
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="جداکننده (Divider)">
          <VariantGroup title="جهت و سایز">
            <Divider orientation="horizontal" size="small" />
            <Divider orientation="horizontal" size="large" />
            <div className="flex h-12 items-center gap-2">
              <span className="text-sm">چپ</span>
              <Divider orientation="vertical" size="small" />
              <span className="text-sm">راست</span>
            </div>
          </VariantGroup>
        </ShowcaseSection>

        <ShowcaseSection title="اسپینر (Spinner)">
          <VariantGroup title="سایز: large, medium, small">
            <Spinner size="large" />
            <Spinner size="medium" />
            <Spinner size="small" />
          </VariantGroup>
        </ShowcaseSection>
      </div>
    </main>
  )
}
