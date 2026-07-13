import type {
  AttrValue,
  GoalkeepingAttributes,
  MentalAttributes,
  Player,
  PhysicalAttributes,
  PositionToken,
  PreferredFoot,
  TechnicalAttributes,
} from "@/lib/types";
import { buildColumnMap, type ColumnEntry } from "./columnMap";

export interface ParseResult {
  players: Player[];
  unrecognizedHeaders: string[];
}

export class FmParseError extends Error {}

function emptyTechnical(): TechnicalAttributes {
  return {
    corners: null,
    crossing: null,
    dribbling: null,
    finishing: null,
    firstTouch: null,
    freeKickTaking: null,
    heading: null,
    longShots: null,
    longThrows: null,
    marking: null,
    passing: null,
    penaltyTaking: null,
    tackling: null,
    technique: null,
  };
}

function emptyMental(): MentalAttributes {
  return {
    aggression: null,
    anticipation: null,
    bravery: null,
    composure: null,
    concentration: null,
    decisions: null,
    determination: null,
    flair: null,
    leadership: null,
    offTheBall: null,
    positioning: null,
    teamwork: null,
    vision: null,
    workRate: null,
  };
}

function emptyPhysical(): PhysicalAttributes {
  return {
    acceleration: null,
    agility: null,
    balance: null,
    jumpingReach: null,
    naturalFitness: null,
    pace: null,
    stamina: null,
    strength: null,
  };
}

function emptyGoalkeeping(): GoalkeepingAttributes {
  return {
    aerialReach: null,
    commandOfArea: null,
    communication: null,
    eccentricity: null,
    handling: null,
    kicking: null,
    oneOnOnes: null,
    punching: null,
    reflexes: null,
    rushingOut: null,
    throwing: null,
  };
}

/** True for cell text that plausibly represents an FM attribute value: an integer 1-20, a range like "10-14", "-", or empty. */
function looksLikeAttributeValue(raw: string): boolean {
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "-") return true;
  if (/^\d{1,2}$/.test(trimmed)) return true;
  if (/^\d{1,2}\s*-\s*\d{1,2}$/.test(trimmed)) return true;
  return false;
}

function parseAttributeCell(raw: string): { value: AttrValue; range: string | null } {
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "-") return { value: null, range: null };
  const rangeMatch = trimmed.match(/^(\d{1,2})\s*-\s*(\d{1,2})$/);
  if (rangeMatch) {
    const lo = Number(rangeMatch[1]);
    const hi = Number(rangeMatch[2]);
    return { value: Math.round((lo + hi) / 2), range: trimmed };
  }
  const num = Number(trimmed);
  if (Number.isFinite(num)) return { value: num, range: null };
  return { value: null, range: null };
}

function parsePositions(raw: string): PositionToken[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  return trimmed
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      const match = token.match(/^([A-Za-z/]+)(?:\s*\(([A-Za-z]+)\))?$/);
      if (!match) return { group: token, sides: [] };
      const [, group, sidesStr] = match;
      return { group, sides: sidesStr ? sidesStr.split("") : [] };
    });
}

function parseCurrencyToken(token: string): number | null {
  const match = token.match(/([\d.,]+)\s*([KMB])?/i);
  if (!match) return null;
  const num = parseFloat(match[1].replace(/,/g, ""));
  if (!Number.isFinite(num)) return null;
  const suffix = match[2]?.toUpperCase();
  if (suffix === "K") return num * 1_000;
  if (suffix === "M") return num * 1_000_000;
  if (suffix === "B") return num * 1_000_000_000;
  return num;
}

function parseCurrencyRange(raw: string | null): { min: number | null; max: number | null } {
  if (!raw) return { min: null, max: null };
  const parts = raw
    .split("-")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 2) {
    return { min: parseCurrencyToken(parts[0]), max: parseCurrencyToken(parts[1]) };
  }
  const value = parseCurrencyToken(raw);
  return { min: value, max: value };
}

function parsePreferredFoot(raw: string | null): PreferredFoot | null {
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  if (normalized === "left") return "Left";
  if (normalized === "right") return "Right";
  if (normalized === "either" || normalized === "both") return "Either";
  return null;
}

function findDataTable(doc: Document): HTMLTableElement | null {
  const tables = Array.from(doc.querySelectorAll("table"));
  if (tables.length === 0) return null;
  return tables.reduce((best, current) =>
    current.querySelectorAll("tr").length > best.querySelectorAll("tr").length ? current : best,
  );
}

/**
 * "Nat" is FM's abbreviation for Natural Fitness but collides with some
 * exports' Nationality header. Since our alias table resolves bare "nat" to
 * naturalFitness by default, reclassify it as nationality if the first data
 * row's value there doesn't look like an attribute (e.g. a country name)
 * and no other column already claimed the nationality bio field.
 */
