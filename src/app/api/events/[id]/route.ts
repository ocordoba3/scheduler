import {
  badRequest,
  getAuthenticatedCalendar,
  notFound,
  unauthorized,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const calendar = await getAuthenticatedCalendar();
  if (!calendar) return unauthorized();

  const { id } = await context.params;

  const event = await prisma.event.findFirst({
    where: { id, calendarId: calendar.id },
    include: {
      notes: { orderBy: { createdAt: "asc" } },
      payment: true,
    },
  });

  if (!event) return notFound("Evento no encontrado");

  return NextResponse.json(event);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const calendar = await getAuthenticatedCalendar();
  if (!calendar) return unauthorized();

  const { id } = await context.params;

  const existing = await prisma.event.findFirst({
    where: { id, calendarId: calendar.id },
  });

  if (!existing) return notFound("Evento no encontrado");

  try {
    const body = await request.json();
    const parsed = eventSchema.partial().safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Datos inválidos");
    }

    const data = parsed.data;

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.startTime !== undefined && {
          startTime: new Date(data.startTime),
        }),
        ...(data.endTime !== undefined && { endTime: new Date(data.endTime) }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.recurrence !== undefined && { recurrence: data.recurrence }),
        ...(data.recurrenceEnd !== undefined && {
          recurrenceEnd: data.recurrenceEnd
            ? new Date(data.recurrenceEnd)
            : null,
        }),
        ...(data.guestName !== undefined && { guestName: data.guestName }),
        ...(data.guestEmail !== undefined && {
          guestEmail: data.guestEmail || null,
        }),
        ...(data.guestPhone !== undefined && { guestPhone: data.guestPhone }),
      },
      include: {
        notes: { orderBy: { createdAt: "asc" } },
        payment: true,
      },
    });

    return NextResponse.json(event);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar el evento" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const calendar = await getAuthenticatedCalendar();
  if (!calendar) return unauthorized();

  const { id } = await context.params;

  const existing = await prisma.event.findFirst({
    where: { id, calendarId: calendar.id },
  });

  if (!existing) return notFound("Evento no encontrado");

  await prisma.event.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
