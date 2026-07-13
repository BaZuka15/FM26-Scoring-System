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

const NAV_ITEMS: { view: View; label: string }[] = [
  { view: "rankings", label: "Rankings" },
  { view: "compare", label: "Compare" },
  { view: "bestxi", label: "Best XI" },
  { view: "weights", label: "Role Weights" },
];

function NavTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-3 py-3.5 font-heading text-sm tracking-wide transition-colors ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />}
    </button>
  );
}

export function AppShell() {
  const [view, setView] = useState<View>("upload");
  const status = usePlayerStore((s) => s.status);
  const unrecognizedHeaders = usePlayerStore((s) => s.unrecognizedHeaders);
  const reset = usePlayerStore((s) => s.reset);
  const selectedCount = useSelectionStore((s) => s.selectedIds.length);

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b bg-card">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-lg font-semibold tracking-wide">
              FM<span className="text-primary">26</span>
            </span>
            <span className="font-mono text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">Player Ratings</span>
          </div>
          {status === "loaded" && (
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
          )}
        </div>
        {status === "loaded" && (
          <nav className="flex gap-1 px-2">
            {NAV_ITEMS.map((item) => (
              <NavTab key={item.view} active={view === item.view} onClick={() => setView(item.view)}>
                {item.label}
                {item.view === "compare" && selectedCount > 0 ? ` (${selectedCount})` : ""}
              </NavTab>
            ))}
          </nav>
        )}
      </header>

      {unrecognizedHeaders.length > 0 && status === "loaded" && (
        <div
          className="border-b px-4 py-2 text-sm"
          style={{ backgroundColor: "color-mix(in oklab, var(--rating-amber) 12%, transparent)", color: "var(--rating-amber)" }}
        >
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
