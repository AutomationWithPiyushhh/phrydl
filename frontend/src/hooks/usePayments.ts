import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Payment {
  id: string;
  amount: number;
  type: string;
  method: string;
  status: string;
  referenceId: string;
  paymentDate: string;
  tenantName: string;
  propertyName: string;
}

export function usePayments() {
  return useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await api.get('/payments');
      return response.data.data;
    },
  });
}
