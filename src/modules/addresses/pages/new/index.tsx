'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { redirect, useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { Edit2 } from 'iconsax-reactjs'
import { useQueryStates } from 'nuqs'
import { toast } from 'sonner'

import ActionSheet from '@/components/ActionSheet'
import Header from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'
import Map from '@/components/Map'

import AddressForm from '@/modules/addresses/components/address-form'
import { LOCATION_NOT_IN_THE_ZONE_ERROR } from '@/modules/addresses/constants/location-errors'
import {
  useResolveCityFromLocation,
  useTempAddressDraft,
  useUserAddresses,
  type ResolvedCityRegion,
} from '@/modules/addresses/hooks'
import { addressFormCoordinatesSearchParams } from '@/modules/addresses/search-params/address-form-coordinates'
import { buildAddressCreateSelectLocationUrl } from '@/modules/addresses/utils/select-location'
import {
  AddressFormSchema,
  type AddressFormValues,
} from '@/modules/addresses/validation/address-form-schema'

import { englishDigits } from '@/utils/numbers'

import { useCreateAddresses } from '@/api/functions/addresses'
import { useCheckPostalCodeLocation } from '@/api/functions/map'

import AspectRatio from '@/lib/AspectRatio'
import Button from '@/lib/Button'
import { hideSheet, showSheet } from '@/lib/Sheet'

