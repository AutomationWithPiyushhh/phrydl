import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  expenseDate: string;
  status: string;
  propertyName: string;
  title?: string;
  billUrl?: string;
}

export function useExpenses() {
  return useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: async () => {
      const response = await api.get('/expenses');
      return response.data.data;
    },
  });
}
