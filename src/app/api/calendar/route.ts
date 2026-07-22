import {
  badRequest,
  getAuthenticatedCalendar,
  unauthorized,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { calendarSettingsSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

function serializeCalendar(
  calendar: {
    id: string;
    title: string;
    description: string | null;
    slotDuration: number;
    paymentsEnabled: boolean;
    user: { timezone: string; name: string | null };
  }
) {
  return {
    id: calendar.id,
    title: calendar.title,
    description: calendar.description,
    slotDuration: calendar.slotDuration,
    paymentsEnabled: calendar.paymentsEnabled,
    timezone: calendar.user.timezone,
    ownerName: calendar.user.name,
    bookingUrl: `/book/${calendar.id}`,
  };
}

export async function GET() {
  const calendar = await getAuthenticatedCalendar();
  if (!calendar) return unauthorized();

  return NextResponse.json(serializeCalendar(calendar));
}

export async function PATCH(request: NextRequest) {
  const calendar = await getAuthenticatedCalendar();
  if (!calendar) return unauthorized();

  try {
    const body = await request.json();
    const parsed = calendarSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Datos inválidos");
    }

    const { timezone, ...calendarData } = parsed.data;

    if (timezone) {
      await prisma.user.update({
        where: { id: calendar.userId },
        data: { timezone },
      });
    }

    const updated = await prisma.calendar.update({
      where: { id: calendar.id },
      data: calendarData,
      include: {
        user: { select: { timezone: true, name: true, email: true } },
      },
    });

    return NextResponse.json(serializeCalendar(updated));
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}
