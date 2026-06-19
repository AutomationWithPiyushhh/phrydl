import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Property {
  id: string;
  name: string;
  address: string;
  capacity: number;
  type: string;
  status: string;
  occupancy: number;
  occupancyRate: number;
}

export function useProperties() {
  return useQuery<Property[]>({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await api.get('/properties');
      return response.data.data;
    },
  });
}
