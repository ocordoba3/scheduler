export type EventStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
};

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#22c55e",
  CANCELLED: "#94a3b8",
};

export const RECURRENCE_LABELS = {
  NONE: "Sin recurrencia",
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
};

export const DAY_LABELS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export const TIMEZONES = [
  "America/Bogota",
  "America/Mexico_City",
  "America/Argentina/Buenos_Aires",
  "America/Santiago",
  "America/Lima",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/Madrid",
  "UTC",
];

export const SLOT_DURATIONS = [15, 30, 45, 60, 90, 120];
