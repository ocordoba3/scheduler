"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Event, EventNote, AvailabilityRule } from "@/types/scheduler";

export interface CalendarSettings {
  id: string;
  title: string;
  description: string | null;
  slotDuration: number;
  paymentsEnabled: boolean;
  timezone: string;
  ownerName: string | null;
  bookingUrl: string;
}

export interface EventWithRelations extends Event {
  notes: EventNote[];
  payment: {
    id: string;
    status: string;
    type: string;
    amount: string | null;
  } | null;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Error en la solicitud");
  return data;
}

export function useCalendarSettings() {
  return useQuery({
    queryKey: ["calendar-settings"],
    queryFn: () => fetchJson<CalendarSettings>("/api/calendar"),
  });
}

export function useEvents(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  return useQuery({
    queryKey: ["events", from, to],
    queryFn: () =>
      fetchJson<EventWithRelations[]>(`/api/events?${params.toString()}`),
  });
}

export function useAvailability() {
  return useQuery({
    queryKey: ["availability"],
    queryFn: () => fetchJson<AvailabilityRule[]>("/api/availability"),
  });
}

export function usePublicCalendar(
  calendarId: string,
  from?: string,
  to?: string
) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  return useQuery({
    queryKey: ["public-calendar", calendarId, from, to],
    queryFn: () =>
      fetchJson<{
        id: string;
        title: string;
        description: string | null;
        slotDuration: number;
        paymentsEnabled: boolean;
        timezone: string;
        ownerName: string | null;
        slots: { start: string; end: string }[];
      }>(`/api/calendar/${calendarId}?${params.toString()}`),
    enabled: !!calendarId,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson<EventWithRelations>("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Record<string, unknown>;
    }) =>
      fetchJson<EventWithRelations>(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/events/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useCreateNote(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      content: string;
      authorType: "OWNER" | "GUEST";
      authorName?: string;
    }) =>
      fetchJson(`/api/events/${eventId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      rules: { dayOfWeek: number; startTime: string; endTime: string }[]
    ) =>
      fetchJson<AvailabilityRule[]>("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
}

export function useUpdateCalendarSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson<CalendarSettings>("/api/calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-settings"] });
    },
  });
}

export function useCreateBooking() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}
