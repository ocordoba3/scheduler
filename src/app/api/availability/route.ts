import {
  badRequest,
  getAuthenticatedCalendar,
  unauthorized,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { availabilityRuleSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const calendar = await getAuthenticatedCalendar();
  if (!calendar) return unauthorized();

  const rules = await prisma.availabilityRule.findMany({
    where: { calendarId: calendar.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json(rules);
}

export async function POST(request: NextRequest) {
  const calendar = await getAuthenticatedCalendar();
  if (!calendar) return unauthorized();

  try {
    const body = await request.json();
    const parsed = availabilityRuleSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Datos inválidos");
    }

    if (parsed.data.startTime >= parsed.data.endTime) {
      return badRequest("La hora de inicio debe ser anterior a la de fin");
    }

    const rule = await prisma.availabilityRule.create({
      data: {
        calendarId: calendar.id,
        ...parsed.data,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear la regla" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const calendar = await getAuthenticatedCalendar();
  if (!calendar) return unauthorized();

  try {
    const body = await request.json();
    const rules = Array.isArray(body) ? body : body.rules;

    if (!Array.isArray(rules)) {
      return badRequest("Se esperaba un arreglo de reglas");
    }

    for (const rule of rules) {
      const parsed = availabilityRuleSchema.safeParse(rule);
      if (!parsed.success) {
        return badRequest(parsed.error.issues[0]?.message ?? "Datos inválidos");
      }
      if (parsed.data.startTime >= parsed.data.endTime) {
        return badRequest("La hora de inicio debe ser anterior a la de fin");
      }
    }

    await prisma.$transaction([
      prisma.availabilityRule.deleteMany({
        where: { calendarId: calendar.id },
      }),
      prisma.availabilityRule.createMany({
        data: rules.map(
          (rule: {
            dayOfWeek: number;
            startTime: string;
            endTime: string;
          }) => ({
            calendarId: calendar.id,
            dayOfWeek: rule.dayOfWeek,
            startTime: rule.startTime,
            endTime: rule.endTime,
          })
        ),
      }),
    ]);

    const updated = await prisma.availabilityRule.findMany({
      where: { calendarId: calendar.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar disponibilidad" },
      { status: 500 }
    );
  }
}
