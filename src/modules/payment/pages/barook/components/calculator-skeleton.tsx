import Skeleton from '@/lib/Skeleton'

const CalculatorSkeleton = () => (
  <div data-slot="barook-calculator-skeleton" className="flex flex-col">
    <div className="bg-background-secondary flex flex-col gap-4 border-b p-5">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
    </div>
    <div className="flex flex-col gap-4 px-5 py-4">
      <Skeleton className="h-[76px] w-full rounded-[10px]" />
      <Skeleton className="h-12 w-full rounded-[10px]" />
      <Skeleton className="h-5 w-4/5" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-[178px] w-full rounded-[10px]" />
      </div>
    </div>
  </div>
)

export default CalculatorSkeleton
