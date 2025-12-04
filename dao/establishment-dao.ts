import { api } from "@/lib/api";

export interface EstablishmentData {
  name: string;
  slug?: string;
  address?: string;
  logo_url?: string;
}

export interface EstablishmentResponse {
  id: string;
  name: string;
  slug: string;
  address?: string;
  logo_url?: string;
  owner_id: string;
}

export const EstablishmentDAO = {
  async getMe(token: string): Promise<EstablishmentResponse> {
    const response = await api.get("establishment/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async create(
    data: EstablishmentData,
    token: string
  ): Promise<EstablishmentResponse> {
    const response = await api.post("/establishment/", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async update(
    data: EstablishmentData,
    token: string
  ): Promise<EstablishmentResponse> {
    const response = await api.put("/establishment/me", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
