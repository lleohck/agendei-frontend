import { api } from "@/lib/api";

export interface ProfessionalData {
  name: string;
  email: string;
  password: string;
  establishment_id: string;
  bio?: string;
  scheduling_type: "EXACT_TIME" | "FIXED_SLOTS";
  slot_interval_minutes: number;
}

export interface ProfessionalResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
}

export const ProfessionalDAO = {
  async create(
    data: ProfessionalData,
    token: string
  ): Promise<ProfessionalResponse> {
    const url = "/professional/";

    const response = await api.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  async getAll(
    token: string,
    establishmentId: string
  ): Promise<ProfessionalResponse[]> {
    const url = `/professional/list?establishment_id=${establishmentId}`;

    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
