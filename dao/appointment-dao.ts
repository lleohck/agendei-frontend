import { api } from "@/lib/api";
import { AppointmentResponse, AppointmentStatus } from "@/lib/types"; // Assumindo que você definiu AppointmentStatus em types

// --- Tipos de Agendamento ---

export interface AppointmentCreateData {
  professional_id: string;
  service_id: string;
  start_dt: string;
}

// A rota /availability retorna uma lista de strings (datetimes)
export type AvailableSlotsResponse = string[];

// --- DAO ---

export const AppointmentDAO = {
  // 1. Busca slots disponíveis
  async getAvailableSlots(
    professionalId: string,
    serviceId: string,
    targetDate: string, // YYYY-MM-DD
    token: string
  ): Promise<AvailableSlotsResponse> {
    const url = `/availability/`;
    const response = await api.get(url, {
      params: {
        professional_id: professionalId,
        service_id: serviceId,
        target_date: targetDate,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // 2. Cria um novo agendamento
  async create(
    data: AppointmentCreateData,
    token: string
  ): Promise<AppointmentResponse> {
    const url = `/appointments/`;
    const response = await api.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // 3. (OPCIONAL) Listar meus agendamentos
  async getMyAppointments(token: string): Promise<AppointmentResponse[]> {
    const url = `/appointments/me`;
    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async updateStatus(
    appointmentId: string,
    newStatus: AppointmentStatus,
    token: string
  ): Promise<AppointmentResponse> {
    const url = `/appointments/${appointmentId}/status`;
    const response = await api.patch(
      url,
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};
