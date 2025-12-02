import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';

/**
 * Call with: mutate({ itemId, claimId, newStatus })
 */
export function useUpdateClaimStatus() {
  const { put } = useApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (p: { itemId: string; claimId: string; newStatus: 'approved' | 'rejected' }) =>
      put(`/items/${p.itemId}/claim/${p.claimId}/status`, { status: p.newStatus }),
    onSuccess: () => {
      // refresh the “my-found-items” cache so UI shows new status
      qc.invalidateQueries({ queryKey: ['my-found-items'] });
    },
  });
}
