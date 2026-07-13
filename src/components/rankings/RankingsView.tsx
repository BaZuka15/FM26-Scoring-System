"use client";

import { useMemo, useRef, useState } from "react";
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlayerDetailSheet } from "@/components/player/PlayerDetailSheet";
import { RoleSelect } from "@/components/shared/RoleSelect";
import { getBestRating } from "@/lib/rating/computeRating";
import { ROLE_BY_ID } from "@/lib/rating/roles";
import { usePlayerStore } from "@/lib/store/usePlayerStore";
import { useFilterStore } from "@/lib/store/useFilterStore";
import { FilterPanel, MobileFilterButton } from "./FilterPanel";
import { matchesFilters } from "./filterPredicate";
import { getRankingColumns, type RankingRow } from "./columns";

const BEST_ROLE_VALUE = "__best__";
const ROW_HEIGHT = 40;

export function RankingsView() {
  const players = usePlayerStore((s) => s.players);
  const ratings = usePlayerStore((s) => s.ratings);
  const filters = useFilterStore();
  const [selectedRoleId, setSelectedRoleId] = useState<string>(BEST_ROLE_VALUE);
  const [sorting, setSorting] = useState<SortingState>([{ id: "rating", desc: true }]);
  const [detailPlayerId, setDetailPlayerId] = useState<string | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const selectedRole = selectedRoleId === BEST_ROLE_VALUE ? null : (ROLE_BY_ID.get(selectedRoleId) ?? null);

  const rows: RankingRow[] = useMemo(() => {
    const allRows = players.map((player) => {
      const perRole = ratings[player.id];
      const best = getBestRating(perRole);
      const bestRole = best ? (ROLE_BY_ID.get(best.roleId) ?? null) : null;
      const rating = selectedRole ? (perRole?.[selectedRole.id] ?? null) : best;
      return { player, rating, best, bestRole };
    });
    return allRows.filter((row) => matchesFilters(row, filters));
  }, [players, ratings, selectedRole, filters]);

  const columns = useMemo(() => getRankingColumns(selectedRole ? selectedRole.shortLabel : "Best Role Rating"), [selectedRole]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const tableRows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1].end : 0;

  return (
    <div className="flex h-full">
      <FilterPanel />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              {rows.length} of {players.length} players
            </h2>
            <MobileFilterButton />
          </div>
          <RoleSelect
            value={selectedRoleId}
            onChange={setSelectedRoleId}
            className="w-64"
            extraOption={{ value: BEST_ROLE_VALUE, label: "Best Role (any)" }}
          />
        </div>

        <div ref={parentRef} className="flex-1 overflow-auto rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? ""}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {paddingTop > 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} style={{ height: paddingTop, padding: 0 }} />
                </TableRow>
              )}
              {virtualRows.map((virtualRow) => {
                const row = tableRows[virtualRow.index];
                return (
                  <TableRow
                    key={row.id}
                    style={{ height: ROW_HEIGHT }}
                    className="cursor-pointer"
                    onClick={() => setDetailPlayerId(row.original.player.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                );
              })}
              {paddingBottom > 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} style={{ height: paddingBottom, padding: 0 }} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <PlayerDetailSheet
        player={players.find((p) => p.id === detailPlayerId) ?? null}
        ratings={detailPlayerId ? ratings[detailPlayerId] : undefined}
        open={detailPlayerId !== null}
        onOpenChange={(open) => !open && setDetailPlayerId(null)}
      />
    </div>
  );
}
