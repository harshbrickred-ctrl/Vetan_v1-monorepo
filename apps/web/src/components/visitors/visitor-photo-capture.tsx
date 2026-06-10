"use client";

import { Camera, ImagePlus, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  value: File | null;
  onChange: (file: File | null) => void;
  className?: string;
};

function fileFromCanvas(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not capture photo"));
          return;
        }
        resolve(new File([blob], name, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  });
}

export function VisitorPhotoCapture({ value, onChange, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      setCameraError("Camera access denied or unavailable. Use upload instead.");
    }
  }

  async function captureFromCamera() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const file = await fileFromCanvas(canvas, `visitor-${Date.now()}.jpg`);
    onChange(file);
    stopCamera();
  }

  function handleFileChange(file: File | null) {
    if (!file) return;
    onChange(file);
  }

  function clearPhoto() {
    onChange(null);
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-dashed border-border bg-muted/30">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Visitor preview" className="size-full object-cover" />
        ) : cameraOn ? (
          <video ref={videoRef} className="size-full object-cover" playsInline muted />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
            <Camera className="size-8 opacity-50" />
            <p>Take or upload a visitor photo</p>
          </div>
        )}
        {previewUrl ? (
          <button
            type="button"
            onClick={clearPhoto}
            className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 shadow-sm hover:bg-background"
            aria-label="Remove photo"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {cameraError ? <p className="text-xs text-destructive">{cameraError}</p> : null}

      <div className="flex flex-wrap gap-2">
        {!previewUrl && !cameraOn ? (
          <>
            <Button type="button" size="sm" variant="outline" onClick={() => void startCamera()}>
              <Camera className="size-4" />
              Open camera
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="size-4" />
              Upload photo
            </Button>
          </>
        ) : null}
        {cameraOn && !previewUrl ? (
          <>
            <Button type="button" size="sm" onClick={() => void captureFromCamera()}>
              Capture
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={stopCamera}>
              Cancel
            </Button>
          </>
        ) : null}
        {previewUrl ? (
          <Button type="button" size="sm" variant="outline" onClick={clearPhoto}>
            <RotateCcw className="size-4" />
            Retake
          </Button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          handleFileChange(f);
        }}
      />
    </div>
  );
}
