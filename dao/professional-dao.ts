import { api } from "@/lib/api";

interface ProfessionalData {
  fullName: string;
  email: string;
  password: string;
}

interface ProfessionalResponse {
  id: number;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

export const ProfessionalDAO = {
  async registerProfessional(
    data: ProfessionalData,
    token: string
  ): Promise<ProfessionalResponse> {
    const url = "/professionals/register";

    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      id: Math.floor(Math.random() * 1000),
      email: data.email,
      fullName: data.fullName,
      role: "PROFESSIONAL",
      isActive: true,
    } as ProfessionalResponse;
  },

  async getProfessionals(
    token: string,
    establishmentId: number
  ): Promise<ProfessionalResponse[]> {
    const url = `/professionals/?establishment_id=${establishmentId}`;

    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
