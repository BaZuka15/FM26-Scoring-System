"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RatingBadge } from "@/components/shared/RatingBadge";
import { useSelectionStore } from "@/lib/store/useSelectionStore";
import { formatCurrency, formatPositions } from "@/lib/utils/format";
import type { Player, RatingResult, RoleDefinition } from "@/lib/types";

export interface RankingRow {
  player: Player;
  rating: RatingResult | null;
  best: RatingResult | null;
  bestRole: RoleDefinition | null;
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
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.player.name}</span>,
    },
    {
      id: "positions",
      header: "Position",
      accessorFn: (row) => formatPositions(row.player.positions),
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{formatPositions(row.original.player.positions)}</span>,
    },
    {
      id: "age",
      header: "Age",
      accessorFn: (row) => row.player.age ?? "-",
      cell: ({ row }) => <span className="font-mono tabular-nums">{row.original.player.age ?? "-"}</span>,
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
      cell: ({ row }) => (
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {formatCurrency(row.original.player.transferValueNumeric.min, row.original.player.transferValueNumeric.max)}
        </span>
      ),
    },
    {
      id: "rating",
      header: selectedRoleLabel,
      accessorFn: (row) => row.rating?.score ?? -1,
      cell: ({ row }) => <RatingBadge rating={row.original.rating} />,
    },
    {
      id: "bestRole",
      header: "Best Role",
      accessorFn: (row) => row.best?.score ?? -1,
      cell: ({ row }) =>
        row.original.bestRole && row.original.best ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-heading text-[0.7rem] font-medium tracking-wide">
              {row.original.bestRole.shortLabel}
            </Badge>
            <RatingBadge rating={row.original.best} />
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
  ];
}
