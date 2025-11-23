import { api } from "@/lib/api";

export interface EstablishmentData {
  name: string;
  slug: string;
  logo_url?: string;
}

export interface EstablishmentResponse {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  owner_id: string;
}

export const EstablishmentDAO = {
  async getAll(token: string): Promise<EstablishmentResponse[]> {
    const response = await api.get("/establishment/list", {
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
};
