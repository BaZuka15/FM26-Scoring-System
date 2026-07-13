"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildBestXi, type SlotResult } from "@/lib/bestxi/buildBestXi";
import { FORMATIONS } from "@/lib/bestxi/formations";
import { getRatingBand } from "@/lib/rating/bands";
import { ROLE_BY_ID } from "@/lib/rating/roles";
import { usePlayerStore } from "@/lib/store/usePlayerStore";
import { formatRating } from "@/lib/utils/format";

const BAND_BG: Record<string, string> = {
  green: "bg-green-100 border-green-400 dark:bg-green-950 dark:border-green-700",
  amber: "bg-amber-100 border-amber-400 dark:bg-amber-950 dark:border-amber-700",
  red: "bg-red-100 border-red-400 dark:bg-red-950 dark:border-red-700",
};

function SlotCard({ result, isSelected, onSelect }: { result: SlotResult; isSelected: boolean; onSelect: () => void }) {
  const { slot, starter, isWeakStarter, isThinDepth } = result;
  const band = starter ? getRatingBand(starter.rating.score) : "red";

  return (
    <button
      onClick={onSelect}
      className={`absolute flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 rounded-md border-2 px-2 py-1 text-center shadow-sm transition-transform hover:scale-105 ${BAND_BG[band]} ${isSelected ? "ring-2 ring-primary" : ""}`}
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
    >
      <span className="text-[10px] font-semibold text-muted-foreground">{slot.label}</span>
      {starter ? (
        <>
          <span className="truncate text-xs font-medium">{starter.player.name}</span>
          <span className="font-mono text-xs">{formatRating(starter.rating.score)}</span>
        </>
      ) : (
        <span className="text-xs text-muted-foreground">Empty</span>
      )}
      {(isWeakStarter || isThinDepth) && (
        <div className="flex gap-1">
          {isWeakStarter && (
            <span title="Weak starter" className="text-[10px]">
              ⚠
            </span>
          )}
          {isThinDepth && (
            <span title="Thin depth behind this slot" className="text-[10px]">
              🩹
            </span>
          )}
        </div>
      )}
    </button>
  );
}

export function BestXiView() {
  const players = usePlayerStore((s) => s.players);
  const ratings = usePlayerStore((s) => s.ratings);
  const [formationId, setFormationId] = useState(FORMATIONS[0].id);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const formation = FORMATIONS.find((f) => f.id === formationId)!;
  const result = useMemo(() => buildBestXi(formation, players, ratings), [formation, players, ratings]);

  const selectedSlot = result.slots.find((s) => s.slot.slotId === selectedSlotId) ?? null;

  const weakestSlot = result.slots.filter((s) => s.starter).sort((a, b) => a.starter!.rating.score - b.starter!.rating.score)[0];
  const emptySlots = result.slots.filter((s) => !s.starter);

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4 sm:flex-row sm:overflow-hidden">
      <div className="flex flex-1 flex-col gap-4 sm:overflow-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Select value={formationId} onValueChange={(value) => setFormationId(value as string)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMATIONS.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            Total rating: <span className="font-mono font-medium text-foreground">{formatRating(result.totalRating)}</span>
          </div>
        </div>

        {(weakestSlot || emptySlots.length > 0) && (
          <div className="flex flex-wrap gap-2 text-sm">
            {emptySlots.length > 0 && (
              <Badge variant="destructive">
                {emptySlots.length} unfilled slot{emptySlots.length === 1 ? "" : "s"}: {emptySlots.map((s) => s.slot.label).join(", ")}
              </Badge>
            )}
            {weakestSlot && (
              <Badge variant="outline">
                Weakest starter: {weakestSlot.slot.label} — {weakestSlot.starter!.player.name} ({formatRating(weakestSlot.starter!.rating.score)})
              </Badge>
            )}
          </div>
        )}

        <div className="relative aspect-[2/3] w-full max-w-xl self-center rounded-md border bg-green-700/90 dark:bg-green-900">
          {result.slots.map((slotResult) => (
            <SlotCard
              key={slotResult.slot.slotId}
              result={slotResult}
              isSelected={selectedSlotId === slotResult.slot.slotId}
              onSelect={() => setSelectedSlotId(slotResult.slot.slotId)}
            />
          ))}
        </div>
      </div>

      <div className="w-full shrink-0 border-t pt-4 sm:w-72 sm:overflow-auto sm:border-l sm:border-t-0 sm:pt-0 sm:pl-4">
        {selectedSlot ? (
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="font-semibold">
                {selectedSlot.slot.label} — {ROLE_BY_ID.get(selectedSlot.slot.roleId)?.shortLabel ?? selectedSlot.slot.roleId}
              </h3>
              {selectedSlot.starter ? (
                <p className="text-sm text-muted-foreground">
                  Starter: {selectedSlot.starter.player.name} ({formatRating(selectedSlot.starter.rating.score)})
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No eligible player found.</p>
              )}
            </div>
            <div>
              <h4 className="mb-1 text-sm font-semibold text-muted-foreground">Backups</h4>
              {selectedSlot.backups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No backup options available.</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {selectedSlot.backups.map((b) => (
                    <li key={b.player.id} className="flex items-center justify-between text-sm">
                      <span>{b.player.name}</span>
                      <span className="font-mono">{formatRating(b.rating.score)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Click a slot on the pitch to see backup options.</p>
        )}
      </div>
    </div>
  );
}
