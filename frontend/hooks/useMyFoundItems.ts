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
    queryFn: () => get<ItemLite[]>('/items/mine'),
  });
}
