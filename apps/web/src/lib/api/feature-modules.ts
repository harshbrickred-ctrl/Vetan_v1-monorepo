import { apiFetchJson } from "./client";

// ─── Employee lifecycle ───
export async function patchEmployeeLifecycle(
  token: string,
  employeeId: string,
  payload: Record<string, unknown>,
) {
  return apiFetchJson(`/v1/employees/${employeeId}/lifecycle`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

// ─── Document expiry ───
export async function fetchExpiringDocuments(token: string, withinDays?: number) {
  const q = withinDays ? `?withinDays=${withinDays}` : "";
  return apiFetchJson(`/v1/documents/expiring${q}`, { method: "GET", token });
}

// ─── Policies ───
export async function fetchPolicies(token: string) {
  return apiFetchJson("/v1/tenant/policies", { method: "GET", token });
}
export async function createPolicy(token: string, payload: Record<string, unknown>) {
  return apiFetchJson("/v1/tenant/policies", { method: "POST", token, body: JSON.stringify(payload) });
}
export async function fetchMePolicies(token: string) {
  return apiFetchJson("/v1/me/policies", { method: "GET", token });
}
export async function acknowledgePolicy(token: string, policyId: string) {
  return apiFetchJson(`/v1/me/policies/${policyId}/acknowledge`, { method: "POST", token });
}

// ─── Org chart & directory ───
export async function fetchOrgChart(token: string) {
  return apiFetchJson("/v1/org-chart", { method: "GET", token });
}
export async function fetchEmployeeDirectory(token: string, search?: string) {
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetchJson(`/v1/employees/directory${q}`, { method: "GET", token });
}

// ─── Bulk import preview ───
export async function previewBulkImport(token: string, rows: unknown[]) {
  return apiFetchJson("/v1/employees/import/preview", {
    method: "POST",
    token,
    body: JSON.stringify({ rows }),
  });
}

// ─── Shifts ───
export async function fetchShifts(token: string) {
  return apiFetchJson("/v1/tenant/shifts", { method: "GET", token });
}
export async function createShift(token: string, payload: Record<string, unknown>) {
  return apiFetchJson("/v1/tenant/shifts", { method: "POST", token, body: JSON.stringify(payload) });
}
export async function fetchRosters(token: string, params?: Record<string, string>) {
  const q = params ? `?${new URLSearchParams(params)}` : "";
  return apiFetchJson(`/v1/tenant/rosters${q}`, { method: "GET", token });
}
export async function createRoster(token: string, payload: Record<string, unknown>) {
  return apiFetchJson("/v1/tenant/rosters", { method: "POST", token, body: JSON.stringify(payload) });
}

// ─── Attendance regularization ───
export async function fetchRegularizations(token: string) {
  return apiFetchJson("/v1/attendance-regularizations", { method: "GET", token });
}
export async function fetchMeRegularizations(token: string) {
  return apiFetchJson("/v1/me/attendance-regularizations", { method: "GET", token });
}
export async function createMeRegularization(token: string, payload: Record<string, unknown>) {
  return apiFetchJson("/v1/me/attendance-regularizations", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}
export async function updateRegularizationStatus(
  token: string,
  id: string,
  status: "APPROVED" | "REJECTED",
) {
  return apiFetchJson(`/v1/attendance-regularizations/${id}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
}

// ─── Mobile check-in ───
export async function mobileCheckIn(token: string, payload?: Record<string, unknown>) {
  return apiFetchJson("/v1/me/attendance/check-in", {
    method: "POST",
    token,
    body: JSON.stringify(payload ?? {}),
  });
}

// ─── Comp-off ───
export async function fetchCompOff(token: string) {
  return apiFetchJson("/v1/comp-off", { method: "GET", token });
}
export async function fetchMeCompOff(token: string) {
  return apiFetchJson("/v1/me/comp-off", { method: "GET", token });
}
export async function createMeCompOff(token: string, payload: Record<string, unknown>) {
  return apiFetchJson("/v1/me/comp-off", { method: "POST", token, body: JSON.stringify(payload) });
}

// ─── Reimbursements ───
export async function fetchReimbursements(token: string) {
  return apiFetchJson("/v1/reimbursements", { method: "GET", token });
}
export async function fetchMeReimbursements(token: string) {
  return apiFetchJson("/v1/me/reimbursements", { method: "GET", token });
}
export async function createMeReimbursement(token: string, payload: Record<string, unknown>) {
  return apiFetchJson("/v1/me/reimbursements", { method: "POST", token, body: JSON.stringify(payload) });
}

// ─── Loans ───
export async function fetchLoans(token: string) {
  return apiFetchJson("/v1/loans", { method: "GET", token });
}
export async function createLoan(token: string, payload: Record<string, unknown>) {
  return apiFetchJson("/v1/loans", { method: "POST", token, body: JSON.stringify(payload) });
}

// ─── Payroll adjustments ───
export async function fetchPayrollAdjustments(token: string) {
  return apiFetchJson("/v1/payroll-adjustments", { method: "GET", token });
}
export async function createPayrollAdjustment(token: string, payload: Record<string, unknown>) {
  return apiFetchJson("/v1/payroll-adjustments", { method: "POST", token, body: JSON.stringify(payload) });
}

// ─── Tax declarations ───
export async function fetchMeTaxDeclaration(token: string, year: number) {
  return apiFetchJson(`/v1/me/tax-declarations?year=${year}`, { method: "GET", token });
}
export async function upsertMeTaxDeclaration(token: string, payload: Record<string, unknown>) {
  return apiFetchJson("/v1/me/tax-declarations", {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

// ─── Contractors ───
export async function fetchContractors(token: string) {
  return apiFetchJson("/v1/employees/contractors", { method: "GET", token });
}

// ─── Legal entities ───
export async function fetchLegalEntities(token: string) {
  return apiFetchJson("/v1/tenant/legal-entities", { method: "GET", token });
}
export async function createLegalEntity(token: string, payload: Record<string, unknown>) {
  return apiFetchJson("/v1/tenant/legal-entities", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

// ─── Announcements ───
export async function fetchAnnouncements(token: string) {
  return apiFetchJson("/v1/announcements", { method: "GET", token });
}
export async function createAnnouncement(token: string, payload: Record<string, unknown>) {
  return apiFetchJson("/v1/announcements", { method: "POST", token, body: JSON.stringify(payload) });
}
export async function fetchMeAnnouncements(token: string) {
  return apiFetchJson("/v1/me/announcements", { method: "GET", token });
}

// ─── Helpdesk ───
export async function fetchHelpdeskTickets(token: string) {
  return apiFetchJson("/v1/helpdesk/tickets", { method: "GET", token });
}
export async function fetchMeHelpdeskTickets(token: string) {
  return apiFetchJson("/v1/me/helpdesk/tickets", { method: "GET", token });
}
export async function createMeHelpdeskTicket(token: string, payload: Record<string, unknown>) {
  return apiFetchJson("/v1/me/helpdesk/tickets", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

// ─── Kudos ───
export async function fetchKudosFeed(token: string) {
  return apiFetchJson("/v1/kudos", { method: "GET", token });
}
export async function createKudos(token: string, payload: Record<string, unknown>) {
  return apiFetchJson("/v1/me/kudos", { method: "POST", token, body: JSON.stringify(payload) });
}

// ─── Training ───
export async function fetchTrainingCourses(token: string) {
  return apiFetchJson("/v1/training/courses", { method: "GET", token });
}
export async function fetchMeTrainingEnrollments(token: string) {
  return apiFetchJson("/v1/me/training/enrollments", { method: "GET", token });
}

// ─── Assets ───
export async function fetchAssets(token: string) {
  return apiFetchJson("/v1/assets", { method: "GET", token });
}
export async function createAsset(token: string, payload: Record<string, unknown>) {
  return apiFetchJson("/v1/assets", { method: "POST", token, body: JSON.stringify(payload) });
}

// ─── Visitors v2 ───
export async function checkOutVisitor(token: string, visitorId: string) {
  return apiFetchJson(`/v1/visitors/${visitorId}/checkout`, { method: "POST", token });
}
export async function notifyVisitorHost(token: string, visitorId: string) {
  return apiFetchJson(`/v1/visitors/${visitorId}/notify-host`, { method: "POST", token });
}
