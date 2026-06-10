import { NextRequest, NextResponse } from "next/server";
import type { PhotoDownloadResolution } from "@/server/visitors/visitor-service";

export function visitorPhotoResponse(
  req: NextRequest,
  meta: PhotoDownloadResolution,
): NextResponse {
  if (meta.bytes) {
    return new NextResponse(new Uint8Array(meta.bytes), {
      status: 200,
      headers: {
        "Content-Type": meta.mimeType,
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": `inline; filename="${encodeURIComponent(meta.fileName)}"`,
      },
    });
  }

  return NextResponse.redirect(new URL(meta.redirectUrl ?? "/samples/sample-image.png", req.url), {
    status: 302,
    headers: {
      "Content-Disposition": `inline; filename="${encodeURIComponent(meta.fileName)}"`,
    },
  });
}
