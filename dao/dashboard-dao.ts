import { api } from "@/lib/api";
import { AppointmentStatus } from "@/lib/types"; // Garanta que AppointmentStatus é importado

// --- Tipos de Resposta (Devem espelhar o DashboardSummary do Backend) ---

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

  today_appointments: UpcomingAppointmentSummary[];
  weekly_trend: WeeklyTrendPoint[];
}

// --- DAO ---

export const DashboardDAO = {
  /**
   * Obtém todas as métricas e a lista de agendamentos de hoje para o Dashboard.
   */
  async getSummary(token: string): Promise<DashboardSummaryResponse> {
    const response = await api.get("/dashboard/summary", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
