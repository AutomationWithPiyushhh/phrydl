import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyName: string;
  roomNumber: string;
  bedNumber: string;
  checkInDate: string;
  status: string;
}

export function useTenants() {
  return useQuery<Tenant[]>({
    queryKey: ['tenants'],
    queryFn: async () => {
      const response = await api.get('/tenants');
      return response.data.data;
    },
  });
}
