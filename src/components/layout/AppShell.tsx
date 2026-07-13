"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BestXiView } from "@/components/bestxi/BestXiView";
import { ComparisonView } from "@/components/compare/ComparisonView";
import { RankingsView } from "@/components/rankings/RankingsView";
import { UploadView } from "@/components/upload/UploadView";
import { WeightEditorView } from "@/components/weights/WeightEditorView";
import { usePlayerStore } from "@/lib/store/usePlayerStore";
import { useSelectionStore } from "@/lib/store/useSelectionStore";

type View = "upload" | "rankings" | "compare" | "bestxi" | "weights";

export function AppShell() {
  const [view, setView] = useState<View>("upload");
  const status = usePlayerStore((s) => s.status);
  const unrecognizedHeaders = usePlayerStore((s) => s.unrecognizedHeaders);
  const reset = usePlayerStore((s) => s.reset);
  const selectedCount = useSelectionStore((s) => s.selectedIds.length);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-xl font-bold">FM26 Player Ratings</h1>
        {status === "loaded" && (
          <div className="flex items-center gap-2">
            <Button variant={view === "rankings" ? "default" : "outline"} size="sm" onClick={() => setView("rankings")}>
              Rankings
            </Button>
            <Button variant={view === "compare" ? "default" : "outline"} size="sm" onClick={() => setView("compare")}>
              Compare{selectedCount > 0 ? ` (${selectedCount})` : ""}
            </Button>
            <Button variant={view === "bestxi" ? "default" : "outline"} size="sm" onClick={() => setView("bestxi")}>
              Best XI
            </Button>
            <Button variant={view === "weights" ? "default" : "outline"} size="sm" onClick={() => setView("weights")}>
              Role Weights
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                reset();
                setView("upload");
              }}
            >
              New Upload
            </Button>
          </div>
        )}
      </header>

      {unrecognizedHeaders.length > 0 && status === "loaded" && (
        <div className="border-b bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {unrecognizedHeaders.length} column{unrecognizedHeaders.length === 1 ? "" : "s"} not recognized and kept as extra data:{" "}
          {unrecognizedHeaders.join(", ")}
        </div>
      )}

      <main className="flex-1 overflow-hidden">
        {view === "upload" && <UploadView onLoaded={() => setView("rankings")} />}
        {view === "rankings" && status === "loaded" && <RankingsView />}
        {view === "compare" && status === "loaded" && <ComparisonView />}
        {view === "bestxi" && status === "loaded" && <BestXiView />}
        {view === "weights" && <WeightEditorView />}
      </main>
    </div>
  );
}
