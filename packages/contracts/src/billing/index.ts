import { z } from "zod";

/** Legacy plan codes kept for DB rows; new subscriptions use FEATURES. */
export const BILLING_PLAN_CODES = ["FEATURES", "STARTER", "GROWTH", "TRIAL"] as const;
export type BillingPlanCode = (typeof BILLING_PLAN_CODES)[number];

export const BILLING_CYCLES = [
  "MONTHLY",
  "QUARTERLY",
  "HALF_YEARLY",
  "YEARLY",
] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

// ─────────────────────────────────────────────────────────────────────────────
// POST /v1/billing/subscribe — pay for super-admin enabled feature entitlements

export const CreateSubscriptionSchema = z.object({
  billingCycle: z.enum(BILLING_CYCLES),
});
export type CreateSubscriptionDto = z.infer<typeof CreateSubscriptionSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// POST /v1/billing/verify-payment

export const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
export type VerifyPaymentDto = z.infer<typeof VerifyPaymentSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// GET /v1/billing/quote

export const BillingQuoteQuerySchema = z.object({
  billingCycle: z.enum(BILLING_CYCLES),
});
export type BillingQuoteQueryDto = z.infer<typeof BillingQuoteQuerySchema>;

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /v1/platform/tenants/:tenantId/feature-entitlements

export const PatchFeatureEntitlementsSchema = z.object({
  featureFlags: z.record(z.string(), z.boolean()),
});
export type PatchFeatureEntitlementsDto = z.infer<
  typeof PatchFeatureEntitlementsSchema
>;
