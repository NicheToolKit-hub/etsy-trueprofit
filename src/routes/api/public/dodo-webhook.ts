import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

// Standard Webhooks spec (used by Dodo Payments):
// https://docs.dodopayments.com/developer-resources/webhooks
// Signed payload = `${webhook-id}.${webhook-timestamp}.${rawBody}`
// HMAC-SHA256 with the secret (base64-decoded when prefixed with `whsec_`).
// `webhook-signature` header is space-separated list of `v1,<base64sig>` entries.

const TOLERANCE_SECONDS = 5 * 60;

function decodeSecret(secret: string): Buffer {
  const raw = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  try {
    return Buffer.from(raw, "base64");
  } catch {
    return Buffer.from(raw, "utf8");
  }
}

function verifySignature(
  secret: string,
  id: string,
  timestamp: string,
  body: string,
  signatureHeader: string,
): boolean {
  const key = decodeSecret(secret);
  const signedPayload = `${id}.${timestamp}.${body}`;
  const expected = createHmac("sha256", key).update(signedPayload).digest("base64");
  const expectedBuf = Buffer.from(expected, "utf8");

  for (const part of signatureHeader.split(" ")) {
    const [version, value] = part.split(",");
    if (version !== "v1" || !value) continue;
    const provided = Buffer.from(value, "utf8");
    if (provided.length !== expectedBuf.length) continue;
    if (timingSafeEqual(provided, expectedBuf)) return true;
  }
  return false;
}

type DodoEvent = {
  type?: string;
  business_id?: string;
  timestamp?: string;
  data?: Record<string, unknown>;
};

async function handlePaymentSucceeded(event: DodoEvent) {
  const data = event.data ?? {};
  console.log("[dodo] payment.succeeded", {
    payment_id: data.payment_id,
    subscription_id: data.subscription_id,
    customer: (data.customer as { email?: string } | undefined)?.email,
    total_amount: data.total_amount,
    currency: data.currency,
  });
  // TODO: mark order/subscription active in your DB, grant entitlement, send receipt.
}

async function handlePaymentFailed(event: DodoEvent) {
  const data = event.data ?? {};
  console.warn("[dodo] payment.failed", {
    payment_id: data.payment_id,
    subscription_id: data.subscription_id,
    error_code: data.error_code,
    error_message: data.error_message,
  });
  // TODO: notify the customer, flag subscription past_due, trigger retry email.
}

async function handleSubscriptionChange(event: DodoEvent) {
  const data = event.data ?? {};
  console.log(`[dodo] ${event.type}`, {
    subscription_id: data.subscription_id,
    status: data.status,
    next_billing_date: data.next_billing_date,
  });
  // TODO: sync subscription status (active / on_hold / cancelled / expired).
}

export const Route = createFileRoute("/api/public/dodo-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.DODO_WEBHOOK_SECRET;
        if (!secret) {
          console.error("[dodo] DODO_WEBHOOK_SECRET not configured");
          return new Response("Server misconfigured", { status: 500 });
        }

        const id = request.headers.get("webhook-id");
        const timestamp = request.headers.get("webhook-timestamp");
        const signature = request.headers.get("webhook-signature");
        if (!id || !timestamp || !signature) {
          return new Response("Missing webhook headers", { status: 400 });
        }

        const ts = Number(timestamp);
        if (!Number.isFinite(ts)) {
          return new Response("Invalid timestamp", { status: 400 });
        }
        const nowSec = Math.floor(Date.now() / 1000);
        if (Math.abs(nowSec - ts) > TOLERANCE_SECONDS) {
          return new Response("Timestamp outside tolerance", { status: 400 });
        }

        const rawBody = await request.text();
        if (!verifySignature(secret, id, timestamp, rawBody, signature)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: DodoEvent;
        try {
          event = JSON.parse(rawBody) as DodoEvent;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        try {
          switch (event.type) {
            case "payment.succeeded":
              await handlePaymentSucceeded(event);
              break;
            case "payment.failed":
            case "payment.cancelled":
              await handlePaymentFailed(event);
              break;
            case "subscription.active":
            case "subscription.on_hold":
            case "subscription.renewed":
            case "subscription.cancelled":
            case "subscription.expired":
            case "subscription.plan_changed":
              await handleSubscriptionChange(event);
              break;
            default:
              console.log("[dodo] unhandled event", event.type);
          }
        } catch (err) {
          console.error("[dodo] handler error", err);
          // 5xx tells Dodo to retry with exponential backoff.
          return new Response("Handler error", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});