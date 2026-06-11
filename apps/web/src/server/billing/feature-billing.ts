import type { Billing } from "@sangam/contracts";
import {
  FEATURE_FLAG_KEYS,
  FEATURE_MONTHLY_PRICE_INR,
  listFeatureCatalog,
  type FeatureFlagKey,
  type FeatureFlagsMap,
} from "@sangam/contracts";

const CYCLE_MONTHS: Record<Billing.BillingCycle, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  HALF_YEARLY: 6,
  YEARLY: 12,
};

const CYCLE_DISCOUNT: Record<Billing.BillingCycle, number> = {
  MONTHLY: 0,
  QUARTERLY: 0.05,
  HALF_YEARLY: 0.1,
  YEARLY: 0.15,
};

export const BILLING_CYCLE_LABELS: Record<Billing.BillingCycle, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly (5% off)",
  HALF_YEARLY: "Half-yearly (10% off)",
  YEARLY: "Yearly (15% off)",
};

export function cycleMonths(cycle: Billing.BillingCycle): number {
  return CYCLE_MONTHS[cycle];
}

export function monthlyFeeFromFeatureFlags(flags: FeatureFlagsMap): number {
  let total = 0;
  for (const key of FEATURE_FLAG_KEYS) {
    if (flags[key] === true) {
      total += FEATURE_MONTHLY_PRICE_INR[key];
    }
  }
  return total;
}

export function calculateFeatureSubscriptionPrice(
  flags: FeatureFlagsMap,
  cycle: Billing.BillingCycle,
) {
  const monthlyBaseInr = monthlyFeeFromFeatureFlags(flags);
  const months = CYCLE_MONTHS[cycle];
  const discountPercent = Math.round(CYCLE_DISCOUNT[cycle] * 100);
  const subtotalInr = monthlyBaseInr * months;
  const totalInr = Math.round(subtotalInr * (1 - CYCLE_DISCOUNT[cycle]));
  const enabledFeatures = FEATURE_FLAG_KEYS.filter((k) => flags[k] === true);
  return {
    planCode: "FEATURES" as const,
    billingCycle: cycle,
    monthlyBaseInr,
    months,
    discountPercent,
    subtotalInr,
    totalInr,
    amountPaise: totalInr * 100,
    enabledFeatures,
    featureCount: enabledFeatures.length,
  };
}

export function listFeaturePricingCatalog() {
  const cycles: Billing.BillingCycle[] = [
    "MONTHLY",
    "QUARTERLY",
    "HALF_YEARLY",
    "YEARLY",
  ];
  return {
    model: "per_feature" as const,
    features: listFeatureCatalog(),
    cycles: cycles.map((billingCycle) => ({
      billingCycle,
      label: BILLING_CYCLE_LABELS[billingCycle],
      months: CYCLE_MONTHS[billingCycle],
      discountPercent: Math.round(CYCLE_DISCOUNT[billingCycle] * 100),
    })),
  };
}

export function periodEndFromCycle(
  cycle: Billing.BillingCycle,
  from = new Date(),
): Date {
  const end = new Date(from);
  end.setMonth(end.getMonth() + CYCLE_MONTHS[cycle]);
  return end;
}

export function summarizeEntitledFeatures(flags: FeatureFlagsMap) {
  return listFeatureCatalog()
    .filter((f) => flags[f.key] === true)
    .map((f) => ({
      key: f.key as FeatureFlagKey,
      label: f.label,
      monthlyPriceInr: f.monthlyPriceInr,
    }));
}
