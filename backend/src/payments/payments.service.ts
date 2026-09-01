import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod, PaymentStatus } from './payment.enums';
import { buildUpiLink } from './upi.util';

export interface ChargeRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
}

export interface ChargeResult {
  status: PaymentStatus;
  transactionRef: string;
  // Only set for UPI: a real upi://pay deep link / QR payload the
  // customer can pay with. Absent for other payment methods.
  upiLink?: string;
}

/**
 * PaymentsService handles two genuinely different kinds of "payment":
 *
 * - CASH_ON_DELIVERY: no payment happens now. Left PENDING; marked PAID
 *   by staff once cash is collected on delivery.
 *
 * - UPI: this is REAL, not simulated. It builds a standard `upi://pay`
 *   deep link/QR payload using the merchant's own UPI ID (configured via
 *   UPI_ID / UPI_PAYEE_NAME env vars). The customer's UPI app opens it
 *   and pays directly into the merchant's account. There is no payment
 *   gateway involved, so there's no webhook telling us it succeeded —
 *   the order is left PENDING and an admin marks it PAID after checking
 *   their UPI app. See orders/orders.controller.ts's PATCH endpoint.
 *
 * - CARD: still a MOCK. Wiring up a real card processor (Stripe, etc.)
 *   needs an actual merchant account and API keys this project doesn't
 *   have. It's simulated as an instant success so the flow can be
 *   demoed end to end. To make it real, replace this branch with an
 *   actual gateway API call, keeping the same method signature.
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly configService: ConfigService) {}

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    const transactionRef = `TXN-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    if (request.method === PaymentMethod.CASH_ON_DELIVERY) {
      this.logger.log(
        `Order ${request.orderId}: COD selected, payment left PENDING`,
      );

      return {
        status: PaymentStatus.PENDING,
        transactionRef,
      };
    }

    if (request.method === PaymentMethod.UPI) {
      const payeeVpa = this.configService.get<string>('UPI_ID');
      const payeeName = this.configService.get<string>(
        'UPI_PAYEE_NAME',
        'FlavorFusion',
      );

      if (!payeeVpa) {
        this.logger.warn(
          'UPI_ID is not configured — generating a placeholder link. ' +
            'Set UPI_ID in .env to your real UPI ID before accepting real payments.',
        );
      }

      const upiLink = buildUpiLink({
        payeeVpa: payeeVpa || 'set-upi-id-in-env@upi',
        payeeName,
        amount: request.amount,
        transactionRef,
        note: `FlavorFusion order ${request.orderId.slice(0, 8)}`,
      });

      this.logger.log(
        `Order ${request.orderId}: UPI link generated, payment left PENDING for manual confirmation`,
      );

      return {
        status: PaymentStatus.PENDING,
        transactionRef,
        upiLink,
      };
    }

    // CARD — simulated, see class doc comment above.
    this.logger.log(
      `Order ${request.orderId}: mock-charged ${request.amount} via ${request.method} (ref ${transactionRef})`,
    );

    return {
      status: PaymentStatus.PAID,
      transactionRef,
    };
  }

  async refund(orderId: string): Promise<ChargeResult> {
    const transactionRef = `REFUND-${Date.now()}`;

    this.logger.log(`Order ${orderId}: refund recorded (ref ${transactionRef})`);

    return {
      status: PaymentStatus.REFUNDED,
      transactionRef,
    };
  }
}
