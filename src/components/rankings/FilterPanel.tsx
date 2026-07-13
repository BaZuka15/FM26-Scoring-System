"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { POSITION_GROUP_ORDER } from "@/lib/rating/roles";
import { isFilterActive, useFilterStore } from "@/lib/store/useFilterStore";
import type { PositionGroup } from "@/lib/types";

function toNullableNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function FilterFields() {
  const filters = useFilterStore();

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-position">Position</Label>
        <Select value={filters.positionGroup} onValueChange={(value) => filters.setFilter("positionGroup", value as PositionGroup | "ALL")}>
          <SelectTrigger id="filter-position" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All positions</SelectItem>
            {POSITION_GROUP_ORDER.map((group) => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Age</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.ageMin ?? ""}
            onChange={(e) => filters.setFilter("ageMin", toNullableNumber(e.target.value))}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.ageMax ?? ""}
            onChange={(e) => filters.setFilter("ageMax", toNullableNumber(e.target.value))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-club">Club</Label>
        <Input id="filter-club" placeholder="Any club" value={filters.clubQuery} onChange={(e) => filters.setFilter("clubQuery", e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-nation">Nationality</Label>
        <Input
          id="filter-nation"
          placeholder="Any nationality"
          value={filters.nationalityQuery}
          onChange={(e) => filters.setFilter("nationalityQuery", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-status">Transfer status</Label>
        <Input
          id="filter-status"
          placeholder="e.g. Available, Loan"
          value={filters.transferStatusQuery}
          onChange={(e) => filters.setFilter("transferStatusQuery", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-rating">Min rating</Label>
        <Input
          id="filter-rating"
          type="number"
          step="0.1"
          placeholder="e.g. 12"
          value={filters.minRating ?? ""}
          onChange={(e) => filters.setFilter("minRating", toNullableNumber(e.target.value))}
        />
      </div>
    </>
  );
}

/** Persistent sidebar on wider screens (sm and up). */
export function FilterPanel() {
  const filters = useFilterStore();

  return (
    <div className="hidden w-64 shrink-0 flex-col gap-4 border-r p-4 sm:flex">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {isFilterActive(filters) && (
          <Button variant="ghost" size="sm" onClick={() => filters.resetFilters()}>
            Clear
          </Button>
        )}
      </div>
      <FilterFields />
    </div>
  );
}

/** Slide-over sheet on narrow screens, opened via a "Filters" button. */
export function MobileFilterButton() {
  const filters = useFilterStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Filters{isFilterActive(filters) ? " •" : ""}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-full sm:max-w-xs">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 overflow-auto px-4 pb-4">
            <FilterFields />
            {isFilterActive(filters) && (
              <Button variant="outline" size="sm" onClick={() => filters.resetFilters()}>
                Clear filters
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
