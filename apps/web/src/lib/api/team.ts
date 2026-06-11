import { apiFetchJson } from "./client";

export type DirectReport = {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  status: string;
  department: string | null;
  designation: string | null;
};

export type TeamLeaveRequest = {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  leaveType: string;
  leaveTypeCode: string;
  startDate: string;
  endDate: string;
  workingDays: number;
  status: string;
  reason: string | null;
  createdAt: string;
};

export type TeamAttendanceRow = {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  date: string;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
  source: string;
};

export async function fetchTeamLeaveRequests(token: string) {
  return apiFetchJson<TeamLeaveRequest[]>("/v1/me/team/leave/requests", {
    method: "GET",
    token,
  });
}

export async function fetchTeamAttendance(
  token: string,
  opts?: { from?: string; to?: string },
) {
  const params = new URLSearchParams();
  if (opts?.from) params.set("from", opts.from);
  if (opts?.to) params.set("to", opts.to);
  const q = params.toString();
  return apiFetchJson<TeamAttendanceRow[]>(
    `/v1/me/team/attendance${q ? `?${q}` : ""}`,
    { method: "GET", token },
  );
}
