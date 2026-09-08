import { z } from "zod";

export const careerStageEnum = z.enum([
  "STUDENT",
  "EARLY_CAREER",
  "PROFESSIONAL",
  "CAREER_SWITCHER",
  "SENIOR_LEADER",
]);

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  careerStage: careerStageEnum,
  currentRole: z.string().trim().max(150).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  serviceId: z.string().trim().optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  message: z
    .string()
    .trim()
    .max(2000, "Message must be under 2000 characters")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const leadStatusEnum = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONVERTED",
  "CLOSED",
]);

export const updateLeadSchema = z.object({
  status: leadStatusEnum.optional(),
  notes: z.string().trim().max(4000).optional(),
});

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
