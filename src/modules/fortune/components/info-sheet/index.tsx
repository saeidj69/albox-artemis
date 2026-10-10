'use client'

import { useDebouncedValue } from 'rooks'

import SmartImage from '@/components/SmartImage'

import { useListClientGrantRules } from '@/api/functions/tyche/client'
import type { ClientGrantRule } from '@/api/models/tyche'

import Button from '@/lib/Button'
import {
  createSheet,
  Sheet,
  SheetFooter,
  SheetHeader,
  useSheet,
} from '@/lib/Sheet'
import Skeleton from '@/lib/Skeleton'

const SKELETON_COUNT = 1

const GrantRuleItem = ({ rule }: { rule: ClientGrantRule }) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="typo-body-medium text-text-secondary">
        <span className="typo-label-medium text-text-primary">
          {rule.shortDescription}
        </span>{' '}
        {rule.description}
      </p>

      <SmartImage
        fill
        className="size-8 shrink-0"
        sizes="32px"
        src={rule.icon}
        alt={rule.shortDescription}
      />
    </div>
  )
}

const GrantRuleItemSkeleton = () => (
  <div className="flex items-center justify-between gap-3">
    <Skeleton className="rounded-brand h-5 w-48" />
    <Skeleton className="size-8 shrink-0 rounded-full" />
  </div>
)

const InformationSheetComponent = () => {
  const sheet = useSheet()

  const { data } = useListClientGrantRules()

  const [debouncedGrantRules] = useDebouncedValue(data?.grantRules ?? [], 500)

  const grantRules = data?.grantRules ?? []

  return (
    <Sheet
      title="راهنمای دریافت بلیط"
      description="راهنمای دریافت بلیط گردونه شانس"
    >
      <SheetHeader title="راهنمای دریافت بلیط" showClose />

      <div className="flex flex-col gap-5 px-4 py-2">
        {!debouncedGrantRules.length
          ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <GrantRuleItemSkeleton key={index} />
            ))
          : grantRules.map((rule) => (
              <GrantRuleItem key={rule.id} rule={rule} />
            ))}
      </div>

      <SheetFooter>
        <Button
          type="button"
          variant="primary"
          className="w-full"
          onClick={() => void sheet.hide()}
        >
          بزن بریم
        </Button>
      </SheetFooter>
    </Sheet>
  )
}

const InformationSheet = createSheet(InformationSheetComponent)

export default InformationSheet
