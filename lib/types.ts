import z from "zod";

export enum UserRole {
  ADMIN = "ADMIN",
  ESTABLISHMENT_OWNER = "ESTABLISHMENT_OWNER",
  PROFESSIONAL = "PROFESSIONAL",
  CLIENT = "CLIENT",
  GUEST = "GUEST",
}

export const professionalFormSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  establishmentId: z.string().uuid(),
  bio: z.string().max(500).optional(),
  schedulingType: z.enum(["EXACT_TIME", "FIXED_SLOTS"]),
  slotIntervalMinutes: z.coerce.number().min(5),
  password: z
    .string()
    .trim() // Remove espaços em branco antes da validação
    .min(8, { message: "Password must be at least 8 characters." })
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type ProfessionalFormValues = z.infer<typeof professionalFormSchema>;

export enum AppointmentStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  CONFIRMED = "CONFIRMED",
  CANCELED = "CANCELED",
  COMPLETED = "COMPLETED",
}

export enum SchedulingType {
  EXACT_TIME = "EXACT_TIME",
  FIXED_SLOTS = "FIXED_SLOTS",
}

// ... imports

// --- Tipos de Detalhe ---

export interface ProfessionalDetail {
  id: string;
  name: string;
}

export interface ServiceDetail {
  id: string;
  name: string;
  base_duration_minutes: number;
  base_price: number; // Ou string, dependendo de como a API serializa Decimal
}

export interface ClientDetail {
  id: string;
  name: string;
  email: string;
}


export interface AppointmentResponse {
  id: string
  start_dt: string // Data/hora de início
  end_dt: string   // Data/hora de fim
  status: AppointmentStatus
  amount_paid: number
  
  // Detalhes carregados via JOINs do Backend
  professional: ProfessionalDetail
  service: ServiceDetail
  client: ClientDetail
}

// ... o restante do DAO é o mesmo
