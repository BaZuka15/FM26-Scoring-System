"use client";

import { Fragment, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBestRating } from "@/lib/rating/computeRating";
import { ROLE_CATALOGUE } from "@/lib/rating/roles";
import { usePlayerStore } from "@/lib/store/usePlayerStore";
import { useSelectionStore } from "@/lib/store/useSelectionStore";
import { formatCurrency, formatPositions, formatRating, humanizeKey } from "@/lib/utils/format";
import type { Player } from "@/lib/types";

interface AttrRow {
  label: string;
  values: (number | null)[];
}

type AttributeGroupValue = Record<string, number | null>;

// TechnicalAttributes/MentalAttributes/etc. have no index signature, so callers
// pass a small cast at the call site — safe since every field on those types is a number|null.
function buildAttrRows(players: Player[], getGroup: (p: Player) => AttributeGroupValue | null): AttrRow[] {
  const sample = players.map(getGroup).find((g): g is AttributeGroupValue => g !== null);
  if (!sample) return [];
  return Object.keys(sample).map((key) => ({
    label: humanizeKey(key),
    values: players.map((p) => getGroup(p)?.[key] ?? null),
  }));
}

function bestValueIndex(values: (number | null)[]): number | null {
  let bestIdx: number | null = null;
  let bestVal = -Infinity;
  values.forEach((v, i) => {
    if (v !== null && v > bestVal) {
      bestVal = v;
      bestIdx = i;
    }
  });
  return bestIdx;
}

export function ComparisonView() {
  const players = usePlayerStore((s) => s.players);
  const ratings = usePlayerStore((s) => s.ratings);
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const toggle = useSelectionStore((s) => s.toggle);
  const clear = useSelectionStore((s) => s.clear);

  const selectedPlayers = useMemo(() => players.filter((p) => selectedIds.includes(p.id)), [players, selectedIds]);

  const technicalRows = useMemo(
    () => buildAttrRows(selectedPlayers, (p) => p.technical as unknown as AttributeGroupValue | null),
    [selectedPlayers],
  );
  const mentalRows = useMemo(() => buildAttrRows(selectedPlayers, (p) => p.mental as unknown as AttributeGroupValue), [selectedPlayers]);
  const physicalRows = useMemo(() => buildAttrRows(selectedPlayers, (p) => p.physical as unknown as AttributeGroupValue), [selectedPlayers]);
  const goalkeepingRows = useMemo(
    () => buildAttrRows(selectedPlayers, (p) => p.goalkeeping as unknown as AttributeGroupValue | null),
    [selectedPlayers],
  );

  if (selectedPlayers.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-muted-foreground">
        <p>Select players from Rankings (checkbox column) to compare them side by side.</p>
      </div>
    );
  }

  const sections: { title: string; rows: AttrRow[] }[] = [
    { title: "Technical", rows: technicalRows },
    { title: "Mental", rows: mentalRows },
    { title: "Physical", rows: physicalRows },
    { title: "Goalkeeping", rows: goalkeepingRows },
  ].filter((s) => s.rows.some((row) => row.values.some((v) => v !== null)));

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Comparing {selectedPlayers.length} players</h2>
        <Button variant="outline" size="sm" onClick={clear}>
          Clear selection
        </Button>
      </div>

      <div className="flex-1 overflow-auto rounded-md border">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-background">
            <tr>
              <th className="sticky left-0 z-20 min-w-32 bg-background p-2 text-left"></th>
              {selectedPlayers.map((player) => (
                <th key={player.id} className="min-w-40 border-l p-2 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{player.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => toggle(player.id)}>
                      ✕
                    </Button>
                  </div>
                  <div className="text-xs font-normal text-muted-foreground">{formatPositions(player.positions)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t bg-muted/30">
              <td className="sticky left-0 z-10 bg-muted/30 p-2 font-medium">Age</td>
              {selectedPlayers.map((p) => (
                <td key={p.id} className="border-l p-2">
                  {p.age ?? "-"}
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="sticky left-0 z-10 bg-background p-2 font-medium">Club</td>
              {selectedPlayers.map((p) => (
                <td key={p.id} className="border-l p-2">
                  {p.club ?? "-"}
                </td>
              ))}
            </tr>
            <tr className="border-t bg-muted/30">
              <td className="sticky left-0 z-10 bg-muted/30 p-2 font-medium">Value</td>
              {selectedPlayers.map((p) => (
                <td key={p.id} className="border-l p-2">
                  {formatCurrency(p.transferValueNumeric.min, p.transferValueNumeric.max)}
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="sticky left-0 z-10 bg-background p-2 font-medium">Best Role</td>
              {selectedPlayers.map((p) => {
                const best = getBestRating(ratings[p.id]);
                const bestRole = best ? ROLE_CATALOGUE.find((r) => r.id === best.roleId) : null;
                return (
                  <td key={p.id} className="border-l p-2">
                    {bestRole && best ? (
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary">{bestRole.shortLabel}</Badge>
                        <span className="font-mono">{formatRating(best.score)}</span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                );
              })}
            </tr>

            {sections.map((section) => (
              <Fragment key={section.title}>
                <tr className="border-t bg-muted/60">
                  <td colSpan={selectedPlayers.length + 1} className="sticky left-0 p-2 text-xs font-semibold uppercase text-muted-foreground">
                    {section.title}
                  </td>
                </tr>
                {section.rows.map((row) => {
                  const bestIdx = bestValueIndex(row.values);
                  return (
                    <tr key={`${section.title}-${row.label}`} className="border-t">
                      <td className="sticky left-0 z-10 bg-background p-2 text-muted-foreground">{row.label}</td>
                      {row.values.map((value, i) => (
                        <td key={i} className={`border-l p-2 font-mono ${i === bestIdx ? "font-bold text-green-600 dark:text-green-400" : ""}`}>
                          {value ?? "-"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
