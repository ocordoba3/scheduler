import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function getAuthenticatedCalendar() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const calendar = await prisma.calendar.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { timezone: true, name: true, email: true } },
    },
  });

  return calendar;
}

export function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export function notFound(message = "No encontrado") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
