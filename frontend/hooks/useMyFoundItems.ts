import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';

/** Item and Claim shapes already exist elsewhere; import or recreate if needed */
export interface ClaimLite {
  _id: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
export interface ItemLite {
  _id: string;
  title: string;
  location: string;
  imageUrl?: string;
  createdAt: string;
  claims: ClaimLite[];
}

export function useMyFoundItems() {
  const { get } = useApi();

  return useQuery<ItemLite[]>({
    queryKey: ['my-found-items'],
    queryFn: async () => {
      try {
        return await get<ItemLite[]>('/items/mine');
      } catch (error: any) {
        // Silently handle 401 errors (authentication required)
        // Return empty array so UI shows "no items" instead of error
        if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
          console.log('ℹ️ Not authenticated or no items found - showing empty list');
          return [];
        }
        throw error; // Re-throw other errors
      }
    },
    retry: false, // Don't retry on 401 (authentication required)
    // 401 errors are expected if user is not authenticated
    // The UI should handle this gracefully
  });
}
