import { api } from "@/lib/api";

export interface ProfessionalData {
  name: string;
  email: string;
  password: string;
  bio?: string;
  scheduling_type: "EXACT_TIME" | "FIXED_SLOTS";
  slot_interval_minutes: number;
}

export interface ProfessionalCreateData {
  name: string;
  email: string;
  password: string;
  bio?: string;
  scheduling_type: "EXACT_TIME" | "FIXED_SLOTS";
  slot_interval_minutes: number;
}

export interface ProfessionalUpdateData {
  name: string;
  email: string;
  bio?: string;
  scheduling_type: "EXACT_TIME" | "FIXED_SLOTS";
  slot_interval_minutes: number;
}

export interface ProfessionalResponse {
  id: string;
  email: string;
  name: string;
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

  async update(
    professionalId: string,
    data: Partial<ProfessionalData>,
    token: string
  ): Promise<ProfessionalResponse> {
    const url = `/professional/${professionalId}`;

    const response = await api.put(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  async delete(professionalId: string, token: string): Promise<void> {
    const url = `/professional/${professionalId}`;

    await api.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async getOne(
    professionalId: string,
    token: string
  ): Promise<ProfessionalData> {
    const url = `/professional/${professionalId}`;

    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getAll(token: string): Promise<ProfessionalResponse[]> {
    const url = `/professional/list`;

    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