const NewAddressPage = () => {
  const router = useRouter()
  const { addresses, invalidateUserAddresses } = useUserAddresses()

  const { draftValues, persistDraft, clearDraft } = useTempAddressDraft({
    mode: 'create',
  })

  const [{ lat: latParam, lng: lngParam }] = useQueryStates(
    addressFormCoordinatesSearchParams,
  )

  const {
    regionLabel,
    isUnresolvable: isRegionUnresolvable,
    resolveRegion,
  } = useResolveCityFromLocation({ latitude: latParam, longitude: lngParam })

  const initialViewState = useMemo(() => {
    if (!latParam || !lngParam) return undefined

    return {
      latitude: latParam,
      longitude: lngParam,
      zoom: 15,
    }
  }, [latParam, lngParam])

  const shouldBePrimary = addresses.length === 0

  const {
    mutateAsync: checkPostalCodeLocation,
    isPending: isCheckingPostalCode,
  } = useCheckPostalCodeLocation({
    request: { skipErrorToast: true },
  })

  const { mutateAsync: createAddress, isPending } = useCreateAddresses({
    mutation: {
      onSuccess: () => {
        clearDraft()
        invalidateUserAddresses()

        toast.success('آدرس با موفقیت اضافه شد.')

        if (shouldBePrimary) {
          router.replace(ROUTES.HOME)
        } else {
          router.back()
        }
      },
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { errors, isValid },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(AddressFormSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      address: '',
      buildingNumber: '',
      unit: '',
      postalCode: '',
    },
  })

  useEffect(() => {
    if (!draftValues) return

    reset(draftValues)
  }, [draftValues, reset])

  const onEditLocation = (params: { includePostalCode?: boolean }) => {
    const { includePostalCode = false } = params

    if (!latParam || !lngParam) return

    persistDraft(getValues())

    const postalCode = watch('postalCode')

    router.push(
      buildAddressCreateSelectLocationUrl({
        lat: latParam,
        lng: lngParam,
        postalCode: includePostalCode ? englishDigits(postalCode) : undefined,
      }),
    )
  }

  const onCreateAddress = async (values: AddressFormValues) => {
    if (!latParam || !lngParam) return

    // resolved here (not in onSubmit) so the mismatch sheet's confirm path
    // also gets the names; failures must not trigger the mismatch sheet
    let resolvedRegion: ResolvedCityRegion | null = null

    try {
      resolvedRegion = await resolveRegion()
    } catch {
      toast.error('دریافت استان و شهر ناموفق بود. لطفا دوباره تلاش کنید.')
      return
    }

    if (!resolvedRegion) {
      toast.error(
        'استان و شهر موقعیت انتخاب‌شده شناسایی نشد. لطفا موقعیت را ویرایش کنید.',
      )
      return
    }

    await createAddress({
      userId: 'me',
      data: {
        isPrimary: shouldBePrimary,
        name: values.name,
        latitude: latParam,
        longitude: lngParam,
        address: values.address,
        buildingNumber: Number(englishDigits(values.buildingNumber)),
        unit: values.unit ? englishDigits(values.unit) : undefined,
        postalCode: englishDigits(values.postalCode),
        provinceName: resolvedRegion.provinceName,
        cityName: resolvedRegion.cityName,
      },
    })
  }

  const onSubmit = async (values: AddressFormValues) => {
    if (!latParam || !lngParam) {
      toast.error('لطفا موقعیت مکانی را انتخاب کنید')
      return
    }

    try {
      const res = await checkPostalCodeLocation({
        data: {
          latitude: latParam,
          longitude: lngParam,
          postalCode: englishDigits(values.postalCode),
        },
      })

      if (!res?.locationCheck?.containsLocation) {
        throw LOCATION_NOT_IN_THE_ZONE_ERROR
      }

      await onCreateAddress(values)
    } catch (error) {
      const isPostalCodeValid = error === LOCATION_NOT_IN_THE_ZONE_ERROR

      showSheet(ActionSheet, {
        icon: 'warning',
        title: 'عدم تطابق اطلاعات',
        description:
          'سفارش‌ها به موقعیت انتخاب‌شده روی نقشه ارسال می‌شوند. لطفاً از تطابق موقعیت مکانی و کد پستی اطمینان حاصل کنید.',
        actions: [
          {
            id: 'edit',
            children: 'ویرایش موقعیت مکانی',
            variant: 'primary',
            classNames: { root: 'px-0' },
            onClick: () => {
              hideSheet(ActionSheet)
              onEditLocation({ includePostalCode: isPostalCodeValid })
            },
          },
          {
            id: 'confirm-location',
            children: 'موقعیت را تایید می‌کنم',
            variant: 'ghost',
            loading: isPending,
            classNames: { root: 'px-0' },
            onClick: () => {
              hideSheet(ActionSheet)
              void onCreateAddress(values)
            },
          },
        ],
      })
    }
  }

  if (!latParam || !lngParam) {
    redirect(buildAddressCreateSelectLocationUrl())
  }

  return (
    <>
      <Layout.Header height={64}>
        <Header right={<HeaderBackButton />} center="افزودن آدرس جدید" />
      </Layout.Header>

      <form onSubmit={handleSubmit(onSubmit)}>
        <main className="w-app space-y-6 py-4">
          <div
            className="relative"
            onClick={() => onEditLocation({ includePostalCode: false })}
          >
            <AspectRatio
              ratio={350 / 150}
              className="rounded-brand overflow-hidden"
            >
              <Map
                interactive={false}
                pin={{ size: 'small', text: ' موقعیت انتخاب شده ' }}
                initialViewState={initialViewState}
              />
            </AspectRatio>

            <div className="absolute right-3 bottom-3">
              <Button
                size="small"
                variant="text"
                onClick={() => onEditLocation({ includePostalCode: false })}
                startIcon={<Edit2 />}
                classNames={{ root: 'bg-background-main shadow-xs' }}
              >
                ویرایش موقعیت
              </Button>
            </div>
          </div>

          <AddressForm
            register={register}
            errors={errors}
            region={{
              value: regionLabel,
              error: isRegionUnresolvable,
              helperText: isRegionUnresolvable
                ? 'استان و شهر این موقعیت شناسایی نشد؛ موقعیت را ویرایش کنید'
                : undefined,
            }}
          />

          <Button
            type="submit"
            size="large"
            className="w-full"
            loading={isPending || isCheckingPostalCode}
            disabled={!isValid || isRegionUnresolvable}
          >
            ثبت آدرس
          </Button>
        </main>
      </form>
    </>
  )
}

export default NewAddressPage
