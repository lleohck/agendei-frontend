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
