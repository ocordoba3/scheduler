import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  timezone: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const eventSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY"]).optional(),
  recurrenceEnd: z.string().datetime().optional().nullable(),
  guestName: z.string().optional().nullable(),
  guestEmail: z.string().email().optional().nullable().or(z.literal("")),
  guestPhone: z.string().optional().nullable(),
});

export const bookingSchema = z.object({
  calendarId: z.string().min(1),
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  guestName: z.string().min(2, "El nombre es requerido"),
  guestEmail: z.string().email("Email inválido"),
  guestPhone: z.string().optional(),
  note: z.string().optional(),
  paymentType: z.enum(["DEPOSIT", "FULL"]).optional(),
});

export const calendarSettingsSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  slotDuration: z.number().int().min(15).max(240).optional(),
  timezone: z.string().min(1).optional(),
  paymentsEnabled: z.boolean().optional(),
});

export const availabilityRuleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm"),
});

export const noteSchema = z.object({
  content: z.string().min(1, "El mensaje no puede estar vacío"),
  authorType: z.enum(["OWNER", "GUEST"]),
  authorName: z.string().optional(),
});
