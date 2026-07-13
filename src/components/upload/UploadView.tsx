"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { usePlayerStore } from "@/lib/store/usePlayerStore";

interface UploadViewProps {
  onLoaded: () => void;
}

export function UploadView({ onLoaded }: UploadViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const loadFromHtml = usePlayerStore((s) => s.loadFromHtml);
  const parseError = usePlayerStore((s) => s.parseError);
  const status = usePlayerStore((s) => s.status);

  const handleFile = useCallback(
    async (file: File) => {
      const text = await file.text();
      loadFromHtml(text);
      if (usePlayerStore.getState().status === "loaded") {
        onLoaded();
      }
    },
    [loadFromHtml, onLoaded],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden p-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 79px, var(--foreground) 79px, var(--foreground) 80px)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex w-full max-w-xl flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-xs font-medium tracking-[0.3em] text-primary uppercase">Football Manager 2026</span>
          <h1 className="font-heading text-4xl leading-tight font-semibold tracking-wide sm:text-5xl">
            Know your squad&apos;s <span className="text-primary">true value</span>
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Upload an HTML export from FM26 and get every player rated against every role, your strongest XI, and the weak spots worth
            strengthening.
          </p>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/30"
          }`}
        >
          <UploadCloud className={`size-8 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
          <p className="font-heading text-base tracking-wide">Drop your FM26 HTML export here</p>
          <p className="text-sm text-muted-foreground">or click to browse — squad, shortlist, or player search exports all work</p>
          <input
            ref={inputRef}
            type="file"
            accept=".html,.htm"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>

        {parseError && status !== "loaded" && (
          <p className="rounded-md border px-3 py-2 text-sm" style={{ color: "var(--rating-red)", borderColor: "var(--rating-red)" }} role="alert">
            {parseError}
          </p>
        )}
      </div>
    </div>
  );
}
