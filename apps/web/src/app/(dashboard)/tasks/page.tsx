"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { fetchEmployees } from "@/lib/api/employees";
import {
  createTask,
  fetchTaskSummary,
  fetchTasks,
  patchAdminTaskStatus,
  type TaskPriority,
  type TaskRow,
  type TaskStatus,
} from "@/lib/api/tasks";
import { Permission } from "@/lib/auth/permissions";
import { useAuthStore } from "@/lib/auth/auth-store";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { cn } from "@/lib/utils";

const KANBAN_COLUMNS: {
  status: TaskStatus;
  label: string;
  icon: typeof Circle;
  accent: string;
}[] = [
  {
    status: "PENDING",
    label: "Pending",
    icon: Circle,
    accent: "border-[var(--warning-text)]/40 bg-[color-mix(in_srgb,var(--warning-text)_8%,transparent)]",
  },
  {
    status: "ACCEPTED",
    label: "Accepted",
    icon: Sparkles,
    accent: "border-[var(--brand-500)]/35 bg-[color-mix(in_srgb,var(--brand-500)_8%,transparent)]",
  },
  {
    status: "WORKING",
    label: "Working",
    icon: Clock,
    accent: "border-[var(--info-text)]/35 bg-[color-mix(in_srgb,var(--brand-400)_10%,transparent)]",
  },
  {
    status: "DONE",
    label: "Done",
    icon: CheckCircle2,
    accent: "border-[var(--success-text)]/40 bg-[color-mix(in_srgb,var(--success-text)_8%,transparent)]",
  },
];

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

function priorityVariant(p: TaskPriority): "secondary" | "default" | "destructive" {
  if (p === "HIGH") return "destructive";
  if (p === "MEDIUM") return "default";
  return "secondary";
}

function TaskCard({
  task,
  canWrite,
  onCancel,
  onComplete,
  busy,
}: {
  task: TaskRow;
  canWrite: boolean;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  busy: boolean;
}) {
  return (
    <GlassCard level={1} className="space-y-3 p-4" hoverable={false}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium leading-snug">{task.title}</h3>
        <Badge variant={priorityVariant(task.priority)}>{PRIORITY_LABEL[task.priority]}</Badge>
      </div>
      {task.description ? (
        <p className="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
      ) : null}
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">{task.assigneeName}</span>
          <span className="ml-1 font-mono text-[10px]">({task.assigneeCode})</span>
        </p>
        {task.dueDate ? <p>Due {task.dueDate}</p> : null}
        <p>Assigned by {task.assignedByName}</p>
      </div>
      {canWrite && task.status !== "DONE" && task.status !== "CANCELLED" ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onComplete(task.id)}
          >
            Mark done
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-destructive"
            disabled={busy}
            onClick={() => onCancel(task.id)}
          >
            Cancel
          </Button>
        </div>
      ) : null}
    </GlassCard>
  );
}

