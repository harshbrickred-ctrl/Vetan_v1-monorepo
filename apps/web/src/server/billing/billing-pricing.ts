import type { Billing, FeatureFlagsMap } from "@sangam/contracts";
import {
  BILLING_CYCLE_LABELS,
  calculateFeatureSubscriptionPrice,
  cycleMonths,
  listFeaturePricingCatalog,
  monthlyFeeFromFeatureFlags,
  periodEndFromCycle,
} from "./feature-billing";

export {
  BILLING_CYCLE_LABELS,
  cycleMonths,
  periodEndFromCycle,
  monthlyFeeFromFeatureFlags,
  listFeaturePricingCatalog,
  calculateFeatureSubscriptionPrice,
};

/** @deprecated Plan-based pricing removed — use feature entitlements instead. */
export function calculateSubscriptionPrice(
  _planCode: Billing.BillingPlanCode,
  cycle: Billing.BillingCycle,
  flags: FeatureFlagsMap = {},
) {
  return calculateFeatureSubscriptionPrice(flags, cycle);
}

/** @deprecated Use listFeaturePricingCatalog */
export function listPricingCatalog() {
  return listFeaturePricingCatalog();
}
