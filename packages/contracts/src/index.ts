/**
 * @sangam/contracts — Zod schemas + shared types for every API surface.
 *
 * Re-export per-module. Populated phase by phase as Nest DTOs are ported.
 *
 *   Phase 1: auth (login, register, verify-email, refresh, etc.)
 *   Phase 2: tenant, employees
 *   Phase 3: payroll, leave, attendance, reports
 *   Phase 4: billing
 *   Phase 5: platform
 */

export * from "./permissions";
export * from "./feature-flags";
export * as PlatformSupport from "./platform-support";
export * from "./envelope";
export * as Auth from "./auth";
export * as Tenant from "./tenant";
export * as Employees from "./employees";
export * as Payroll from "./payroll";
export * as Leave from "./leave";
export * as LeaveTypes from "./leave-types";
export * as Tasks from "./tasks";
export * as Attendance from "./attendance";
export * as Reports from "./reports";
export * as Billing from "./billing";
export * as Notifications from "./notifications";
export * as Audit from "./audit";
export * as EmployeePortal from "./employee-portal";
export * as Platform from "./platform";
export * as Visitors from "./visitors";
export * as SalaryComponents from "./salary-components";
export * as SalaryStructures from "./salary-structures";
export * as PayGroups from "./pay-groups";
export * as Users from "./users";
export * as EmployeeLifecycle from "./employee-lifecycle";
export * as DocumentExpiry from "./document-expiry";
export * as PolicyLibrary from "./policy-library";
export * as Shifts from "./shifts";
export * as AttendanceRegularization from "./attendance-regularization";
export * as MobileCheckIn from "./mobile-check-in";
export * as CompOff from "./comp-off";
export * as BulkImportV2 from "./bulk-import-v2";
export * as Reimbursements from "./reimbursements";
export * as Loans from "./loans";
export * as PayrollAdjustments from "./payroll-adjustments";
export * as TaxDeclarations from "./tax-declarations";
export * as LegalEntities from "./legal-entities";
export * as Announcements from "./announcements";
export * as Helpdesk from "./helpdesk";
export * as Kudos from "./kudos";
export * as Training from "./training";
export * as Assets from "./assets";
export * as VisitorsV2 from "./visitors-v2";
