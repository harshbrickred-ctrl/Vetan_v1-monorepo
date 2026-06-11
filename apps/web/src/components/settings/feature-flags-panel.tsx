"use client";

import {
  FEATURE_FLAG_KEYS,
  FEATURE_FLAG_LABELS,
  type FeatureFlagKey,
  type FeatureFlagsMap,
} from "@/lib/feature-flags";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const TIER_GROUPS: { title: string; keys: FeatureFlagKey[] }[] = [
  {
    title: "Tier 1 — Foundation",
    keys: [
      "leaveTypesAdmin",
      "salaryComponentsAdmin",
      "salaryStructuresAdmin",
      "payGroups",
      "granularRbac",
      "managerRole",
      "reportExport",
    ],
  },
  {
    title: "Tier 2 — HR operations",
    keys: [
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
    ],
  },
  {
    title: "Tier 3 — Payroll & finance",
    keys: [
      "reimbursements",
      "loans",
      "payrollAdjustments",
      "statutoryExports",
      "taxDeclarations",
      "contractorPayroll",
      "multiEntity",
    ],
  },
  {
    title: "Tier 4 — Employee experience",
    keys: [
      "announcements",
      "helpdesk",
      "kudos",
      "training",
      "assets",
      "visitorsV2",
      "pwa",
    ],
  },
];

type Props = {
  flags: FeatureFlagsMap;
  onChange: (flags: FeatureFlagsMap) => void;
  disabled?: boolean;
};

export function FeatureFlagsPanel({ flags, onChange, disabled }: Props) {
  function toggle(key: FeatureFlagKey, on: boolean) {
    onChange({ ...flags, [key]: on });
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Enable modules per workspace. Disabled flags keep existing workflows unchanged.
      </p>
      {TIER_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.title}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.keys.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-3 text-sm hover:bg-muted/40"
              >
                <Checkbox
                  checked={flags[key] === true}
                  onCheckedChange={(c) => toggle(key, c === true)}
                  disabled={disabled}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-medium">{FEATURE_FLAG_LABELS[key]}</span>
                  <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                    {key}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <div>
        <Label className="text-xs text-muted-foreground">Advanced JSON (merged on save)</Label>
        <pre className="mt-1 max-h-32 overflow-auto rounded-md border border-border bg-muted/30 p-2 font-mono text-[10px]">
          {JSON.stringify(
            Object.fromEntries(
              FEATURE_FLAG_KEYS.filter((k) => flags[k]).map((k) => [k, true]),
            ),
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  );
}
