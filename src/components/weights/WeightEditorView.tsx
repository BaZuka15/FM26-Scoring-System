"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RoleSelect } from "@/components/shared/RoleSelect";
import { ROLE_CATALOGUE } from "@/lib/rating/roles";
import { ROLE_WEIGHTS } from "@/lib/rating/roleWeights";
import { buildEffectiveWeights } from "@/lib/rating/computeRating";
import { usePlayerStore } from "@/lib/store/usePlayerStore";
import { useWeightsStore } from "@/lib/store/useWeightsStore";
import { humanizeKey } from "@/lib/utils/format";
import type { AttributeKey } from "@/lib/types";

const MIN_WEIGHT = 0;
const MAX_WEIGHT = 5;

export function WeightEditorView() {
  const [roleId, setRoleId] = useState(ROLE_CATALOGUE[0].id);
  const overrides = useWeightsStore((s) => s.overrides);
  const setWeight = useWeightsStore((s) => s.setWeight);
  const resetRole = useWeightsStore((s) => s.resetRole);
  const status = usePlayerStore((s) => s.status);
  const recomputeRatings = usePlayerStore((s) => s.recomputeRatings);

  // Any override change (any role) recomputes ratings so Rankings/Best XI stay in sync.
  useEffect(() => {
    if (status !== "loaded") return;
    recomputeRatings(buildEffectiveWeights(ROLE_WEIGHTS, overrides));
  }, [overrides, status, recomputeRatings]);

  const role = ROLE_CATALOGUE.find((r) => r.id === roleId)!;
  const defaultWeights = ROLE_WEIGHTS[roleId]?.weights ?? {};
  const roleOverrides = overrides[roleId] ?? {};
  const hasOverrides = Object.keys(roleOverrides).length > 0;
  const attributeKeys = Object.keys(defaultWeights) as AttributeKey[];

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RoleSelect value={roleId} onChange={setRoleId} className="w-64" />
          <span className="text-sm text-muted-foreground">{role.shortLabel}</span>
        </div>
        {hasOverrides && (
          <Button variant="outline" size="sm" onClick={() => resetRole(roleId)}>
            Reset to defaults
          </Button>
        )}
      </div>

      <p className="max-w-2xl text-sm text-muted-foreground">
        Adjust how much each attribute counts toward this role&apos;s rating. Changes apply immediately across Rankings, Comparison, and Best
        XI, and are saved in this browser.
      </p>

      <div className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {attributeKeys.map((key) => {
          const defaultValue = defaultWeights[key] ?? 0;
          const value = roleOverrides[key] ?? defaultValue;
          const isOverridden = roleOverrides[key] !== undefined && roleOverrides[key] !== defaultValue;
          return (
            <div key={key} className="flex flex-col gap-1.5 rounded-md border p-3">
              <div className="flex items-center justify-between text-sm">
                <span className={isOverridden ? "font-medium text-primary" : ""}>{humanizeKey(key)}</span>
                <Input
                  type="number"
                  min={MIN_WEIGHT}
                  max={MAX_WEIGHT}
                  step={0.5}
                  value={value}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    if (Number.isFinite(num)) setWeight(roleId, key, Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, num)));
                  }}
                  className="h-7 w-16 text-right"
                />
              </div>
              <Slider
                value={[value]}
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                step={0.5}
                onValueChange={(v) => setWeight(roleId, key, Array.isArray(v) ? v[0] : v)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
