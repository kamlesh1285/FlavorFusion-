/**
 * Builds a standard UPI payment deep link (the `upi://pay?...` scheme
 * that GPay, PhonePe, Paytm, and every other UPI app understand).
 *
 * There is no gateway involved — this just formats a payment *request*
 * that the customer's UPI app opens directly. Because there's no
 * gateway, there's no automatic webhook confirming payment; the
 * merchant (admin) has to check their UPI app and mark the order paid
 * manually. See PaymentsService for how that's handled.
 */
export function buildUpiLink(params: {
  payeeVpa: string;
  payeeName: string;
  amount: number;
  transactionRef: string;
  note: string;
}): string {
  const query = new URLSearchParams({
    pa: params.payeeVpa,
    pn: params.payeeName,
    am: params.amount.toFixed(2),
    cu: 'INR',
    tr: params.transactionRef,
    tn: params.note,
  });

  return `upi://pay?${query.toString()}`;
}
