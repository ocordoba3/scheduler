import { badRequest, notFound } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { createPayment } from "@/lib/payments";
import { validatePaymentRequest } from "@/lib/payments/validation";
import { bookingSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Datos inválidos");
    }

    const data = parsed.data;

    const calendar = await prisma.calendar.findUnique({
      where: { id: data.calendarId },
    });

    if (!calendar) return notFound("Calendario no encontrado");

    const paymentError = validatePaymentRequest(
      calendar.paymentsEnabled,
      data.paymentType
    );
    if (paymentError) return badRequest(paymentError);

    const shouldCreatePayment =
      calendar.paymentsEnabled && Boolean(data.paymentType);

    const event = await prisma.event.create({
      data: {
        calendarId: data.calendarId,
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: "PENDING",
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        notes: data.note
          ? {
              create: {
                content: data.note,
                authorType: "GUEST",
                authorName: data.guestName,
              },
            }
          : undefined,
        payment: shouldCreatePayment
          ? {
              create: {
                status: "PENDING",
                type: data.paymentType!,
              },
            }
          : undefined,
      },
      include: { notes: true, payment: true },
    });

    const paymentPreview = shouldCreatePayment
      ? await createPayment({
          eventId: event.id,
          amount: 0,
          type: data.paymentType!,
        })
      : null;

    return NextResponse.json(
      {
        event,
        paymentsEnabled: calendar.paymentsEnabled,
        payment: event.payment
          ? {
              ...event.payment,
              message: paymentPreview?.message,
            }
          : null,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Error al crear la reserva" },
      { status: 500 }
    );
  }
}
