# ADR-0002: Confirm bookings and reconcile VietQR payments manually

## Status

Accepted

## Date

2026-10-18

## Context

TasteTrip needs to turn itineraries into direct self-guided orders. The project has no payment gateway account or bank transaction webhook, so the website cannot safely confirm receipt of a transfer automatically.

## Decision

- Customers select a self-guided itinerary, enter the date, guest count, name, and phone once, and create the order directly from checkout.
- The initial payable amount is the itinerary's estimated food cost per guest multiplied by the guest count. The checkout labels this as an estimate and excludes transport and guide services.
- The server saves the order with its amount and returns the booking ID and payment details in the same response. Checkout displays the QR immediately without a separate lookup step.
- A customer can still look up an existing order using its booking ID and original phone number. The server rate-limits these lookups.
- The current account QR is a static image, so the customer enters the amount and the booking-specific transfer reference displayed beside it.
- A customer report sets payment status to `awaiting_payment`. Only an administrator who has checked the bank transaction can set it to `paid`.
- Store QR configuration in `server/.env`; never commit account configuration. Replace the QR asset in `public/payment-qr.jpg` when the receiving account changes.

## Consequences

- The site can collect and manage real booking requests without claiming an order is paid before a person reconciles the transfer.
- Static QR payments require manual bank reconciliation and the payer must use the displayed amount and transfer reference.
- Automated payment confirmation requires a payment provider or bank integration with authenticated transaction callbacks, which remains future work.
