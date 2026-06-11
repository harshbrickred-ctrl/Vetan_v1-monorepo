import { prisma } from "@sangam/db";
import type { MobileCheckIn } from "@sangam/contracts";

export async function checkIn(
  tenantId: string,
  employeeId: string,
  dto: MobileCheckIn.MobileCheckInDto,
) {
  const today = new Date();
  const dateOnly = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const now = new Date();

  const existing = await prisma.attendanceRecord.findUnique({
    where: { employeeId_date: { employeeId, date: dateOnly } },
  });

  if (existing?.checkIn) {
    const row = await prisma.attendanceRecord.update({
      where: { id: existing.id },
      data: {
        checkOut: now,
        detail: {
          ...(typeof existing.detail === "object" && existing.detail !== null
            ? (existing.detail as Record<string, unknown>)
            : {}),
          mobileCheckOut: { at: now.toISOString(), ...dto },
        },
      },
    });
    return {
      action: "check_out" as const,
      id: row.id,
      date: row.date.toISOString().slice(0, 10),
      checkIn: row.checkIn?.toISOString() ?? null,
      checkOut: row.checkOut?.toISOString() ?? null,
      status: row.status,
    };
  }

  const row = await prisma.attendanceRecord.upsert({
    where: { employeeId_date: { employeeId, date: dateOnly } },
    create: {
      tenantId,
      employeeId,
      date: dateOnly,
      status: "PRESENT",
      checkIn: now,
      source: "mobile",
      detail: { mobileCheckIn: { at: now.toISOString(), ...dto } },
    },
    update: {
      checkIn: now,
      status: "PRESENT",
      source: "mobile",
      detail: { mobileCheckIn: { at: now.toISOString(), ...dto } },
    },
  });

  return {
    action: "check_in" as const,
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    checkIn: row.checkIn?.toISOString() ?? null,
    checkOut: row.checkOut?.toISOString() ?? null,
    status: row.status,
  };
}
