"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { POSITION_GROUP_ORDER, ROLE_BY_ID, ROLE_CATALOGUE } from "@/lib/rating/roles";
import type { PositionGroup, RoleDefinition } from "@/lib/types";

function groupRolesByPosition(roles: RoleDefinition[]): Map<PositionGroup, RoleDefinition[]> {
  const map = new Map<PositionGroup, RoleDefinition[]>();
  for (const role of roles) {
    if (!map.has(role.positionGroup)) map.set(role.positionGroup, []);
    map.get(role.positionGroup)!.push(role);
  }
  return map;
}

const ROLES_BY_GROUP = groupRolesByPosition(ROLE_CATALOGUE);

interface RoleSelectProps {
  value: string;
  onChange: (roleId: string) => void;
  className?: string;
  extraOption?: { value: string; label: string };
}

export function RoleSelect({ value, onChange, className, extraOption }: RoleSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as string)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select role...">
          {(v: string) => (extraOption && v === extraOption.value ? extraOption.label : (ROLE_BY_ID.get(v)?.shortLabel ?? "Select role..."))}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {extraOption && <SelectItem value={extraOption.value}>{extraOption.label}</SelectItem>}
        {POSITION_GROUP_ORDER.map((group) => {
          const groupRoles = ROLES_BY_GROUP.get(group);
          if (!groupRoles || groupRoles.length === 0) return null;
          return (
            <SelectGroup key={group}>
              <SelectLabel>{group}</SelectLabel>
              {groupRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.shortLabel}
                </SelectItem>
              ))}
            </SelectGroup>
          );
        })}
      </SelectContent>
    </Select>
  );
}
