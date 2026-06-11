/**
 * Canonical SaaS feature modules. Entitlements are stored per tenant at
 * `tenant.settings.saasTenant.featureFlags` and may only be changed by
 * platform super admin.
 *
 * Billing is computed from enabled features (see feature-billing.ts).
 * Core HR/payroll surfaces (employees, payroll runs, leave, attendance) are
 * always available and are not listed here.
 */
export const FEATURE_FLAG_KEYS = [
  // Tier 1
  "leaveTypesAdmin",
  "salaryComponentsAdmin",
  "salaryStructuresAdmin",
  "payGroups",
  "granularRbac",
  "managerRole",
  "reportExport",
  // Tier 2
  "employeeLifecycle",
  "documentExpiry",
  "policyLibrary",
  "orgChart",
  "employeeDirectory",
  "bulkImportV2",
  "shifts",
  "attendanceRegularization",
  "mobileCheckIn",
  "compOff",
  // Tier 3
  "reimbursements",
  "loans",
  "payrollAdjustments",
  "statutoryExports",
  "taxDeclarations",
  "contractorPayroll",
  "multiEntity",
  // Tier 4
  "announcements",
  "helpdesk",
  "kudos",
  "training",
  "assets",
  "visitorsV2",
  "pwa",
] as const;

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number];

export const FEATURE_FLAG_LABELS: Record<FeatureFlagKey, string> = {
  leaveTypesAdmin: "Leave types admin",
  salaryComponentsAdmin: "Salary components admin",
  salaryStructuresAdmin: "Salary structures admin",
  payGroups: "Pay groups",
  granularRbac: "Granular RBAC & users admin",
  managerRole: "Manager role & team views",
  reportExport: "Report Excel/PDF export",
  employeeLifecycle: "Employee lifecycle",
  documentExpiry: "Document expiry alerts",
  policyLibrary: "Policy library & e-sign",
  orgChart: "Org chart",
  employeeDirectory: "Employee directory",
  bulkImportV2: "Bulk import preview (v2)",
  shifts: "Shifts & rosters",
  attendanceRegularization: "Attendance regularization",
  mobileCheckIn: "Mobile check-in",
  compOff: "Comp-off / overtime",
  reimbursements: "Reimbursements",
  loans: "Loans & advances",
  payrollAdjustments: "Payroll adjustments / arrears",
  statutoryExports: "Statutory export helpers",
  taxDeclarations: "Tax declarations",
  contractorPayroll: "Contractor payroll",
  multiEntity: "Multi-entity",
  announcements: "Announcements",
  helpdesk: "Helpdesk / tickets",
  kudos: "Kudos / recognition",
  training: "Training & certifications",
  assets: "Asset management",
  visitorsV2: "Visitors v2 (check-out, alerts)",
  pwa: "PWA / push notifications",
};

/** Per-feature monthly list price (INR). Super admin toggles drive tenant billing. */
export const FEATURE_MONTHLY_PRICE_INR: Record<FeatureFlagKey, number> = {
  leaveTypesAdmin: 499,
  salaryComponentsAdmin: 799,
  salaryStructuresAdmin: 799,
  payGroups: 599,
  granularRbac: 999,
  managerRole: 799,
  reportExport: 499,
  employeeLifecycle: 699,
  documentExpiry: 399,
  policyLibrary: 599,
  orgChart: 399,
  employeeDirectory: 299,
  bulkImportV2: 499,
  shifts: 899,
  attendanceRegularization: 499,
  mobileCheckIn: 399,
  compOff: 499,
  reimbursements: 799,
  loans: 699,
  payrollAdjustments: 599,
  statutoryExports: 499,
  taxDeclarations: 599,
  contractorPayroll: 999,
  multiEntity: 1499,
  announcements: 299,
  helpdesk: 699,
  kudos: 199,
  training: 599,
  assets: 499,
  visitorsV2: 299,
  pwa: 199,
};

/**
 * Features enabled automatically when a tenant is provisioned.
 * Adjust this list when default entitlements are finalized.
 */
export const DEFAULT_ENABLED_FEATURE_KEYS: FeatureFlagKey[] = [];

export type FeatureCatalogEntry = {
  key: FeatureFlagKey;
  label: string;
  tier: 1 | 2 | 3 | 4;
  monthlyPriceInr: number;
  defaultEnabled: boolean;
};

const TIER_BY_KEY: Record<FeatureFlagKey, 1 | 2 | 3 | 4> = {
  leaveTypesAdmin: 1,
  salaryComponentsAdmin: 1,
  salaryStructuresAdmin: 1,
  payGroups: 1,
  granularRbac: 1,
  managerRole: 1,
  reportExport: 1,
  employeeLifecycle: 2,
  documentExpiry: 2,
  policyLibrary: 2,
  orgChart: 2,
  employeeDirectory: 2,
  bulkImportV2: 2,
  shifts: 2,
  attendanceRegularization: 2,
  mobileCheckIn: 2,
  compOff: 2,
  reimbursements: 3,
  loans: 3,
  payrollAdjustments: 3,
  statutoryExports: 3,
  taxDeclarations: 3,
  contractorPayroll: 3,
  multiEntity: 3,
  announcements: 4,
  helpdesk: 4,
  kudos: 4,
  training: 4,
  assets: 4,
  visitorsV2: 4,
  pwa: 4,
};

export function listFeatureCatalog(): FeatureCatalogEntry[] {
  const defaults = new Set(DEFAULT_ENABLED_FEATURE_KEYS);
  return FEATURE_FLAG_KEYS.map((key) => ({
    key,
    label: FEATURE_FLAG_LABELS[key],
    tier: TIER_BY_KEY[key],
    monthlyPriceInr: FEATURE_MONTHLY_PRICE_INR[key],
    defaultEnabled: defaults.has(key),
  }));
}

export function buildDefaultFeatureFlagsMap(): FeatureFlagsMap {
  const out: FeatureFlagsMap = {};
  for (const key of DEFAULT_ENABLED_FEATURE_KEYS) {
    out[key] = true;
  }
  return out;
}

export type FeatureFlagsMap = Partial<Record<FeatureFlagKey, boolean>>;

/** Permissions that require a paid feature module. `null` = always available (core). */
export const PERMISSION_FEATURE_REQUIREMENTS: Partial<
  Record<string, FeatureFlagKey>
> = {
  "leave:write": "leaveTypesAdmin",
  "reports:write": "reportExport",
  "team:read": "managerRole",
  "team:approve_leave": "managerRole",
};

export function permissionRequiresFeature(
  permission: string,
): FeatureFlagKey | null {
  return PERMISSION_FEATURE_REQUIREMENTS[permission] ?? null;
}
