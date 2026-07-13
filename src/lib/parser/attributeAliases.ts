import type { AttributeKey } from "@/lib/types";

export type AttributeGroup = "technical" | "mental" | "physical" | "goalkeeping";

export interface AttributeAlias {
  key: AttributeKey;
  group: AttributeGroup;
}

/** Canonical attribute key -> known FM header variants (3-letter abbreviation and/or full word). */
export const ATTRIBUTE_ALIASES: Record<AttributeKey, { group: AttributeGroup; variants: string[] }> = {
  // Technical
  corners: { group: "technical", variants: ["cor", "corners"] },
  crossing: { group: "technical", variants: ["cro", "crossing"] },
  dribbling: { group: "technical", variants: ["dri", "dribbling"] },
  finishing: { group: "technical", variants: ["fin", "finishing"] },
  firstTouch: { group: "technical", variants: ["fir", "first touch"] },
  freeKickTaking: { group: "technical", variants: ["fre", "free kick taking", "free kicks"] },
  heading: { group: "technical", variants: ["hea", "heading"] },
  longShots: { group: "technical", variants: ["lon", "l sh", "long shots"] },
  longThrows: { group: "technical", variants: ["l th", "lth", "long throws"] },
  marking: { group: "technical", variants: ["mar", "marking"] },
  passing: { group: "technical", variants: ["pas", "passing"] },
  penaltyTaking: { group: "technical", variants: ["pen", "penalty taking", "penalties"] },
  tackling: { group: "technical", variants: ["tck", "tackling"] },
  technique: { group: "technical", variants: ["tec", "technique"] },

  // Mental
  aggression: { group: "mental", variants: ["agg", "aggression"] },
  anticipation: { group: "mental", variants: ["ant", "anticipation"] },
  bravery: { group: "mental", variants: ["bra", "bravery"] },
  composure: { group: "mental", variants: ["cmp", "composure"] },
  concentration: { group: "mental", variants: ["cnt", "concentration"] },
  decisions: { group: "mental", variants: ["dec", "decisions"] },
  determination: { group: "mental", variants: ["det", "determination"] },
  flair: { group: "mental", variants: ["fla", "flair"] },
  leadership: { group: "mental", variants: ["ldr", "leadership"] },
  offTheBall: { group: "mental", variants: ["otb", "off the ball"] },
  positioning: { group: "mental", variants: ["pos", "positioning"] },
  teamwork: { group: "mental", variants: ["tea", "teamwork", "team work"] },
  vision: { group: "mental", variants: ["vis", "vision"] },
  workRate: { group: "mental", variants: ["wor", "work rate"] },

  // Physical
  acceleration: { group: "physical", variants: ["acc", "acceleration"] },
  agility: { group: "physical", variants: ["agi", "agility"] },
  balance: { group: "physical", variants: ["bal", "balance"] },
  jumpingReach: { group: "physical", variants: ["jum", "jumping reach", "jumping"] },
  // Note: "nat" is FM's standard abbreviation for Natural Fitness, but some
  // exports/skins also abbreviate Nationality as "Nat" — a genuine header
  // collision. We resolve "nat" to naturalFitness by default and disambiguate
  // by sniffing data-row content in columnMap.ts (numeric -> naturalFitness,
  // text -> nationality); bio aliases below intentionally use the fuller
  // "nation"/"nationality" instead of bare "nat" to avoid the collision when possible.
  naturalFitness: { group: "physical", variants: ["nat", "natural fitness"] },
  pace: { group: "physical", variants: ["pac", "pace"] },
  stamina: { group: "physical", variants: ["sta", "stamina"] },
  strength: { group: "physical", variants: ["str", "strength"] },

  // Goalkeeping
  aerialReach: { group: "goalkeeping", variants: ["aer", "aerial reach"] },
  commandOfArea: { group: "goalkeeping", variants: ["cmd", "command of area"] },
  communication: { group: "goalkeeping", variants: ["com", "communication"] },
  eccentricity: { group: "goalkeeping", variants: ["ecc", "eccentricity"] },
  handling: { group: "goalkeeping", variants: ["han", "handling"] },
  kicking: { group: "goalkeeping", variants: ["kic", "kicking"] },
  oneOnOnes: { group: "goalkeeping", variants: ["one", "one on ones", "1v1", "one-on-ones"] },
  punching: { group: "goalkeeping", variants: ["pun", "punching", "punching (tendency)"] },
  reflexes: { group: "goalkeeping", variants: ["ref", "reflexes"] },
  rushingOut: { group: "goalkeeping", variants: ["tro", "rushing out", "rushing out (tendency)"] },
  throwing: { group: "goalkeeping", variants: ["thr", "throwing"] },
};

export type BioField =
  | "name"
  | "age"
  | "club"
  | "nationality"
  | "positions"
  | "preferredFoot"
  | "transferStatus"
  | "transferValue"
  | "wage";

export const BIO_ALIASES: Record<BioField, string[]> = {
  name: ["name", "player"],
  age: ["age"],
  club: ["club"],
  nationality: ["nation", "nationality", "nat."],
  positions: ["position", "positions", "best pos", "best position"],
  preferredFoot: ["foot", "preferred foot"],
  transferStatus: ["transfer status", "status"],
  transferValue: ["transfer value", "value"],
  wage: ["wage", "wages"],
};

export function normalizeHeader(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ");
}
