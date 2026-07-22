"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarEvent } from "@/lib/calendar-localizer";
import {
  EVENT_STATUS_LABELS,
  RECURRENCE_LABELS,
} from "@/lib/constants";
import {
  useCreateEvent,
  useDeleteEvent,
  useUpdateEvent,
  useCalendarSettings,
} from "@/hooks/use-scheduler";
import { EventNotesChat } from "./event-notes-chat";
import { toast } from "sonner";
import { format } from "date-fns";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  slot?: { start: Date; end: Date } | null;
  mode: "create" | "edit" | "view";
}

function toDatetimeLocal(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function EventDialog({
  open,
  onOpenChange,
  event,
  slot,
  mode: initialMode,
}: EventDialogProps) {
  const [mode, setMode] = useState(initialMode);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const { data: calendarSettings } = useCalendarSettings();

  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    status: "PENDING",
    recurrence: "NONE",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
  });

  useEffect(() => {
    setMode(initialMode);
    if (event) {
      setForm({
        title: event.title,
        description: event.resource?.description ?? "",
        startTime: toDatetimeLocal(event.start),
        endTime: toDatetimeLocal(event.end),
        status: event.status,
        recurrence: event.resource?.recurrence ?? "NONE",
        guestName: event.resource?.guestName ?? "",
        guestEmail: event.resource?.guestEmail ?? "",
        guestPhone: event.resource?.guestPhone ?? "",
      });
    } else if (slot) {
      setForm({
        title: "",
        description: "",
        startTime: toDatetimeLocal(slot.start),
        endTime: toDatetimeLocal(slot.end),
        status: "PENDING",
        recurrence: "NONE",
        guestName: "",
        guestEmail: "",
        guestPhone: "",
      });
    }
  }, [event, slot, initialMode, open]);

  const handleSave = async () => {
    const payload = {
      title: form.title,
      description: form.description || undefined,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      status: form.status,
      recurrence: form.recurrence,
      guestName: form.guestName || undefined,
      guestEmail: form.guestEmail || undefined,
      guestPhone: form.guestPhone || undefined,
    };

    try {
      if (mode === "create") {
        await createEvent.mutateAsync(payload);
        toast.success("Evento creado");
      } else if (event) {
        await updateEvent.mutateAsync({ id: event.id, data: payload });
        toast.success("Evento actualizado");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    try {
      await deleteEvent.mutateAsync(event.id);
      toast.success("Evento eliminado");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const isView = mode === "view";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "create"
              ? "Nuevo evento"
              : mode === "edit"
                ? "Editar evento"
                : "Detalle del evento"}
            {event && (
              <Badge variant="secondary">
                {EVENT_STATUS_LABELS[event.status as keyof typeof EVENT_STATUS_LABELS]}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={form.title}
              disabled={isView}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={form.description}
              disabled={isView}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start">Inicio</Label>
              <Input
                id="start"
                type="datetime-local"
                value={form.startTime}
                disabled={isView}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Fin</Label>
              <Input
                id="end"
                type="datetime-local"
                value={form.endTime}
                disabled={isView}
                onChange={(e) =>
                  setForm({ ...form, endTime: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={form.status}
                disabled={isView}
                onValueChange={(v) => v && setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recurrencia</Label>
              <Select
                value={form.recurrence}
                disabled={isView}
                onValueChange={(v) => v && setForm({ ...form, recurrence: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RECURRENCE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestName">Invitado</Label>
            <Input
              id="guestName"
              value={form.guestName}
              disabled={isView}
              onChange={(e) =>
                setForm({ ...form, guestName: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="guestEmail">Email invitado</Label>
              <Input
                id="guestEmail"
                type="email"
                value={form.guestEmail}
                disabled={isView}
                onChange={(e) =>
                  setForm({ ...form, guestEmail: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestPhone">Teléfono</Label>
              <Input
                id="guestPhone"
                value={form.guestPhone}
                disabled={isView}
                onChange={(e) =>
                  setForm({ ...form, guestPhone: e.target.value })
                }
              />
            </div>
          </div>

          {calendarSettings?.paymentsEnabled && event?.resource?.payment && (
            <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              Pago: {event.resource.payment.type} —{" "}
              {event.resource.payment.status} (integración pendiente)
            </div>
          )}

          {event && event.resource?.notes && (
            <EventNotesChat
              eventId={event.id}
              notes={event.resource.notes.map((n) => ({
                ...n,
                createdAt: new Date(n.createdAt),
              }))}
              authorType="OWNER"
            />
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {isView && (
            <>
              <Button variant="outline" onClick={() => setMode("edit")}>
                Editar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Eliminar
              </Button>
            </>
          )}
          {!isView && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={createEvent.isPending || updateEvent.isPending}
              >
                Guardar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
