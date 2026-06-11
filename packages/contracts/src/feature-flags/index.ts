/**
 * Canonical tenant feature-flag keys. Stored in tenant.settings.saasTenant.featureFlags.
 * All flags default to false when absent.
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

export type FeatureFlagsMap = Partial<Record<FeatureFlagKey, boolean>>;
