"use client";

import { useEffect, useState } from "react";
import { DAY_LABELS } from "@/lib/constants";
import { useAvailability, useUpdateAvailability } from "@/hooks/use-scheduler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface RuleForm {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export function AvailabilityManager() {
  const { data: rules = [], isLoading } = useAvailability();
  const updateAvailability = useUpdateAvailability();
  const [localRules, setLocalRules] = useState<RuleForm[]>([]);

  useEffect(() => {
    if (!isLoading) {
      setLocalRules(
        rules.map((r) => ({
          dayOfWeek: r.dayOfWeek,
          startTime: r.startTime,
          endTime: r.endTime,
        }))
      );
    }
  }, [rules, isLoading]);

  const addRule = () => {
    setLocalRules([
      ...localRules,
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
    ]);
  };

  const removeRule = (index: number) => {
    setLocalRules(localRules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: keyof RuleForm, value: string | number) => {
    const updated = [...localRules];
    updated[index] = { ...updated[index], [field]: value };
    setLocalRules(updated);
  };

  const handleSave = async () => {
    try {
      await updateAvailability.mutateAsync(localRules);
      toast.success("Disponibilidad actualizada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Disponibilidad</h1>
        <p className="text-sm text-muted-foreground">
          Define los rangos horarios en los que los visitantes pueden agendar
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Horarios semanales</CardTitle>
          <Button variant="outline" size="sm" onClick={addRule}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar rango
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          )}

          {!isLoading && localRules.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay horarios configurados. Agrega al menos un rango.
            </p>
          )}

          {localRules.map((rule, index) => (
            <div
              key={index}
              className="grid grid-cols-1 items-end gap-3 rounded-lg border p-4 sm:grid-cols-4"
            >
              <div className="space-y-2">
                <Label>Día</Label>
                <select
                  className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={rule.dayOfWeek}
                  onChange={(e) =>
                    updateRule(index, "dayOfWeek", Number(e.target.value))
                  }
                >
                  {DAY_LABELS.map((day, i) => (
                    <option key={i} value={i}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Inicio</Label>
                <Input
                  type="time"
                  value={rule.startTime}
                  onChange={(e) =>
                    updateRule(index, "startTime", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Fin</Label>
                <Input
                  type="time"
                  value={rule.endTime}
                  onChange={(e) =>
                    updateRule(index, "endTime", e.target.value)
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => removeRule(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button onClick={handleSave} disabled={updateAvailability.isPending}>
            Guardar disponibilidad
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
