import { ApiError, apiFetchJson, getApiBaseUrl, pickErrorMessage } from "./client";

export type BillingCycle = "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY";

export type EntitledFeature = {
  key: string;
  label: string;
  monthlyPriceInr: number;
};

export type BillingSummary = {
  status: string;
  planCode: string | null;
  billingModel: "per_feature";
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  razorpaySubscriptionId: string | null;
  employeeCount: number;
  trialDaysTotal: number;
  hasPaidAccess: boolean;
  accessReason: string;
  razorpayConfigured: boolean;
  razorpayKeyId: string | null;
  entitledFeatures: EntitledFeature[];
  monthlyFeeInr: number;
  enabledFeatureCount: number;
};

export type BillingQuote = {
  planCode: "FEATURES";
  billingCycle: BillingCycle;
  monthlyBaseInr: number;
  months: number;
  discountPercent: number;
  subtotalInr: number;
  totalInr: number;
  amountPaise: number;
  enabledFeatures: string[];
  featureCount: number;
};

export type FeaturePricingEntry = {
  key: string;
  label: string;
  tier: number;
  monthlyPriceInr: number;
  defaultEnabled: boolean;
};

export type BillingPricingCatalog = {
  model: "per_feature";
  features: FeaturePricingEntry[];
  cycles: Array<{
    billingCycle: BillingCycle;
    label: string;
    months: number;
    discountPercent: number;
  }>;
};

export type SubscribeResult = {
  mock: boolean;
  planCode: string;
  billingCycle?: BillingCycle;
  quote?: BillingQuote;
  orderId: string | null;
  amount: number;
  currency: string;
  subscriptionId: string | null;
  shortUrl: string | null;
  status: string;
  keyId: string | null;
  message?: string;
  prefill?: { name: string; email: string };
};

export async function fetchBillingSummary(token: string): Promise<BillingSummary> {
  return apiFetchJson<BillingSummary>("/v1/billing", { method: "GET", token });
}

export async function fetchBillingPricing(token: string): Promise<BillingPricingCatalog> {
  return apiFetchJson<BillingPricingCatalog>("/v1/billing/pricing", {
    method: "GET",
    token,
  });
}

export async function fetchBillingQuote(
  token: string,
  billingCycle: BillingCycle,
): Promise<BillingQuote> {
  const q = new URLSearchParams({ billingCycle });
  return apiFetchJson<BillingQuote>(`/v1/billing/quote?${q}`, { method: "GET", token });
}

export type BillingInvoiceRow = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  periodYear: number | null;
  periodMonth: number | null;
  paidAt: string | null;
  createdAt: string;
  pdfUrl: string | null;
};

export async function fetchBillingInvoices(token: string): Promise<BillingInvoiceRow[]> {
  return apiFetchJson<BillingInvoiceRow[]>("/v1/billing/invoices", {
    method: "GET",
    token,
  });
}

export async function downloadBillingInvoice(
  token: string,
  invoiceId: string,
  filename: string,
): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/v1/billing/invoices/${invoiceId}/download`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) {
    let json: Record<string, unknown> = {};
    try {
      json = (await res.json()) as Record<string, unknown>;
    } catch {
      /* empty */
    }
    throw new ApiError(pickErrorMessage(json, res.statusText), res.status, json);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function subscribeBilling(
  token: string,
  billingCycle: BillingCycle,
): Promise<SubscribeResult> {
  return apiFetchJson<SubscribeResult>("/v1/billing/subscribe", {
    method: "POST",
    token,
    body: JSON.stringify({ billingCycle }),
  });
}

export async function verifyBillingPayment(
  token: string,
  body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  },
): Promise<{ ok: boolean; planCode: string; billingCycle: BillingCycle; currentPeriodEnd: string }> {
  return apiFetchJson("/v1/billing/verify-payment", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}
