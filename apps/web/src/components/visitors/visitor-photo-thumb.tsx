"use client";

import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { loadVisitorPhotoBlob } from "@/lib/api/visitors";
import { cn } from "@/lib/utils";

type Props = {
  visitorId: string;
  token: string;
  me?: boolean;
  className?: string;
};

export function VisitorPhotoThumb({ visitorId, token, me = false, className }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    setFailed(false);
    setSrc(null);

    void loadVisitorPhotoBlob(token, visitorId, me)
      .then((u) => {
        if (!cancelled) {
          url = u;
          setSrc(u);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [visitorId, token, me]);

  if (failed) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
          className ?? "size-12",
        )}
        aria-hidden
      >
        <UserRound className="size-5 opacity-60" />
      </div>
    );
  }

  if (!src) {
    return <div className={cn("shrink-0 rounded-md bg-muted", className ?? "size-12")} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={cn("shrink-0 rounded-md object-cover", className ?? "size-12")} />
  );
}
