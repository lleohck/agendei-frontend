import { api } from "@/lib/api";

export interface ServiceAssociationResponse {
  service_id: string;
  name: string;
  base_price: number;
  base_duration_minutes: number;
}

export interface ServiceAssociationRequest {
  service_ids: string[];
}

const ENDPOINT = "servicelink";

export const ProfessionalServiceDAO = {
  // Lista os serviços que um profissional específico oferece
  async getServicesByProfessional(
    professionalId: string,
    token: string
  ): Promise<ServiceAssociationResponse[]> {
    const url = `/${ENDPOINT}/${professionalId}/services`;
    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Atualiza (PUT) a lista completa de serviços oferecidos por um profissional
  async updateProfessionalServices(
    professionalId: string,
    data: ServiceAssociationRequest,
    token: string
  ): Promise<void> {
    const url = `/${ENDPOINT}/${professionalId}/services`;
    await api.put(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