export default function TasksPage() {
  const token = useAuthStore((s) => s.token);
  const { hasPermission } = usePermissions();
  const canWrite = hasPermission(Permission["tasks:write"]);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [mobileStage, setMobileStage] = useState<TaskStatus>("PENDING");
  const [assignOpen, setAssignOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");

  const summaryQuery = useQuery({
    queryKey: ["tasks", "summary", token],
    queryFn: () => fetchTaskSummary(token!),
    enabled: !!token,
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks", "list", token, search],
    queryFn: () => fetchTasks(token!, { search: search || undefined, limit: 200 }),
    enabled: !!token,
  });

  const employeesQuery = useQuery({
    queryKey: ["employees", "tasks-assign", token],
    queryFn: () => fetchEmployees(token!, { page: 1, pageSize: 200, status: "ACTIVE" }),
    enabled: !!token && assignOpen,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createTask(token!, {
        assigneeId,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
      }),
    onSuccess: () => {
      toast.success("Task assigned.");
      setAssignOpen(false);
      setTitle("");
      setDescription("");
      setAssigneeId("");
      setDueDate("");
      setPriority("MEDIUM");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Could not assign task"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "DONE" | "CANCELLED" }) =>
      patchAdminTaskStatus(token!, id, status),
    onSuccess: () => {
      toast.success("Task updated.");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Update failed"),
  });

  const tasks = tasksQuery.data ?? [];
  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, TaskRow[]> = {
      PENDING: [],
      ACCEPTED: [],
      WORKING: [],
      DONE: [],
      CANCELLED: [],
    };
    for (const t of tasks) {
      if (t.status !== "CANCELLED") map[t.status].push(t);
    }
    return map;
  }, [tasks]);

  const summary = summaryQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">Tasks</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Assign work to employees and track progress from pending through done.
          </p>
        </div>
        {canWrite ? (
          <Button type="button" onClick={() => setAssignOpen(true)}>
            <Plus className="size-4" />
            Assign task
          </Button>
        ) : null}
      </div>

      {summary ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {KANBAN_COLUMNS.map((col) => (
            <GlassCard key={col.status} level={2} className="p-4" hoverable={false}>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {col.label}
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">
                {col.status === "PENDING"
                  ? summary.pending
                  : col.status === "ACCEPTED"
                    ? summary.accepted
                    : col.status === "WORKING"
                      ? summary.working
                      : summary.done}
              </p>
            </GlassCard>
          ))}
        </div>
      ) : null}

      <GlassCard level={2} className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search tasks or assignee…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </GlassCard>

      <div className="hidden gap-4 lg:grid lg:grid-cols-4">
        {KANBAN_COLUMNS.map((col) => {
          const Icon = col.icon;
          const items = byStatus[col.status];
          return (
            <div key={col.status} className={cn("rounded-xl border p-3", col.accent)}>
              <div className="mb-3 flex items-center gap-2">
                <Icon className="size-4 text-[var(--brand-500)]" />
                <h2 className="text-sm font-semibold">{col.label}</h2>
                <Badge variant="outline" className="ml-auto">
                  {items.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {tasksQuery.isLoading ? (
                  <p className="text-xs text-muted-foreground">Loading…</p>
                ) : items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tasks</p>
                ) : (
                  items.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      canWrite={canWrite}
                      busy={statusMutation.isPending}
                      onCancel={(id) => statusMutation.mutate({ id, status: "CANCELLED" })}
                      onComplete={(id) => statusMutation.mutate({ id, status: "DONE" })}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="lg:hidden">
        <div className="mb-3 flex flex-wrap gap-2">
          {KANBAN_COLUMNS.map((col) => (
            <Button
              key={col.status}
              type="button"
              size="sm"
              variant={mobileStage === col.status ? "default" : "outline"}
              onClick={() => setMobileStage(col.status)}
            >
              {col.label} ({byStatus[col.status].length})
            </Button>
          ))}
        </div>
        <div className="space-y-3">
          {byStatus[mobileStage].map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              canWrite={canWrite}
              busy={statusMutation.isPending}
              onCancel={(id) => statusMutation.mutate({ id, status: "CANCELLED" })}
              onComplete={(id) => statusMutation.mutate({ id, status: "DONE" })}
            />
          ))}
          {byStatus[mobileStage].length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks in this stage.</p>
          ) : null}
        </div>
      </div>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign a task</DialogTitle>
            <DialogDescription>
              The employee will see this in their portal and can accept, start, and complete it.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!assigneeId || !title.trim()) {
                toast.error("Pick an employee and enter a title.");
                return;
              }
              createMutation.mutate();
            }}
          >
            <div>
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="task-desc">Description</Label>
              <textarea
                id="task-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="task-assignee">Employee</Label>
              <select
                id="task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                required
                className="mt-1 h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="">Select employee…</option>
                {(employeesQuery.data?.items ?? []).map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="task-due">Due date</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="mt-1 h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Assigning…
                  </>
                ) : (
                  "Assign"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
