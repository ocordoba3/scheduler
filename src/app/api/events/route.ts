import {
  badRequest,
  getAuthenticatedCalendar,
  unauthorized,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const calendar = await getAuthenticatedCalendar();
  if (!calendar) return unauthorized();

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const events = await prisma.event.findMany({
    where: {
      calendarId: calendar.id,
      ...(from && to
        ? {
            startTime: { lte: new Date(to) },
            endTime: { gte: new Date(from) },
          }
        : {}),
    },
    include: {
      notes: { orderBy: { createdAt: "asc" } },
      payment: true,
    },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const calendar = await getAuthenticatedCalendar();
  if (!calendar) return unauthorized();

  try {
    const body = await request.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Datos inválidos");
    }

    const data = parsed.data;

    const event = await prisma.event.create({
      data: {
        calendarId: calendar.id,
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: data.status ?? "PENDING",
        recurrence: data.recurrence ?? "NONE",
        recurrenceEnd: data.recurrenceEnd
          ? new Date(data.recurrenceEnd)
          : null,
        guestName: data.guestName,
        guestEmail: data.guestEmail || null,
        guestPhone: data.guestPhone,
      },
      include: { notes: true, payment: true },
    });

    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear el evento" },
      { status: 500 }
    );
  }
}