function disambiguateNaturalFitnessVsNationality(columns: ColumnEntry[], firstDataRowCells: string[]): ColumnEntry[] {
  const hasNationalityColumn = columns.some((c) => c.kind === "bio" && c.key === "nationality");
  if (hasNationalityColumn) return columns;

  return columns.map((col) => {
    if (col.kind === "attribute" && col.key === "naturalFitness") {
      const cellValue = firstDataRowCells[col.index] ?? "";
      if (!looksLikeAttributeValue(cellValue)) {
        return { index: col.index, kind: "bio", key: "nationality", header: col.header };
      }
    }
    return col;
  });
}

export function parseFmHtml(html: string): ParseResult {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const table = findDataTable(doc);
  if (!table) {
    throw new FmParseError("No table found in the uploaded file. Make sure this is an FM HTML export.");
  }

  const rows = Array.from(table.querySelectorAll("tr"));
  if (rows.length < 2) {
    throw new FmParseError("The table has no data rows. Make sure this is an FM HTML export with players in it.");
  }

  const headerCells = Array.from(rows[0].querySelectorAll("td,th")).map((cell) => cell.textContent?.trim() ?? "");
  const { columns: initialColumns, unrecognizedHeaders } = buildColumnMap(headerCells);

  const dataRows = rows.slice(1).map((row) => Array.from(row.querySelectorAll("td,th")).map((cell) => cell.textContent?.trim() ?? ""));

  if (dataRows.length === 0) {
    throw new FmParseError("The table has no data rows. Make sure this is an FM HTML export with players in it.");
  }

  const columns = disambiguateNaturalFitnessVsNationality(initialColumns, dataRows[0]);
  const presentGroups = new Set(columns.filter((c) => c.kind === "attribute").map((c) => (c as Extract<ColumnEntry, { kind: "attribute" }>).group));

  const players: Player[] = dataRows.map((cells, rowIndex) => {
    const technical = emptyTechnical();
    const mental = emptyMental();
    const physical = emptyPhysical();
    const goalkeeping = emptyGoalkeeping();
    const attributeRanges: Record<string, string> = {};
    const extra: Record<string, string> = {};

    let name = "";
    let age: number | null = null;
    let club: string | null = null;
    let nationality: string | null = null;
    let positions: PositionToken[] = [];
    let preferredFoot: PreferredFoot | null = null;
    let transferStatus: string | null = null;
    let transferValueRaw: string | null = null;
    let wageRaw: string | null = null;

    for (const col of columns) {
      const raw = cells[col.index] ?? "";

      if (col.kind === "unrecognized") {
        if (col.header.trim() && raw.trim()) extra[col.header] = raw;
        continue;
      }

      if (col.kind === "attribute") {
        const { value, range } = parseAttributeCell(raw);
        if (range) attributeRanges[col.key] = range;
        switch (col.group) {
          case "technical":
            technical[col.key as keyof TechnicalAttributes] = value;
            break;
          case "mental":
            mental[col.key as keyof MentalAttributes] = value;
            break;
          case "physical":
            physical[col.key as keyof PhysicalAttributes] = value;
            break;
          case "goalkeeping":
            goalkeeping[col.key as keyof GoalkeepingAttributes] = value;
            break;
        }
        continue;
      }

      // bio
      switch (col.key) {
        case "name":
          name = raw;
          break;
        case "age": {
          const parsedAge = parseInt(raw, 10);
          age = Number.isFinite(parsedAge) ? parsedAge : null;
          break;
        }
        case "club":
          club = raw || null;
          break;
        case "nationality":
          nationality = raw || null;
          break;
        case "positions":
          positions = parsePositions(raw);
          break;
        case "preferredFoot":
          preferredFoot = parsePreferredFoot(raw);
          break;
        case "transferStatus":
          transferStatus = raw || null;
          break;
        case "transferValue":
          transferValueRaw = raw || null;
          break;
        case "wage":
          wageRaw = raw || null;
          break;
      }
    }

    const isGoalkeeper = positions.some((p) => p.group.toUpperCase().includes("GK"));

    return {
      id: `${rowIndex}-${name || "unknown"}`,
      name: name || "Unknown",
      age,
      club,
      nationality,
      positions,
      preferredFoot,
      transferStatus,
      transferValueRaw,
      transferValueNumeric: parseCurrencyRange(transferValueRaw),
      wageRaw,
      wageNumeric: wageRaw ? parseCurrencyToken(wageRaw) : null,
      isGoalkeeper,
      technical: presentGroups.has("technical") ? technical : null,
      mental,
      physical,
      goalkeeping: presentGroups.has("goalkeeping") ? goalkeeping : null,
      attributeRanges,
      extra,
    };
  });

  return { players, unrecognizedHeaders };
}
