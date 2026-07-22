import {
  badRequest,
  getAuthenticatedCalendar,
  notFound,
  unauthorized,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { noteSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id: eventId } = await context.params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, calendarId: true },
  });

  if (!event) return notFound("Evento no encontrado");

  const notes = await prisma.eventNote.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(notes);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: eventId } = await context.params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { calendar: true },
  });

  if (!event) return notFound("Evento no encontrado");

  try {
    const body = await request.json();
    const parsed = noteSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Datos inválidos");
    }

    const calendar = await getAuthenticatedCalendar();
    const isOwner = calendar?.id === event.calendarId;

    if (parsed.data.authorType === "OWNER" && !isOwner) {
      return unauthorized();
    }

    if (parsed.data.authorType === "GUEST" && isOwner) {
      // Owner can also post as guest context is fine
    }

    const note = await prisma.eventNote.create({
      data: {
        eventId,
        content: parsed.data.content,
        authorType: parsed.data.authorType,
        authorName: parsed.data.authorName,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear la nota" },
      { status: 500 }
    );
  }
}
