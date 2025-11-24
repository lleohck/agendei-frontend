import { api } from "@/lib/api";
import { AppointmentStatus } from "@/lib/types";

export interface UpcomingAppointmentSummary {
  id: string;
  start_dt: string;
  client_name: string;
  professional_name: string;
  service_name: string;
  status: AppointmentStatus;
}

export interface WeeklyTrendPoint {
  week_start_date: string; // Vem como string no formato 'yyyy-MM-dd'
  appointment_count: number;
}

export interface DashboardSummaryResponse {
  total_confirmed_next_7_days: number;
  appointments_today_count: number;
  estimated_revenue_next_7_days: number;
  cancellation_rate_this_month: number; // Ex: 0.15 para 15%
  estimated_revenue_today: number;

  today_appointments: UpcomingAppointmentSummary[];
  weekly_trend: WeeklyTrendPoint[];
}

export interface PopularServicePoint {
  service_name: string;
  appointment_count: number;
}

export const DashboardDAO = {
  async getSummary(token: string): Promise<DashboardSummaryResponse> {
    const response = await api.get("/dashboard/summary", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getPopularServices(token: string): Promise<PopularServicePoint[]> {
    const response = await api.get("/dashboard/popular-services", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
