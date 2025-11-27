import { api } from "@/lib/api";

export interface ServiceData {
  name: string;
  description?: string;
  base_price: number;
  base_duration_minutes: number;
}
export interface ServiceCreateData {
  name: string;
  description?: string;
  base_price: number;
  base_duration_minutes: number;
}
export interface ServiceUpdateData {
  name?: string;
  description?: string;
  base_price?: number;
  base_duration_minutes?: number;
}

export interface ServiceResponse {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  base_duration_minutes: number;
}

const ENDPOINT = "service";

export const ServiceDAO = {
  async getOne(serviceId: string, token: string): Promise<ServiceResponse> {
    const url = `/${ENDPOINT}/${serviceId}`;
    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async create(data: ServiceData, token: string): Promise<ServiceResponse> {
    const url = `/${ENDPOINT}/`;
    const response = await api.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getAll(
    token: string
  ): Promise<ServiceResponse[]> {
    const url = `/${ENDPOINT}/list`;
    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  async update(
    serviceId: string,
    data: ServiceUpdateData,
    token: string
  ): Promise<ServiceResponse> {
    const url = `/${ENDPOINT}/${serviceId}`;
    const response = await api.put(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async delete(serviceId: string, token: string): Promise<void> {
    const url = `/${ENDPOINT}/${serviceId}`;
    await api.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
