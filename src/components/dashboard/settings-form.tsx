"use client";

import { useEffect, useState } from "react";
import {
  useCalendarSettings,
  useUpdateCalendarSettings,
} from "@/hooks/use-scheduler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SLOT_DURATIONS, TIMEZONES } from "@/lib/constants";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";

export function SettingsForm() {
  const { data: settings, isLoading } = useCalendarSettings();
  const updateSettings = useUpdateCalendarSettings();

  const [form, setForm] = useState({
    title: "",
    description: "",
    slotDuration: 30,
    timezone: "America/Bogota",
    paymentsEnabled: false,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        title: settings.title,
        description: settings.description ?? "",
        slotDuration: settings.slotDuration,
        timezone: settings.timezone,
        paymentsEnabled: settings.paymentsEnabled,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(form);
      toast.success("Configuración guardada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Cargando...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Personaliza tu calendario y preferencias
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Duración de slots</Label>
              <Select
                value={String(form.slotDuration)}
                onValueChange={(v) =>
                  v && setForm({ ...form, slotDuration: Number(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLOT_DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} minutos
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Zona horaria</Label>
              <Select
                value={form.timezone}
                onValueChange={(v) => v && setForm({ ...form, timezone: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {settings && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-medium">ID del calendario</p>
              <p className="font-mono text-muted-foreground">{settings.id}</p>
              <p className="mt-2 font-medium">URL pública de reserva</p>
              <p className="font-mono text-muted-foreground">
                {typeof window !== "undefined"
                  ? `${window.location.origin}${settings.bookingUrl}`
                  : settings.bookingUrl}
              </p>
            </div>
          )}

          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            Guardar cambios
          </Button>
        </CardContent>
      </Card>

      <Card className={form.paymentsEnabled ? "" : "border-dashed"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pagos en línea
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-md border p-4">
            <div className="space-y-1">
              <Label htmlFor="payments-enabled">Permitir pagos en línea</Label>
              <p className="text-sm text-muted-foreground">
                Muestra la opción de pago al agendar y habilita el módulo de
                cobros.
              </p>
            </div>
            <Switch
              id="payments-enabled"
              checked={form.paymentsEnabled}
              onCheckedChange={(checked) =>
                setForm({ ...form, paymentsEnabled: checked })
              }
            />
          </div>

          {form.paymentsEnabled ? (
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge>Activo</Badge>
                <span>Depósito o pago total al reservar</span>
              </div>
              <p>
                Integración pendiente con Stripe, PayPal o Mercado Pago. Los
                visitantes verán la sección de pago en el formulario de reserva.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Los pagos están deshabilitados. Los visitantes podrán reservar sin
              ver opciones de cobro.
            </p>
          )}

          <Button
            variant="outline"
            onClick={handleSave}
            disabled={updateSettings.isPending}
          >
            Guardar preferencia de pagos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
