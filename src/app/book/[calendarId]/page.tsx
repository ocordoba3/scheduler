"use client";

import { use, useState } from "react";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { usePublicCalendar, useCreateBooking } from "@/hooks/use-scheduler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, CheckCircle2 } from "lucide-react";

export default function BookPage({
  params,
}: {
  params: Promise<{ calendarId: string }>;
}) {
  const { calendarId } = use(params);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedSlot, setSelectedSlot] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    title: "Reserva",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    note: "",
  });

  const from = selectedDate?.toISOString();
  const to = selectedDate ? addDays(selectedDate, 14).toISOString() : undefined;

  const {
    data: calendar,
    isLoading,
    error,
  } = usePublicCalendar(calendarId, from, to);
  const createBooking = useCreateBooking();

  const slotsForDay =
    calendar?.slots.filter((slot) => {
      if (!selectedDate || !calendar.timezone) return false;
      const slotDate = formatInTimeZone(
        slot.start,
        calendar.timezone,
        "yyyy-MM-dd"
      );
      const selected = format(selectedDate, "yyyy-MM-dd");
      return slotDate === selected;
    }) ?? [];

  const handleBook = async () => {
    if (!selectedSlot) {
      toast.error("Selecciona un horario");
      return;
    }

    try {
      await createBooking.mutateAsync({
        calendarId,
        title: form.title,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        guestPhone: form.guestPhone || undefined,
        note: form.note || undefined,
      });
      setSubmitted(true);
      toast.success("¡Reserva creada!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al reservar");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Cargando calendario...</p>
      </div>
    );
  }

  if (error || !calendar) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Calendario no encontrado</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold">¡Reserva confirmada!</h1>
        <p className="text-muted-foreground">
          Tu solicitud fue enviada a{" "}
          {calendar.ownerName ?? "el dueño del calendario"}. Recibirás
          confirmación pronto.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{calendar.title}</h1>
        {calendar.description && (
          <p className="mt-2 text-muted-foreground">{calendar.description}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          con {calendar.ownerName ?? "el anfitrión"} · {calendar.timezone}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Selecciona fecha</CardTitle>
            <CardDescription>
              Slots de {calendar.slotDuration} minutos
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Horarios disponibles
              {selectedDate &&
                ` — ${format(selectedDate, "d MMMM", { locale: es })}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slotsForDay.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay horarios disponibles este día
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slotsForDay.map((slot) => {
                  const label = formatInTimeZone(
                    slot.start,
                    calendar.timezone,
                    "HH:mm"
                  );
                  const isSelected = selectedSlot?.start === slot.start;
                  return (
                    <Button
                      key={slot.start}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle>Tus datos</CardTitle>
            <CardDescription>
              Horario:{" "}
              {formatInTimeZone(
                selectedSlot.start,
                calendar.timezone,
                "d MMM yyyy HH:mm",
                { locale: es }
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">Nombre *</Label>
              <Input
                id="guestName"
                value={form.guestName}
                onChange={(e) =>
                  setForm({ ...form, guestName: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="guestEmail">Email *</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={form.guestEmail}
                  onChange={(e) =>
                    setForm({ ...form, guestEmail: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestPhone">Teléfono</Label>
                <Input
                  id="guestPhone"
                  value={form.guestPhone}
                  onChange={(e) =>
                    setForm({ ...form, guestPhone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Nota inicial</Label>
              <Textarea
                id="note"
                placeholder="Cuéntanos el motivo de tu reserva..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            {calendar.paymentsEnabled && (
              <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4 shrink-0" />
                <span>
                  Pagos en línea habilitados — depósito o pago total al
                  confirmar
                </span>
                <Badge variant="secondary">Próximamente</Badge>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleBook}
              disabled={createBooking.isPending}
            >
              {createBooking.isPending ? "Reservando..." : "Confirmar reserva"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
