"use client";

import { useMemo, useState } from "react";
import { addMonths, endOfMonth, startOfMonth, subMonths } from "date-fns";
import { SchedulerCalendar } from "@/components/calendar/scheduler-calendar";
import { EventDialog } from "@/components/events/event-dialog";
import { CalendarEvent } from "@/lib/calendar-localizer";
import { useEvents } from "@/hooks/use-scheduler";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function DashboardCalendar() {
  const [currentDate] = useState(new Date());
  const range = useMemo(
    () => ({
      from: startOfMonth(subMonths(currentDate, 1)).toISOString(),
      to: endOfMonth(addMonths(currentDate, 1)).toISOString(),
    }),
    [currentDate]
  );

  const { data: events = [], isLoading } = useEvents(range.from, range.to);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">(
    "view"
  );

  const calendarEvents: CalendarEvent[] = useMemo(
    () =>
      events.map((e) => ({
        id: e.id,
        title: e.title,
        start: new Date(e.startTime),
        end: new Date(e.endTime),
        status: e.status,
        resource: {
          description: e.description,
          guestName: e.guestName,
          guestEmail: e.guestEmail,
          guestPhone: e.guestPhone,
          recurrence: e.recurrence,
          notes: e.notes.map((n) => ({
            ...n,
            createdAt: n.createdAt,
          })),
          payment: e.payment,
        },
      })),
    [events]
  );

  const openCreate = (slot?: { start: Date; end: Date }) => {
    setSelectedEvent(null);
    setSelectedSlot(
      slot ?? {
        start: new Date(),
        end: new Date(Date.now() + 30 * 60 * 1000),
      }
    );
    setDialogMode("create");
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mi calendario</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus eventos y reservas
          </p>
        </div>
        <Button onClick={() => openCreate()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo evento
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-96 items-center justify-center text-muted-foreground">
          Cargando eventos...
        </div>
      ) : (
        <SchedulerCalendar
          events={calendarEvents}
          onSelectEvent={(event) => {
            setSelectedEvent(event);
            setSelectedSlot(null);
            setDialogMode("view");
            setDialogOpen(true);
          }}
          onSelectSlot={(slot) => openCreate(slot)}
        />
      )}

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={selectedEvent}
        slot={selectedSlot}
        mode={dialogMode}
      />
    </div>
  );
}
