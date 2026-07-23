import {
  badRequest,
  getAuthenticatedCalendar,
  unauthorized,
} from "@/lib/api-helpers";
import { createPayment } from "@/lib/payments";
import { NextResponse } from "next/server";

export async function GET() {
  const calendar = await getAuthenticatedCalendar();
  if (!calendar) return unauthorized();

  if (!calendar.paymentsEnabled) {
    return NextResponse.json({
      enabled: false,
      paymentsEnabled: false,
      message: "Los pagos en línea están deshabilitados en la configuración.",
    });
  }

  return NextResponse.json({
    enabled: true,
    paymentsEnabled: true,
    status: "not_configured",
    message:
      "Módulo de pagos listo para integrar. Soportará depósito o pago total.",
    supportedTypes: ["DEPOSIT", "FULL"],
    plannedProviders: ["stripe", "paypal", "mercadopago"],
    preview: await createPayment({
      eventId: "preview",
      amount: 100,
      type: "DEPOSIT",
    }),
  });
}

export async function POST() {
  const calendar = await getAuthenticatedCalendar();
  if (!calendar) return unauthorized();

  if (!calendar.paymentsEnabled) {
    return badRequest("Los pagos en línea no están habilitados");
  }

  return NextResponse.json({
    message: "Integración de pagos pendiente",
  });
}
