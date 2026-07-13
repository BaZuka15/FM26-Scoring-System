"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { RatingBadge } from "@/components/shared/RatingBadge";
import { ROLE_CATALOGUE } from "@/lib/rating/roles";
import { formatCurrency, formatPositions, humanizeKey } from "@/lib/utils/format";
import type { Player, RatingResult } from "@/lib/types";

interface PlayerDetailSheetProps {
  player: Player | null;
  ratings: Record<string, RatingResult> | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AttributeGroup({ title, attrs }: { title: string; attrs: Record<string, number | null> }) {
  const entries = Object.entries(attrs);
  if (entries.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 font-heading text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">{title}</h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between gap-2 border-b border-border/50 py-0.5">
            <span className="text-muted-foreground">{humanizeKey(key)}</span>
            <span className="font-mono font-medium tabular-nums">{value ?? "-"}</span>
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
          <SheetTitle className="font-heading text-2xl tracking-wide">{player.name}</SheetTitle>
          <SheetDescription className="font-mono text-xs tracking-wide uppercase">
            {formatPositions(player.positions)} · {player.age ?? "-"} y/o · {player.club ?? "Unattached"} · {player.nationality ?? "-"}
          </SheetDescription>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
            <span>Value: {formatCurrency(player.transferValueNumeric.min, player.transferValueNumeric.max)}</span>
            {player.transferStatus && <span>· {player.transferStatus}</span>}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 pb-4">
          <div className="flex flex-col gap-5">
            {player.technical && <AttributeGroup title="Technical" attrs={player.technical as unknown as Record<string, number | null>} />}
            <AttributeGroup title="Mental" attrs={player.mental as unknown as Record<string, number | null>} />
            <AttributeGroup title="Physical" attrs={player.physical as unknown as Record<string, number | null>} />
            {player.goalkeeping && <AttributeGroup title="Goalkeeping" attrs={player.goalkeeping as unknown as Record<string, number | null>} />}

            <Separator />

            <div>
              <h4 className="mb-2 font-heading text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Role Ratings</h4>
              <div className="flex flex-col gap-1">
                {sortedRoles.map(({ role, rating }) => (
                  <div key={role!.id} className="flex items-center justify-between gap-2 rounded-sm px-1 py-1 text-sm hover:bg-accent/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[0.65rem]">
                        {role!.positionGroup}
                      </Badge>
                      <span>{role!.shortLabel}</span>
                    </div>
                    <RatingBadge rating={rating} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
