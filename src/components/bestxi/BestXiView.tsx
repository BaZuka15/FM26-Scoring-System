"use client";

import { useMemo, useState } from "react";
import { ShieldAlert, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RatingBadge } from "@/components/shared/RatingBadge";
import { PitchMarkings } from "./PitchMarkings";
import { buildBestXi, type SlotResult } from "@/lib/bestxi/buildBestXi";
import { FORMATIONS } from "@/lib/bestxi/formations";
import { ROLE_BY_ID } from "@/lib/rating/roles";
import { usePlayerStore } from "@/lib/store/usePlayerStore";
import { formatRating } from "@/lib/utils/format";

function SlotCard({ result, isSelected, onSelect }: { result: SlotResult; isSelected: boolean; onSelect: () => void }) {
  const { slot, starter, isWeakStarter, isThinDepth } = result;

  return (
    <button
      onClick={onSelect}
      className={`absolute flex w-[5.6rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 rounded-md border bg-card/95 px-1.5 py-1 text-center shadow-md backdrop-blur-sm transition-transform hover:z-10 hover:scale-110 ${
        isSelected ? "border-primary ring-2 ring-primary" : "border-border/80"
      }`}
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
    >
      <span className="font-heading text-[0.6rem] font-medium tracking-widest text-muted-foreground">{slot.label}</span>
      {starter ? (
        <>
          <span className="w-full truncate text-[0.7rem] font-medium">{starter.player.name}</span>
          <RatingBadge rating={starter.rating} />
        </>
      ) : (
        <span className="py-0.5 text-[0.65rem] text-muted-foreground">Empty</span>
      )}
      {(isWeakStarter || isThinDepth) && (
        <div className="absolute -top-1.5 -right-1.5 flex gap-0.5">
          {isWeakStarter && (
            <span title="Weak starter" className="flex size-4 items-center justify-center rounded-full bg-card shadow">
              <TriangleAlert className="size-3" style={{ color: "var(--rating-red)" }} />
            </span>
          )}
          {isThinDepth && (
            <span title="Thin depth behind this slot" className="flex size-4 items-center justify-center rounded-full bg-card shadow">
              <ShieldAlert className="size-3" style={{ color: "var(--rating-amber)" }} />
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
              <SelectValue>{(v: string) => FORMATIONS.find((f) => f.id === v)?.name ?? v}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {FORMATIONS.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="font-mono text-sm text-muted-foreground">
            Total rating: <span className="font-medium text-foreground">{formatRating(result.totalRating)}</span>
          </div>
        </div>

        {(weakestSlot || emptySlots.length > 0) && (
          <div className="flex flex-wrap gap-2 text-sm">
            {emptySlots.length > 0 && (
              <Badge variant="destructive" className="font-normal">
                {emptySlots.length} unfilled slot{emptySlots.length === 1 ? "" : "s"}: {emptySlots.map((s) => s.slot.label).join(", ")}
              </Badge>
            )}
            {weakestSlot && (
              <Badge variant="outline" className="font-normal">
                Weakest starter: {weakestSlot.slot.label} — {weakestSlot.starter!.player.name} ({formatRating(weakestSlot.starter!.rating.score)})
              </Badge>
            )}
          </div>
        )}

        <div className="relative aspect-2/3 w-full max-w-xl self-center overflow-hidden rounded-lg border shadow-inner">
          <PitchMarkings />
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

      <div className="w-full shrink-0 border-t pt-4 sm:w-72 sm:overflow-auto sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
        {selectedSlot ? (
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="font-heading text-base tracking-wide">
                {selectedSlot.slot.label} — {ROLE_BY_ID.get(selectedSlot.slot.roleId)?.shortLabel ?? selectedSlot.slot.roleId}
              </h3>
              {selectedSlot.starter ? (
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{selectedSlot.starter.player.name}</span>
                  <RatingBadge rating={selectedSlot.starter.rating} />
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">No eligible player found.</p>
              )}
            </div>
            <div>
              <h4 className="mb-1 font-heading text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Backups</h4>
              {selectedSlot.backups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No backup options available.</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {selectedSlot.backups.map((b) => (
                    <li key={b.player.id} className="flex items-center justify-between rounded-sm px-1 py-1 text-sm hover:bg-accent/50">
                      <span>{b.player.name}</span>
                      <RatingBadge rating={b.rating} />
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
