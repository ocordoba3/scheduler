"use client";

import { Calendar, View, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMemo, useState } from "react";
import { addMonths, endOfMonth, startOfMonth, subMonths } from "date-fns";
import { calendarLocalizer, CalendarEvent } from "@/lib/calendar-localizer";
import { EVENT_STATUS_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SchedulerCalendarProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  selectable?: boolean;
}

export function SchedulerCalendar({
  events,
  onSelectEvent,
  onSelectSlot,
  selectable = true,
}: SchedulerCalendarProps) {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const eventStyleGetter = useMemo(
    () => (event: CalendarEvent) => ({
      style: {
        backgroundColor:
          EVENT_STATUS_COLORS[
            event.status as keyof typeof EVENT_STATUS_COLORS
          ] ?? "#3b82f6",
        borderRadius: "6px",
        border: "none",
        color: "white",
        fontSize: "12px",
      },
    }),
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDate(subMonths(date, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setDate(new Date())}>
            Hoy
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDate(addMonths(date, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          {(["month", "week", "day"] as const).map((v) => (
            <Button
              key={v}
              variant={view === v ? "default" : "outline"}
              size="sm"
              onClick={() => setView(v)}
            >
              {v === "month" ? "Mes" : v === "week" ? "Semana" : "Día"}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-[650px] rounded-lg border bg-card p-2">
        <Calendar
          localizer={calendarLocalizer}
          events={events}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          selectable={selectable}
          eventPropGetter={eventStyleGetter}
          popup
          culture="es"
          messages={{
            today: "Hoy",
            previous: "Anterior",
            next: "Siguiente",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "No hay eventos en este rango",
          }}
        />
      </div>
    </div>
  );
}

export function getCalendarRange(date: Date) {
  return {
    from: startOfMonth(subMonths(date, 1)).toISOString(),
    to: endOfMonth(addMonths(date, 1)).toISOString(),
  };
}
