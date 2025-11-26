import { api } from "@/lib/api";

export interface WorkingHourData {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export const WorkingHoursDAO = {
  async get(professionalId: string, token: string): Promise<WorkingHourData[]> {
    const response = await api.get(
      `/professional/${professionalId}/working-hours`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async update(
    professionalId: string,
    data: WorkingHourData[],
    token: string
  ): Promise<void> {
    await api.put(`/professional/${professionalId}/working-hours`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
