import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchItems, Item, PaginatedResponse } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface UseItemsResult {
  data?: { pages: { data: Item[]; pagination: { total: number; page: number; limit: number } }[] };
  isLoading: boolean;
  error: Error | null;
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  refetch: () => void;
  isFetchingNextPage: boolean;
}

export function useItems(): UseItemsResult {
  const { accessToken } = useAuth();

  const query = useInfiniteQuery({
    queryKey: ['items'],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => fetchItems(pageParam, 10, accessToken ?? undefined),
    getNextPageParam: (lastPage: PaginatedResponse<Item>) => {
      const { total, page, limit } = lastPage.pagination;
      const hasMore = page * limit < total;
      return hasMore ? page + 1 : undefined;
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    refetch: query.refetch,
    isFetchingNextPage: query.isFetchingNextPage,
  };
} 