"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { FeatureGate } from "@/components/feature-modules/feature-gate";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { createAnnouncement, fetchAnnouncements } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function AnnouncementsAdminPage() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const listQuery = useQuery({
    queryKey: ["announcements", token],
    queryFn: () =>
      fetchAnnouncements(token!) as Promise<Array<{ id: string; title: string; createdAt: string }>>,
    enabled: !!token,
  });

  const createMut = useMutation({
    mutationFn: () => createAnnouncement(token!, { title, body }),
    onSuccess: () => {
      toast.success("Posted");
      setTitle("");
      setBody("");
      void qc.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Failed"),
  });

  return (
    <FeatureGate flag="announcements" title="Announcements">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Announcements</h1>
        <GlassCard level={2} className="space-y-4 p-4">
          <div>
            <Label>Title</Label>
            <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Body</Label>
            <textarea
              className="mt-1 min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <Button type="button" onClick={() => createMut.mutate()} disabled={!title.trim() || !body.trim()}>
            Post
          </Button>
        </GlassCard>
        <GlassCard level={2} className="p-4">
          <ul className="space-y-2 text-sm">
            {(listQuery.data ?? []).map((a) => (
              <li key={a.id}>
                {a.title} — {new Date(a.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </FeatureGate>
  );
}
