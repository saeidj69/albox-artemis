import { useInfiniteQuery } from '@tanstack/react-query'

import {
  getListMyIncentiveCampaignsQueryKey,
  listMyIncentiveCampaigns,
} from '@/api/functions/incentives'
import type { ListMyIncentiveCampaigns200 } from '@/api/models'

const PAGE_LIMIT = 10

export const useListMyCampaignsInfinite = () => {
  return useInfiniteQuery<
    ListMyIncentiveCampaigns200,
    Error,
    {
      campaigns: ListMyIncentiveCampaigns200['campaigns']
      hasMore: boolean
    },
    ReturnType<typeof getListMyIncentiveCampaignsQueryKey>,
    string | null
  >({
    queryKey: getListMyIncentiveCampaignsQueryKey({ limit: PAGE_LIMIT }),
    queryFn: ({ pageParam, signal }) =>
      listMyIncentiveCampaigns(
        {
          limit: PAGE_LIMIT,
          cursor: pageParam ?? undefined,
        },
        { signal },
      ),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.metadata.nextCursor ?? null,
    select: (data) => {
      const campaigns = data.pages.flatMap((page) => page.campaigns)
      const hasMore =
        data.pages[data.pages.length - 1]?.metadata.nextCursor != null

      return { campaigns, hasMore }
    },
  })
}
