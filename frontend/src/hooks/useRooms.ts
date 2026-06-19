import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Bed {
  id: string;
  bedNumber: string;
  status: string;
  tenantName: string | null;
}

export interface Room {
  id: string;
  roomNumber: string;
  type: string;
  status: string;
  beds: Bed[];
  propertyName: string;
}

export function useRooms() {
  return useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await api.get('/rooms');
      return response.data.data;
    },
  });
}
