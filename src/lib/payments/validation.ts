import { z } from "zod";

export const paymentTypeSchema = z.enum(["DEPOSIT", "FULL"]);

export function validatePaymentRequest(
  paymentsEnabled: boolean,
  paymentType?: string | null
): string | null {
  if (paymentType && !paymentsEnabled) {
    return "Los pagos en línea no están habilitados para este calendario";
  }

  if (paymentType) {
    const parsed = paymentTypeSchema.safeParse(paymentType);
    if (!parsed.success) {
      return "Tipo de pago inválido";
    }
  }

  return null;
}
