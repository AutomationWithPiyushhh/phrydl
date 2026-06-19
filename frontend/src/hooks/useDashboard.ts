import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DashboardData {
  kpis: {
    totalProperties: number;
    totalTenants: number;
    occupancyRate: number;
    monthlyRevenue: number;
    outstandingDues: number;
    netProfit: number;
    openComplaints?: number;
    monthlyExpenses?: number;
    leadConversionRate?: number;
    complaintResolutionRate?: number;
    revenuePerBed?: number;
    profitability?: number;
    churnRate?: number;
  };
  landingPageAnalytics: {
    totalLeads: number;
    bookRoomClicks: number;
    scheduleVisitClicks: number;
    whatsappClicks: number;
    callClicks: number;
    contactFormSubmissions: number;
  };
  revenueTrend: { name: string; current: number; previous: number }[];
  occupancyTrend: { name: string; current: number; previous: number }[];
}

export function useDashboardKPIs() {
  return useQuery<DashboardData>({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      const response = await api.get('/dashboard');
      return response.data.data;
    },
  });
}
