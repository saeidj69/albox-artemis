import { Gift } from 'iconsax-reactjs'

import Alert from '@/lib/Alert'

import { buildIpgCashbackAmountMessage } from './build-ipg-cashback-messages'

type IpgCashbackAlertProps = {
  amount: number
}

const IpgCashbackAlert = ({ amount }: IpgCashbackAlertProps) => {
  return (
    <Alert
      variant="info"
      icon={<Gift variant="Outline" size={20} className="size-5" />}
      classNames={{
        root: 'items-start gap-1 border-info-light bg-transparent bg-gradient-to-l from-secondary-200/40 via-primary-200/40 to-primary-100/40 px-4 py-2 shadow-[0_4px_6px_-4px_rgba(0,0,0,0.04),0_10px_15px_-3px_rgba(0,0,0,0.04)]',
        icon: 'text-secondary-700',
        description: 'typo-body-small leading-6 text-text-primary',
      }}
    >
      {buildIpgCashbackAmountMessage(amount)}
    </Alert>
  )
}

export default IpgCashbackAlert
export type { IpgCashbackAlertProps }
