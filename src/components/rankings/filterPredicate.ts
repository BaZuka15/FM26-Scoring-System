import type { FilterState } from "@/lib/store/useFilterStore";
import { playerPositionGroups } from "@/lib/utils/positions";
import type { RankingRow } from "./columns";

export function matchesFilters(row: RankingRow, filters: FilterState): boolean {
  const { player, rating } = row;

  if (filters.positionGroup !== "ALL" && !playerPositionGroups(player.positions).includes(filters.positionGroup)) {
    return false;
  }
  if (filters.ageMin !== null && (player.age === null || player.age < filters.ageMin)) return false;
  if (filters.ageMax !== null && (player.age === null || player.age > filters.ageMax)) return false;
  if (filters.clubQuery && !(player.club ?? "").toLowerCase().includes(filters.clubQuery.toLowerCase())) return false;
  if (filters.nationalityQuery && !(player.nationality ?? "").toLowerCase().includes(filters.nationalityQuery.toLowerCase())) return false;
  if (filters.transferStatusQuery && !(player.transferStatus ?? "").toLowerCase().includes(filters.transferStatusQuery.toLowerCase())) return false;
  if (filters.minRating !== null && (!rating || rating.score < filters.minRating)) return false;

  return true;
}
