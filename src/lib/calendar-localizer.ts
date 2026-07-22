import { dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";

const locales = { es };

export const calendarLocalizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  resource?: {
    description?: string | null;
    guestName?: string | null;
    guestEmail?: string | null;
    guestPhone?: string | null;
    recurrence?: string;
    notes?: {
      id: string;
      content: string;
      authorType: string;
      authorName: string | null;
      createdAt: string;
    }[];
    payment?: { id: string; status: string; type: string } | null;
  };
}
