import {
  addDays,
  addMinutes,
  endOfDay,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export interface AvailabilityRule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ExistingEvent {
  startTime: Date;
  endTime: Date;
  status: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
}

function parseTimeOnDate(date: Date, time: string, timezone: string): Date {
  const dateStr = format(toZonedTime(date, timezone), "yyyy-MM-dd");
  const localIso = `${dateStr}T${time}:00`;
  return fromZonedTime(localIso, timezone);
}

function overlaps(
  slotStart: Date,
  slotEnd: Date,
  eventStart: Date,
  eventEnd: Date
): boolean {
  return slotStart < eventEnd && slotEnd > eventStart;
}

export function generateAvailableSlots(
  from: Date,
  to: Date,
  availability: AvailabilityRule[],
  events: ExistingEvent[],
  slotDurationMinutes: number,
  timezone: string
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const activeEvents = events.filter((e) => e.status !== "CANCELLED");
  let current = startOfDay(from);

  while (!isAfter(current, to)) {
    const dayOfWeek = toZonedTime(current, timezone).getDay();
    const dayRules = availability.filter((r) => r.dayOfWeek === dayOfWeek);

    for (const rule of dayRules) {
      let slotStart = parseTimeOnDate(current, rule.startTime, timezone);
      const ruleEnd = parseTimeOnDate(current, rule.endTime, timezone);

      while (addMinutes(slotStart, slotDurationMinutes) <= ruleEnd) {
        const slotEnd = addMinutes(slotStart, slotDurationMinutes);

        const isOccupied = activeEvents.some((event) =>
          overlaps(slotStart, slotEnd, event.startTime, event.endTime)
        );

        const isInRange =
          !isBefore(slotEnd, from) && !isAfter(slotStart, to);

        if (!isOccupied && isInRange && isAfter(slotStart, new Date())) {
          slots.push({ start: slotStart, end: slotEnd });
        }

        slotStart = slotEnd;
      }
    }

    current = addDays(current, 1);
    if (isAfter(startOfDay(current), endOfDay(to))) break;
  }

  return slots;
}

export function parseDateParam(value: string): Date {
  return parseISO(value);
}
