export type EventStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type RecurrenceType = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";
export type NoteAuthorType = "OWNER" | "GUEST";

export interface EventNote {
  id: string;
  eventId: string;
  content: string;
  authorType: NoteAuthorType;
  authorName: string | null;
  createdAt: string;
}

export interface Event {
  id: string;
  calendarId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: EventStatus;
  recurrence: RecurrenceType;
  recurrenceEnd: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityRule {
  id: string;
  calendarId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}
