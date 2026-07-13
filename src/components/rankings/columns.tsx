"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getRatingBand } from "@/lib/rating/bands";
import { useSelectionStore } from "@/lib/store/useSelectionStore";
import { formatCurrency, formatPositions, formatRating } from "@/lib/utils/format";
import type { Player, RatingResult, RoleDefinition } from "@/lib/types";

export interface RankingRow {
  player: Player;
  rating: RatingResult | null;
  best: RatingResult | null;
  bestRole: RoleDefinition | null;
}

const BAND_CLASSES: Record<string, string> = {
  green: "text-green-600 dark:text-green-400",
  amber: "text-amber-600 dark:text-amber-400",
  red: "text-red-600 dark:text-red-400",
};

function RatingCell({ rating }: { rating: RatingResult | null }) {
  if (!rating) return <span className="text-muted-foreground">-</span>;
  const band = getRatingBand(rating.score);
  return (
    <span className={`font-mono font-medium ${BAND_CLASSES[band]}`}>
      {formatRating(rating.score)}
      {rating.isEstimate && <span title="Based on partial/unscouted data">*</span>}
    </span>
  );
}

function SelectCheckbox({ playerId }: { playerId: string }) {
  const isSelected = useSelectionStore((s) => s.selectedIds.includes(playerId));
  const toggle = useSelectionStore((s) => s.toggle);
  return (
    <Checkbox
      checked={isSelected}
      onCheckedChange={() => toggle(playerId)}
      onClick={(e) => e.stopPropagation()}
      aria-label="Select for comparison"
    />
  );
}

export function getRankingColumns(selectedRoleLabel: string): ColumnDef<RankingRow>[] {
  return [
    {
      id: "select",
      header: "",
      enableSorting: false,
      cell: ({ row }) => <SelectCheckbox playerId={row.original.player.id} />,
    },
    {
      id: "name",
      header: "Name",
      accessorFn: (row) => row.player.name,
      cell: ({ row }) => <span className="font-medium">{row.original.player.name}</span>,
    },
    {
      id: "positions",
      header: "Position",
      accessorFn: (row) => formatPositions(row.player.positions),
    },
    {
      id: "age",
      header: "Age",
      accessorFn: (row) => row.player.age ?? "-",
    },
    {
      id: "club",
      header: "Club",
      accessorFn: (row) => row.player.club ?? "-",
    },
    {
      id: "nationality",
      header: "Nation",
      accessorFn: (row) => row.player.nationality ?? "-",
    },
    {
      id: "transferValue",
      header: "Value",
      accessorFn: (row) => row.player.transferValueNumeric.max ?? row.player.transferValueNumeric.min ?? -1,
      cell: ({ row }) => formatCurrency(row.original.player.transferValueNumeric.min, row.original.player.transferValueNumeric.max),
    },
    {
      id: "rating",
      header: selectedRoleLabel,
      accessorFn: (row) => row.rating?.score ?? -1,
      cell: ({ row }) => <RatingCell rating={row.original.rating} />,
    },
    {
      id: "bestRole",
      header: "Best Role",
      accessorFn: (row) => row.best?.score ?? -1,
      cell: ({ row }) =>
        row.original.bestRole && row.original.best ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{row.original.bestRole.shortLabel}</Badge>
            <RatingCell rating={row.original.best} />
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
  ];
}
