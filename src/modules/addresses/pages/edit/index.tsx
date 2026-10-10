'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { redirect, RedirectType, useParams, useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { Edit2 } from 'iconsax-reactjs'
import { getPreviousPath } from 'navlens'
import { useQueryStates } from 'nuqs'
import { toast } from 'sonner'

import ActionSheet from '@/components/ActionSheet'
import Header from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'
import LoadingPage from '@/components/LoadingPage'
import Map from '@/components/Map'

import AddressForm from '@/modules/addresses/components/address-form'
import { LOCATION_NOT_IN_THE_ZONE_ERROR } from '@/modules/addresses/constants/location-errors'
import {
  formatRegionLabel,
  useResolveCityFromLocation,
  useTempAddressDraft,
  useUserAddresses,
  type ResolvedCityRegion,
} from '@/modules/addresses/hooks'
import { addressFormCoordinatesSearchParams } from '@/modules/addresses/search-params/address-form-coordinates'
import { buildAddressEditSelectLocationUrl } from '@/modules/addresses/utils/select-location'
import {
  AddressFormSchema,
  type AddressFormValues,
} from '@/modules/addresses/validation/address-form-schema'

import { englishDigits } from '@/utils/numbers'

import { useUpdateAddresses } from '@/api/functions/addresses'
import { useCheckPostalCodeLocation } from '@/api/functions/map'

import AspectRatio from '@/lib/AspectRatio'
import Button from '@/lib/Button'
import { hideSheet, showSheet } from '@/lib/Sheet'

const EDIT_ADDRESS_FORM_ID = 'edit-address-form'

const EditAddressPage = () => {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const addressId = Number(params.id)

  const { draftValues, persistDraft, clearDraft } = useTempAddressDraft({
    mode: 'edit',
    addressId,
  })

  const [{ lat: latParam, lng: lngParam }] = useQueryStates(
    addressFormCoordinatesSearchParams,
  )

  const {
    addresses,
    isLoading: isLoadingCurrentAddress,
    invalidateUserAddresses,
  } = useUserAddresses()

  const currentAddress = addresses.find((a) => a.id === addressId)

  const latitude = latParam ?? currentAddress?.location.latitude
  const longitude = lngParam ?? currentAddress?.location.longitude

  const initialViewState = useMemo(() => {
    if (latitude == null || longitude == null) return undefined

    return {
      latitude,
      longitude,
      zoom: 15,
    }
  }, [latitude, longitude])

  const hasCoordinatesChanged = latParam != null && lngParam != null

  const {
    regionLabel,
    isUnresolvable: isRegionUnresolvable,
    resolveRegion,
  } = useResolveCityFromLocation({ latitude, longitude })

  const storedRegionLabel = formatRegionLabel({
    provinceName: currentAddress?.provinceName,
    cityName: currentAddress?.cityName,
  })

  const {
    mutateAsync: checkPostalCodeLocation,
    isPending: isCheckingPostalCode,
  } = useCheckPostalCodeLocation({
    request: { skipErrorToast: true },
  })

  const { mutateAsync: updateAddress, isPending } = useUpdateAddresses({
    mutation: {
      onSuccess: () => {
        clearDraft()
        invalidateUserAddresses()
        toast.success('آدرس با موفقیت ویرایش شد.')

        if (getPreviousPath()) {
          router.back()
        } else {
          router.replace(ROUTES.ADDRESSES.ROOT)
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
    formState: { errors, isDirty, isValid },
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
    if (!currentAddress) return

    if (draftValues) {
      reset(draftValues)
      return
    }

    reset({
      name: currentAddress.name,
      address: currentAddress.address,
      buildingNumber: String(currentAddress.buildingNumber),
      unit: currentAddress.unit ?? '',
      postalCode: currentAddress.postalCode ?? '',
    })
  }, [currentAddress, draftValues, reset])

  const onEditLocation = (params: { includePostalCode?: boolean }) => {
    const { includePostalCode = false } = params

    if (latitude == null || longitude == null) return

    persistDraft(getValues())

    const postalCode = watch('postalCode')

    router.push(
      buildAddressEditSelectLocationUrl({
        addressId,
        coordinates: { latitude, longitude },
        postalCode: includePostalCode ? englishDigits(postalCode) : undefined,
      }),
    )
  }

  const onUpdateAddress = async (data: AddressFormValues) => {
    if (latitude == null || longitude == null) return

    // resolved here (not in onSubmit) so the mismatch sheet's confirm path
    // also gets the names; failures must not trigger the mismatch sheet
    let resolvedRegion: ResolvedCityRegion | null = null

    try {
      resolvedRegion = await resolveRegion()
    } catch {
      toast.error('دریافت استان و شهر ناموفق بود. لطفا دوباره تلاش کنید.')
      return
    }

    // unresolved + moved pin → clear the stale names; untouched pin → omit so
    // the server keeps the stored values
    const regionPayload = resolvedRegion
      ? {
          provinceName: resolvedRegion.provinceName,
          cityName: resolvedRegion.cityName,
        }
      : hasCoordinatesChanged
        ? { provinceName: null, cityName: null }
        : {}

    await updateAddress({
      addressId,
      data: {
        name: data.name,
        address: data.address,
        buildingNumber: Number(englishDigits(data.buildingNumber)),
        unit: data.unit,
        postalCode: data.postalCode ? englishDigits(data.postalCode) : null,
        latitude,
        longitude,
        ...regionPayload,
      },
    })
  }

  const onSubmit = async (data: AddressFormValues) => {
    if (latitude == null || longitude == null) {
      toast.error('لطفا موقعیت مکانی را انتخاب کنید')
      return
    }

    try {
      const res = await checkPostalCodeLocation({
        data: {
          latitude,
          longitude,
          postalCode: englishDigits(data.postalCode),
        },
      })

      if (!res?.locationCheck?.containsLocation) {
        throw LOCATION_NOT_IN_THE_ZONE_ERROR
      }

      await onUpdateAddress(data)
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
              void onUpdateAddress(data)
            },
          },
        ],
      })
    }
  }

  if (isLoadingCurrentAddress) {
    return (
      <div className="-mx-4">
        <LoadingPage />
      </div>
    )
  }

  if (!currentAddress) {
    toast.error('این آدرس وجود ندارد')

    redirect(ROUTES.ADDRESSES.ROOT, RedirectType.replace)
  }

  return (
    <>
      <Layout.Header height={64}>
        <Header right={<HeaderBackButton />} center="ویرایش آدرس" />
      </Layout.Header>

      <form id={EDIT_ADDRESS_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
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
                pin={{ size: 'small', text: ' موقعیت انتخاب شده ' }}
                interactive={false}
                initialViewState={initialViewState}
              />
            </AspectRatio>

            <div className="absolute right-3 bottom-3">
              <Button
                type="button"
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
              value: regionLabel || storedRegionLabel,
              error: isRegionUnresolvable && hasCoordinatesChanged,
              helperText:
                isRegionUnresolvable && hasCoordinatesChanged
                  ? 'استان و شهر این موقعیت شناسایی نشد؛ موقعیت را ویرایش کنید'
                  : undefined,
            }}
          />

          <Button
            type="submit"
            size="large"
            className="w-full"
            loading={isPending || isCheckingPostalCode}
            disabled={(!isDirty && !hasCoordinatesChanged) || !isValid}
          >
            ثبت تغییرات
          </Button>
        </main>
      </form>
    </>
  )
}

export default EditAddressPage
