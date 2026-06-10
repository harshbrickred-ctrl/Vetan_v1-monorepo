"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { VisitorPhotoCapture } from "@/components/visitors/visitor-photo-capture";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateVisitorPayload } from "@/lib/api/visitors";

type EmployeeOption = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
};

type Props = {
  employees: EmployeeOption[];
  busy?: boolean;
  onSubmit: (payload: CreateVisitorPayload) => void;
};

function toLocalDatetimeValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const QUICK_HOSTS = ["Owner / Director", "Reception", "HR"];

export function VisitorRegisterForm({ employees, busy, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [visitMode, setVisitMode] = useState<"employee" | "custom">("employee");
  const [visitToEmployeeId, setVisitToEmployeeId] = useState("");
  const [visitToName, setVisitToName] = useState("");
  const [visitedAtLocal, setVisitedAtLocal] = useState(() => toLocalDatetimeValue(new Date()));
  const [photo, setPhoto] = useState<File | null>(null);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === visitToEmployeeId),
    [employees, visitToEmployeeId],
  );

  const resolvedVisitToName =
    visitMode === "employee" && selectedEmployee
      ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`.trim()
      : visitToName.trim();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!photo) return;
    const visitedAt = new Date(visitedAtLocal);
    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      purpose: purpose.trim(),
      visitToName: resolvedVisitToName,
      visitToEmployeeId: visitMode === "employee" ? visitToEmployeeId || undefined : undefined,
      visitedAt: visitedAt.toISOString(),
      photo,
    });
  }

  const canSubmit =
    name.trim() &&
    phone.trim().length >= 6 &&
    purpose.trim() &&
    resolvedVisitToName &&
    photo &&
    !busy;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="visitorName">Visitor name</Label>
          <Input
            id="visitorName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="visitorPhone">Phone number</Label>
          <Input
            id="visitorPhone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile"
            className="mt-1"
            required
          />
        </div>
      </div>

      <div>
        <Label>Whom to visit</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={visitMode === "employee" ? "default" : "outline"}
            onClick={() => setVisitMode("employee")}
          >
            Employee
          </Button>
          <Button
            type="button"
            size="sm"
            variant={visitMode === "custom" ? "default" : "outline"}
            onClick={() => setVisitMode("custom")}
          >
            Other (e.g. Owner)
          </Button>
        </div>
        {visitMode === "employee" ? (
          <select
            className="mt-2 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={visitToEmployeeId}
            onChange={(e) => setVisitToEmployeeId(e.target.value)}
            required
          >
            <option value="">Select employee…</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.employeeCode} — {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
        ) : (
          <div className="mt-2 space-y-2">
            <Input
              value={visitToName}
              onChange={(e) => setVisitToName(e.target.value)}
              placeholder="e.g. Owner / Director"
              required
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_HOSTS.map((h) => (
                <Button
                  key={h}
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setVisitToName(h)}
                >
                  {h}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="visitorPurpose">Purpose of visit</Label>
        <Input
          id="visitorPurpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Meeting, delivery, interview…"
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="visitedAt">Date & time</Label>
        <Input
          id="visitedAt"
          type="datetime-local"
          value={visitedAtLocal}
          onChange={(e) => setVisitedAtLocal(e.target.value)}
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label>Visitor photo</Label>
        <VisitorPhotoCapture value={photo} onChange={setPhoto} className="mt-2" />
      </div>

      <Button type="submit" disabled={!canSubmit} className="w-full sm:w-auto">
        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        Register visitor
      </Button>
    </form>
  );
}
