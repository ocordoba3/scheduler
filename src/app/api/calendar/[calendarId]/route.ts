import { notFound } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { generateAvailableSlots } from "@/lib/slots";
import { addDays } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ calendarId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { calendarId } = await context.params;
  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const slotsOnly = searchParams.get("slots") === "true";

  const calendar = await prisma.calendar.findUnique({
    where: { id: calendarId },
    include: {
      user: { select: { name: true, timezone: true } },
      availability: true,
    },
  });

  if (!calendar) return notFound("Calendario no encontrado");

  const timezone = calendar.user.timezone;
  const from = fromParam ? new Date(fromParam) : new Date();
  const to = toParam ? new Date(toParam) : addDays(from, 30);

  const events = await prisma.event.findMany({
    where: {
      calendarId,
      startTime: { gte: from },
      endTime: { lte: addDays(to, 1) },
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      status: true,
    },
  });

  const slots = generateAvailableSlots(
    from,
    to,
    calendar.availability,
    events,
    calendar.slotDuration,
    timezone
  );

  if (slotsOnly) {
    return NextResponse.json({
      slots: slots.map((s) => ({
        start: s.start.toISOString(),
        end: s.end.toISOString(),
      })),
    });
  }

  return NextResponse.json({
    id: calendar.id,
    title: calendar.title,
    description: calendar.description,
    slotDuration: calendar.slotDuration,
    paymentsEnabled: calendar.paymentsEnabled,
    timezone,
    ownerName: calendar.user.name,
    availability: calendar.availability,
    events,
    slots: slots.map((s) => ({
      start: s.start.toISOString(),
      end: s.end.toISOString(),
    })),
  });
}
