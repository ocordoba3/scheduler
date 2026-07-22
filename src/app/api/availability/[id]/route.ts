import {
  badRequest,
  getAuthenticatedCalendar,
  notFound,
  unauthorized,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const calendar = await getAuthenticatedCalendar();
  if (!calendar) return unauthorized();

  const { id } = await context.params;

  const rule = await prisma.availabilityRule.findFirst({
    where: { id, calendarId: calendar.id },
  });

  if (!rule) return notFound("Regla no encontrada");

  await prisma.availabilityRule.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
