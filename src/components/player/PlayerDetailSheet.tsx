"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getRatingBand } from "@/lib/rating/bands";
import { ROLE_CATALOGUE } from "@/lib/rating/roles";
import { formatCurrency, formatPositions, formatRating, humanizeKey } from "@/lib/utils/format";
import type { Player, RatingResult } from "@/lib/types";

interface PlayerDetailSheetProps {
  player: Player | null;
  ratings: Record<string, RatingResult> | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BAND_CLASSES: Record<string, string> = {
  green: "text-green-600 dark:text-green-400",
  amber: "text-amber-600 dark:text-amber-400",
  red: "text-red-600 dark:text-red-400",
};

function AttributeGroup({ title, attrs }: { title: string; attrs: Record<string, number | null> }) {
  const entries = Object.entries(attrs);
  if (entries.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-muted-foreground">{title}</h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{humanizeKey(key)}</span>
            <span className="font-mono">{value ?? "-"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlayerDetailSheet({ player, ratings, open, onOpenChange }: PlayerDetailSheetProps) {
  const sortedRoles = useMemo(() => {
    if (!ratings) return [];
    return Object.entries(ratings)
      .map(([roleId, rating]) => ({ role: ROLE_CATALOGUE.find((r) => r.id === roleId), rating }))
      .filter((r) => r.role)
      .sort((a, b) => b.rating.score - a.rating.score);
  }, [ratings]);

  if (!player) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{player.name}</SheetTitle>
          <SheetDescription>
            {formatPositions(player.positions)} · {player.age ?? "-"} y/o · {player.club ?? "Unattached"} · {player.nationality ?? "-"}
          </SheetDescription>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
            <span>Value: {formatCurrency(player.transferValueNumeric.min, player.transferValueNumeric.max)}</span>
            {player.transferStatus && <span>· {player.transferStatus}</span>}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 pb-4">
          <div className="flex flex-col gap-4">
            {player.technical && <AttributeGroup title="Technical" attrs={player.technical as unknown as Record<string, number | null>} />}
            <AttributeGroup title="Mental" attrs={player.mental as unknown as Record<string, number | null>} />
            <AttributeGroup title="Physical" attrs={player.physical as unknown as Record<string, number | null>} />
            {player.goalkeeping && <AttributeGroup title="Goalkeeping" attrs={player.goalkeeping as unknown as Record<string, number | null>} />}

            <Separator />

            <div>
              <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Role Ratings</h4>
              <div className="flex flex-col gap-1">
                {sortedRoles.map(({ role, rating }) => {
                  const band = getRatingBand(rating.score);
                  return (
                    <div key={role!.id} className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{role!.positionGroup}</Badge>
                        <span>{role!.shortLabel}</span>
                      </div>
                      <span className={`font-mono font-medium ${BAND_CLASSES[band]}`}>
                        {formatRating(rating.score)}
                        {rating.isEstimate && <span title="Based on partial/unscouted data">*</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
