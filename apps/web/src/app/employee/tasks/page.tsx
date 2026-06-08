"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Play,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ApiError } from "@/lib/api/client";
import { fetchMeTasks, patchMeTaskStatus } from "@/lib/api/employee-portal";
import type { TaskRow, TaskStatus } from "@/lib/api/tasks";
import { useAuthStore } from "@/lib/auth/auth-store";
import { cn } from "@/lib/utils";

const STAGES: {
  status: TaskStatus;
  label: string;
  icon: typeof Circle;
}[] = [
  { status: "PENDING", label: "Pending", icon: Circle },
  { status: "ACCEPTED", label: "Accepted", icon: Sparkles },
  { status: "WORKING", label: "Working", icon: Clock },
  { status: "DONE", label: "Done", icon: CheckCircle2 },
];

function nextAction(
  status: TaskStatus,
): { label: string; next: "ACCEPTED" | "WORKING" | "DONE" } | null {
  if (status === "PENDING") return { label: "Accept task", next: "ACCEPTED" };
  if (status === "ACCEPTED") return { label: "Start working", next: "WORKING" };
  if (status === "WORKING") return { label: "Mark done", next: "DONE" };
  return null;
}

function TaskEmployeeCard({
  task,
  onAction,
  busyId,
}: {
  task: TaskRow;
  onAction: (id: string, status: "ACCEPTED" | "WORKING" | "DONE") => void;
  busyId: string | null;
}) {
  const action = nextAction(task.status);
  const busy = busyId === task.id;

  return (
    <GlassCard level={2} className="space-y-3 p-4" hoverable={false}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug">{task.title}</h3>
        <Badge variant="outline">{task.priority}</Badge>
      </div>
      {task.description ? (
        <p className="text-sm text-muted-foreground">{task.description}</p>
      ) : null}
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {task.dueDate ? (
          <span className="rounded-full bg-muted px-2 py-0.5">Due {task.dueDate}</span>
        ) : null}
        <span>From {task.assignedByName}</span>
      </div>
      {action ? (
        <Button
          type="button"
          size="sm"
          className="w-full sm:w-auto"
          disabled={busy}
          onClick={() => onAction(task.id, action.next)}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : task.status === "WORKING" ? (
            <CheckCircle2 className="size-4" />
          ) : task.status === "ACCEPTED" ? (
            <Play className="size-4" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {busy ? "Updating…" : action.label}
        </Button>
      ) : (
        <p className="text-xs font-medium text-[var(--success-text)]">Completed</p>
      )}
    </GlassCard>
  );
}

export default function EmployeeTasksPage() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const [tab, setTab] = useState<TaskStatus | "ALL">("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  const tasksQuery = useQuery({
    queryKey: ["me", "tasks", token],
    queryFn: () => fetchMeTasks(token!),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "ACCEPTED" | "WORKING" | "DONE";
    }) => patchMeTaskStatus(token!, id, status),
    onMutate: ({ id }) => setBusyId(id),
    onSuccess: () => {
      toast.success("Task updated.");
      void qc.invalidateQueries({ queryKey: ["me", "tasks"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Update failed"),
    onSettled: () => setBusyId(null),
  });

  const tasks = tasksQuery.data ?? [];
  const filtered = useMemo(() => {
    if (tab === "ALL") return tasks;
    return tasks.filter((t) => t.status === tab);
  }, [tasks, tab]);

  const counts = useMemo(() => {
    const c: Record<TaskStatus, number> = {
      PENDING: 0,
      ACCEPTED: 0,
      WORKING: 0,
      DONE: 0,
      CANCELLED: 0,
    };
    for (const t of tasks) c[t.status]++;
    return c;
  }, [tasks]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold md:text-3xl">
          My tasks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accept assignments from your manager, track progress, and mark work complete.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STAGES.map((s) => (
          <GlassCard key={s.status} level={1} className="p-3 text-center" hoverable={false}>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold">{counts[s.status]}</p>
          </GlassCard>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={tab === "ALL" ? "default" : "outline"}
          onClick={() => setTab("ALL")}
        >
          All ({tasks.length})
        </Button>
        {STAGES.map((s) => (
          <Button
            key={s.status}
            type="button"
            size="sm"
            variant={tab === s.status ? "default" : "outline"}
            onClick={() => setTab(s.status)}
          >
            {s.label} ({counts[s.status]})
          </Button>
        ))}
      </div>

      {tasksQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading tasks…</p>
      ) : filtered.length === 0 ? (
        <GlassCard level={2} className="p-8 text-center" hoverable={false}>
          <p className="text-sm text-muted-foreground">
            {tab === "ALL" ? "No tasks assigned yet." : `No ${tab.toLowerCase()} tasks.`}
          </p>
        </GlassCard>
      ) : (
        <div className={cn("grid gap-4", tab === "ALL" && "sm:grid-cols-2")}>
          {filtered.map((task) => (
            <TaskEmployeeCard
              key={task.id}
              task={task}
              busyId={busyId}
              onAction={(id, status) => mutation.mutate({ id, status })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
