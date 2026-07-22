/**
 * Placeholder para integración de pagos en línea.
 * Soportará depósito o pago total vía proveedores como Stripe, PayPal, etc.
 */

export type PaymentProvider = "stripe" | "paypal" | "mercadopago";

export interface CreatePaymentInput {
  eventId: string;
  amount: number;
  currency?: string;
  type: "DEPOSIT" | "FULL";
  provider?: PaymentProvider;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  message: string;
}

export async function createPayment(
  _input: CreatePaymentInput
): Promise<PaymentResult> {
  return {
    success: false,
    message:
      "Pagos no configurados aún. Este módulo está listo para integrar Stripe u otro proveedor.",
  };
}

export async function confirmPayment(
  _paymentId: string,
  _externalId: string
): Promise<PaymentResult> {
  return {
    success: false,
    message: "Confirmación de pago no implementada.",
  };
}

export async function refundPayment(
  _paymentId: string
): Promise<PaymentResult> {
  return {
    success: false,
    message: "Reembolsos no implementados.",
  };
}
