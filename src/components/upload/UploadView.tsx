"use client";

import { useCallback, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <Card className="w-full max-w-xl">
        <CardContent className="pt-6">
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
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
              isDragging ? "border-primary bg-accent" : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
          >
            <p className="text-lg font-medium">Drop your FM26 HTML export here</p>
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
            <p className="mt-4 text-sm text-destructive" role="alert">
              {parseError}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
