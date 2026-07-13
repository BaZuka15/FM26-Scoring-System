// FM attributes are 1-20 integers. Exports can show a range ("10-14") for an
// unscouted attribute, or "-" for a fully unknown one. Both collapse to a
// plain number|null for rating math; the raw string is preserved separately
// for display (see Player.attributeRanges).
export type AttrValue = number | null;

export interface TechnicalAttributes {
  corners: AttrValue;
  crossing: AttrValue;
  dribbling: AttrValue;
  finishing: AttrValue;
  firstTouch: AttrValue;
  freeKickTaking: AttrValue;
  heading: AttrValue;
  longShots: AttrValue;
  longThrows: AttrValue;
  marking: AttrValue;
  passing: AttrValue;
  penaltyTaking: AttrValue;
  tackling: AttrValue;
  technique: AttrValue;
}

export interface MentalAttributes {
  aggression: AttrValue;
  anticipation: AttrValue;
  bravery: AttrValue;
  composure: AttrValue;
  concentration: AttrValue;
  decisions: AttrValue;
  determination: AttrValue;
  flair: AttrValue;
  leadership: AttrValue;
  offTheBall: AttrValue;
  positioning: AttrValue;
  teamwork: AttrValue;
  vision: AttrValue;
  workRate: AttrValue;
}

export interface PhysicalAttributes {
  acceleration: AttrValue;
  agility: AttrValue;
  balance: AttrValue;
  jumpingReach: AttrValue;
  naturalFitness: AttrValue;
  pace: AttrValue;
  stamina: AttrValue;
  strength: AttrValue;
}

// FM gives goalkeepers the same Technical group as outfield players (Passing,
// First Touch, Technique, etc. all apply) plus these 11 GK-exclusive
// attributes — there is no separate "GK passing", so no key here overlaps
// with TechnicalAttributes and AttributeKey stays a flat, unambiguous union.
export interface GoalkeepingAttributes {
  aerialReach: AttrValue;
  commandOfArea: AttrValue;
  communication: AttrValue;
  eccentricity: AttrValue;
  handling: AttrValue;
  kicking: AttrValue;
  oneOnOnes: AttrValue;
  punching: AttrValue;
  reflexes: AttrValue;
  rushingOut: AttrValue;
  throwing: AttrValue;
}

export type PreferredFoot = "Left" | "Right" | "Either";

export interface PositionToken {
  /** Raw group as it appears in FM, e.g. "D", "WB", "M", "AM", "ST", "GK". */
  group: string;
  /** Side letters, e.g. ["R","C"] for "(RC)". Empty for positions with no side (GK, ST). */
  sides: string[];
}

export interface Player {
  id: string;
  name: string;
  age: number | null;
  club: string | null;
  nationality: string | null;
  positions: PositionToken[];
  preferredFoot: PreferredFoot | null;
  transferStatus: string | null;
  transferValueRaw: string | null;
  transferValueNumeric: { min: number | null; max: number | null };
  wageRaw: string | null;
  wageNumeric: number | null;
  isGoalkeeper: boolean;
  /** Null only if the export's column set omitted the whole Technical group (not tied to GK status — GKs have Technical attributes too). */
  technical: TechnicalAttributes | null;
  mental: MentalAttributes;
  physical: PhysicalAttributes;
  /** Null when the player isn't a goalkeeper, or the export omitted the Goalkeeping group entirely. */
  goalkeeping: GoalkeepingAttributes | null;
  /** Raw range strings for attributes exported as e.g. "10-14", keyed by canonical attribute key. */
  attributeRanges: Record<string, string>;
  /** Any export column that isn't a recognized attribute or bio field, keyed by its raw header text. */
  extra: Record<string, string>;
}

export type PositionGroup =
  | "GK"
  | "DC"
  | "DL"
  | "DR"
  | "WBL"
  | "WBR"
  | "DM"
  | "ML"
  | "MC"
  | "MR"
  | "AML"
  | "AMC"
  | "AMR"
  | "ST";

export type Duty = "Defend" | "Support" | "Attack" | "Automatic" | "Stopper" | "Cover";

export interface RoleDefinition {
  id: string;
  positionGroup: PositionGroup;
  roleName: string;
  duty: Duty;
  shortLabel: string;
  isGoalkeeperRole: boolean;
}

export type AttributeKey =
  | keyof TechnicalAttributes
  | keyof MentalAttributes
  | keyof PhysicalAttributes
  | keyof GoalkeepingAttributes;

export interface RoleWeights {
  roleId: string;
  weights: Partial<Record<AttributeKey, number>>;
}

export interface RatingResult {
  playerId: string;
  roleId: string;
  /** Weighted-mean score on FM's natural 1-20 scale, one decimal place. */
  score: number;
  /** True when >~40% of the role's weighted attributes were missing for this player. */
  isEstimate: boolean;
}
