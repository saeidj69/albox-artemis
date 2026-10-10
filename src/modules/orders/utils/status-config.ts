import {
  RiBankCardLine,
  RiBox3Line,
  RiCheckLine,
  RiCloseLargeLine,
  RiTimeLine,
  RiTruckLine,
  RiUserReceived2Line,
  type RemixiconComponentType,
} from '@remixicon/react'

import type { OrderSimplifiedOrderStatus } from '@/api/models'

type StatusConfig = {
  icon: RemixiconComponentType
  description: string
}

export const ORDER_STATUS_CONFIG: Record<
  OrderSimplifiedOrderStatus,
  StatusConfig
> = {
  pending_customer_approval: {
    icon: RiUserReceived2Line,
    description: 'سفارش شما در انتظار تایید شماست.',
  },
  pending_payment: {
    icon: RiBankCardLine,
    description: 'سفارش شما در انتظار پرداخت است.',
  },
  pending_approval: {
    icon: RiTimeLine,
    description: 'سفارش شما ثبت شده و در انتظار تایید سیستم است.',
  },
  processing: {
    icon: RiBox3Line,
    description: 'سفارش شما تایید شده و در حال جمع‌آوری است.',
  },
  delivering: {
    icon: RiTruckLine,
    description: 'سفارش شما تامین شده و در مسیر فروشگاه شما است.',
  },
  delivered: {
    icon: RiCheckLine,
    description: 'سفارش شما تحویل داده شده است.',
  },
  canceled: {
    icon: RiCloseLargeLine,
    description: 'سفارش شما توسط تیم پشتیبانی آل‌باکس لغو شد.',
  },
}
