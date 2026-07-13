import type { AttributeKey, Duty, PositionGroup, RoleDefinition, RoleWeights } from "@/lib/types";

interface RoleTemplate {
  templateId: string;
  roleName: string;
  duty: Duty;
  /** Every position group this role/duty combo applies to — e.g. a Full-Back template lists both DL and DR so its weight map is authored once and reused for both sides. */
  positionGroups: PositionGroup[];
  isGoalkeeperRole?: boolean;
  weights: Partial<Record<AttributeKey, number>>;
}

const DUTY_ABBREV: Record<Duty, string> = {
  Defend: "D",
  Support: "S",
  Attack: "A",
  Automatic: "Au",
  Stopper: "St",
  Cover: "Cv",
};

// Weights are on an arbitrary 1-5 relative scale (5 = defines the role, 1 = minor factor).
// Only relative magnitude matters for the weighted-mean rating formula.
const ROLE_TEMPLATES: RoleTemplate[] = [
  // --- Goalkeeper ---
  {
    templateId: "gk-d",
    roleName: "Goalkeeper",
    duty: "Defend",
    positionGroups: ["GK"],
    isGoalkeeperRole: true,
    weights: {
      reflexes: 5, handling: 5, oneOnOnes: 4, aerialReach: 4, commandOfArea: 4, communication: 3,
      concentration: 4, decisions: 4, positioning: 5, anticipation: 4, composure: 3,
      kicking: 2, throwing: 2, agility: 3, balance: 2, naturalFitness: 2,
    },
  },
  {
    templateId: "sk-d",
    roleName: "Sweeper Keeper",
    duty: "Defend",
    positionGroups: ["GK"],
    isGoalkeeperRole: true,
    weights: {
      reflexes: 5, handling: 5, oneOnOnes: 4, aerialReach: 3, commandOfArea: 4, communication: 3,
      rushingOut: 4, anticipation: 4, concentration: 4, decisions: 4, positioning: 5, composure: 3,
      kicking: 3, throwing: 2, passing: 2, agility: 3, pace: 3, acceleration: 3,
    },
  },
  {
    templateId: "sk-s",
    roleName: "Sweeper Keeper",
    duty: "Support",
    positionGroups: ["GK"],
    isGoalkeeperRole: true,
    weights: {
      reflexes: 5, handling: 5, oneOnOnes: 4, aerialReach: 3, commandOfArea: 3, communication: 3,
      rushingOut: 5, anticipation: 4, concentration: 4, decisions: 4, positioning: 4, composure: 4,
      kicking: 4, throwing: 2, passing: 3, agility: 3, pace: 4, acceleration: 4,
    },
  },
  {
    templateId: "sk-a",
    roleName: "Sweeper Keeper",
    duty: "Attack",
    positionGroups: ["GK"],
    isGoalkeeperRole: true,
    weights: {
      reflexes: 5, handling: 5, oneOnOnes: 4, aerialReach: 3, commandOfArea: 3, communication: 3,
      rushingOut: 5, anticipation: 4, concentration: 3, decisions: 5, positioning: 4, composure: 4,
      kicking: 5, throwing: 3, passing: 5, vision: 3, agility: 3, pace: 4, acceleration: 4,
    },
  },

  // --- Centre Back ---
  {
    templateId: "cd-d",
    roleName: "Central Defender",
    duty: "Defend",
    positionGroups: ["DC"],
    weights: {
      marking: 5, tackling: 5, positioning: 5, heading: 4, concentration: 5, anticipation: 4,
      composure: 3, decisions: 3, bravery: 3, aggression: 2, strength: 4, jumpingReach: 4,
      pace: 3, acceleration: 2, agility: 2, balance: 2, teamwork: 3,
    },
  },
  {
    templateId: "cd-st",
    roleName: "Central Defender",
    duty: "Stopper",
    positionGroups: ["DC"],
    weights: {
      tackling: 5, marking: 4, positioning: 4, heading: 4, aggression: 4, bravery: 4,
      concentration: 4, anticipation: 4, decisions: 3, composure: 3, strength: 4, jumpingReach: 4,
      pace: 3, acceleration: 3,
    },
  },
  {
    templateId: "cd-cv",
    roleName: "Central Defender",
    duty: "Cover",
    positionGroups: ["DC"],
    weights: {
      marking: 5, tackling: 4, positioning: 5, anticipation: 5, concentration: 5, decisions: 4,
      composure: 4, pace: 4, acceleration: 3, heading: 3, strength: 3, jumpingReach: 3, teamwork: 3,
    },
  },
  {
    templateId: "bpd-d",
    roleName: "Ball-Playing Defender",
    duty: "Defend",
    positionGroups: ["DC"],
    weights: {
      marking: 5, tackling: 4, positioning: 5, concentration: 4, anticipation: 4, composure: 4,
      decisions: 4, passing: 4, technique: 3, vision: 3, firstTouch: 3, heading: 3, strength: 3,
      jumpingReach: 3, bravery: 3, pace: 3,
    },
  },
  {
    templateId: "bpd-cv",
    roleName: "Ball-Playing Defender",
    duty: "Cover",
    positionGroups: ["DC"],
    weights: {
      marking: 4, tackling: 3, positioning: 5, anticipation: 5, concentration: 4, composure: 4,
      decisions: 4, passing: 4, technique: 3, vision: 3, firstTouch: 3, pace: 4, acceleration: 3,
    },
  },
  {
    templateId: "nncb-d",
    roleName: "No-Nonsense Centre-Back",
    duty: "Defend",
    positionGroups: ["DC"],
    weights: {
      marking: 5, tackling: 5, positioning: 5, heading: 5, concentration: 4, anticipation: 3,
      bravery: 4, aggression: 3, strength: 5, jumpingReach: 4, decisions: 2, composure: 2,
    },
  },
  {
    templateId: "lib-s",
    roleName: "Libero",
    duty: "Support",
    positionGroups: ["DC"],
    weights: {
      marking: 4, tackling: 4, positioning: 4, anticipation: 4, concentration: 4, composure: 4,
      decisions: 4, passing: 4, technique: 3, vision: 3, firstTouch: 3, pace: 4, acceleration: 3,
      stamina: 3, teamwork: 3,
    },
  },
  {
    templateId: "lib-a",
    roleName: "Libero",
    duty: "Attack",
    positionGroups: ["DC"],
    weights: {
      marking: 3, tackling: 3, positioning: 4, anticipation: 4, composure: 4, decisions: 4,
      passing: 4, technique: 4, vision: 4, firstTouch: 4, dribbling: 3, pace: 4, acceleration: 4,
      stamina: 4, offTheBall: 2,
    },
  },

  // --- Full-Back / Wing-Back (shared across both flanks) ---
  {
    templateId: "fb-d",
    roleName: "Full-Back",
    duty: "Defend",
    positionGroups: ["DL", "DR"],
    weights: {
      marking: 4, tackling: 5, positioning: 4, concentration: 4, anticipation: 3, composure: 2,
      decisions: 3, crossing: 2, dribbling: 2, strength: 2, stamina: 3, pace: 3, acceleration: 3,
      agility: 2, teamwork: 3,
    },
  },
  {
    templateId: "fb-s",
    roleName: "Full-Back",
    duty: "Support",
    positionGroups: ["DL", "DR"],
    weights: {
      marking: 4, tackling: 4, positioning: 3, concentration: 3, anticipation: 3, decisions: 3,
      crossing: 3, dribbling: 3, passing: 3, technique: 2, stamina: 4, pace: 3, acceleration: 3,
      workRate: 3, teamwork: 3,
    },
  },
  {
    templateId: "fb-a",
    roleName: "Full-Back",
    duty: "Attack",
    positionGroups: ["DL", "DR"],
    weights: {
      marking: 3, tackling: 3, positioning: 3, crossing: 4, dribbling: 4, passing: 3, technique: 3,
      offTheBall: 2, stamina: 4, pace: 4, acceleration: 4, workRate: 3, decisions: 3,
    },
  },
  {
    templateId: "wb-s",
    roleName: "Wing-Back",
    duty: "Support",
    positionGroups: ["DL", "DR"],
    weights: {
      marking: 3, tackling: 3, positioning: 3, crossing: 4, dribbling: 4, passing: 3, technique: 3,
      stamina: 5, pace: 4, acceleration: 4, workRate: 4, teamwork: 3, decisions: 3, offTheBall: 2,
    },
  },
  {
    templateId: "wb-a",
    roleName: "Wing-Back",
    duty: "Attack",
    positionGroups: ["DL", "DR"],
    weights: {
      marking: 2, tackling: 3, crossing: 5, dribbling: 4, passing: 3, technique: 3, offTheBall: 3,
      flair: 2, stamina: 5, pace: 5, acceleration: 5, workRate: 4, decisions: 3, agility: 3,
    },
  },
  {
    templateId: "iwb-d",
    roleName: "Inverted Wing-Back",
    duty: "Defend",
    positionGroups: ["DL", "DR"],
    weights: {
      marking: 4, tackling: 4, positioning: 4, concentration: 3, passing: 4, decisions: 4,
      technique: 3, vision: 2, composure: 3, stamina: 3, pace: 3, acceleration: 3, workRate: 3,
    },
  },
  {
    templateId: "iwb-s",
    roleName: "Inverted Wing-Back",
    duty: "Support",
    positionGroups: ["DL", "DR"],
    weights: {
      marking: 3, tackling: 3, positioning: 3, passing: 4, decisions: 4, technique: 3, vision: 3,
      composure: 3, dribbling: 3, stamina: 4, pace: 3, acceleration: 3, workRate: 3, teamwork: 3,
    },
  },
  {
    templateId: "cwb-a",
    roleName: "Complete Wing-Back",
    duty: "Attack",
    positionGroups: ["DL", "DR"],
    weights: {
      marking: 2, tackling: 3, crossing: 5, dribbling: 5, passing: 4, technique: 4, offTheBall: 3,
      flair: 3, decisions: 3, stamina: 5, pace: 5, acceleration: 5, agility: 4, workRate: 4,
    },
  },

  // --- Defensive Midfielder ---
  {
    templateId: "dlp-d",
    roleName: "Deep-Lying Playmaker",
    duty: "Defend",
    positionGroups: ["DM"],
    weights: {
      passing: 5, technique: 4, vision: 4, decisions: 4, composure: 4, firstTouch: 4, marking: 3,
      tackling: 3, positioning: 3, concentration: 3, anticipation: 3, teamwork: 3, workRate: 2,
      stamina: 2,
    },
  },
  {
    templateId: "dlp-s",
    roleName: "Deep-Lying Playmaker",
    duty: "Support",
    positionGroups: ["DM"],
    weights: {
      passing: 5, technique: 4, vision: 5, decisions: 5, composure: 4, firstTouch: 4, marking: 2,
      tackling: 2, positioning: 2, teamwork: 3, workRate: 3, stamina: 3, flair: 2,
    },
  },
  {
    templateId: "anc-d",
    roleName: "Anchor Man",
    duty: "Defend",
    positionGroups: ["DM"],
    weights: {
      marking: 4, tackling: 5, positioning: 5, concentration: 5, anticipation: 4, aggression: 3,
      bravery: 3, decisions: 3, composure: 3, strength: 3, stamina: 3, teamwork: 4, workRate: 3,
    },
  },
  {
    templateId: "hb-d",
    roleName: "Half-Back",
    duty: "Defend",
    positionGroups: ["DM"],
    weights: {
      marking: 5, tackling: 5, positioning: 5, concentration: 5, anticipation: 5, decisions: 4,
      composure: 4, aggression: 3, bravery: 3, passing: 3, teamwork: 4, strength: 3, stamina: 3,
    },
  },
  {
    templateId: "bwm-d",
    roleName: "Ball-Winning Midfielder",
    duty: "Defend",
    positionGroups: ["DM"],
    weights: {
      tackling: 5, marking: 4, aggression: 4, anticipation: 4, positioning: 4, concentration: 4,
      bravery: 3, teamwork: 4, workRate: 5, stamina: 4, decisions: 3, composure: 2,
    },
  },
  {
    templateId: "dm-d",
    roleName: "Defensive Midfielder",
    duty: "Defend",
    positionGroups: ["DM"],
    weights: {
      tackling: 5, marking: 4, positioning: 4, concentration: 4, anticipation: 4, decisions: 3,
      composure: 3, teamwork: 4, workRate: 4, stamina: 4, passing: 3, strength: 3,
    },
  },
  {
    templateId: "dm-s",
    roleName: "Defensive Midfielder",
    duty: "Support",
    positionGroups: ["DM"],
    weights: {
      tackling: 4, marking: 3, positioning: 4, concentration: 3, anticipation: 3, decisions: 4,
      composure: 3, passing: 4, teamwork: 4, workRate: 4, stamina: 4, technique: 2,
    },
  },
  {
    templateId: "reg-s",
    roleName: "Regista",
    duty: "Support",
    positionGroups: ["DM"],
    weights: {
      passing: 5, vision: 5, technique: 4, decisions: 5, composure: 4, firstTouch: 4, flair: 3,
      teamwork: 2, marking: 1, tackling: 1, positioning: 2,
    },
  },

  // --- Central Midfielder (Advanced Playmaker also valid at AMC) ---
  {
    templateId: "cm-d",
    roleName: "Central Midfielder",
    duty: "Defend",
    positionGroups: ["MC"],
    weights: {
      tackling: 4, marking: 3, positioning: 4, concentration: 4, anticipation: 3, decisions: 3,
      passing: 3, teamwork: 4, workRate: 4, stamina: 3, composure: 2,
    },
  },
  {
    templateId: "cm-s",
    roleName: "Central Midfielder",
    duty: "Support",
    positionGroups: ["MC"],
    weights: {
      passing: 4, decisions: 4, technique: 3, teamwork: 4, workRate: 4, stamina: 4, vision: 3,
      composure: 3, tackling: 2, positioning: 2, firstTouch: 3,
    },
  },
  {
    templateId: "cm-a",
    roleName: "Central Midfielder",
    duty: "Attack",
    positionGroups: ["MC"],
    weights: {
      passing: 3, decisions: 4, technique: 3, offTheBall: 3, longShots: 2, finishing: 2,
      stamina: 3, workRate: 3, vision: 3, flair: 2, composure: 3,
    },
  },
  {
    templateId: "b2b-s",
    roleName: "Box-to-Box Midfielder",
    duty: "Support",
    positionGroups: ["MC"],
    weights: {
      passing: 3, decisions: 3, tackling: 3, positioning: 2, workRate: 5, stamina: 5, teamwork: 4,
      offTheBall: 3, technique: 3, longShots: 2, aggression: 2, strength: 2, pace: 3, acceleration: 3,
    },
  },
  {
    templateId: "ap-s",
    roleName: "Advanced Playmaker",
    duty: "Support",
    positionGroups: ["MC", "AMC"],
    weights: {
      passing: 5, vision: 5, technique: 4, decisions: 5, composure: 4, firstTouch: 4, flair: 3,
      teamwork: 3, offTheBall: 2,
    },
  },
  {
    templateId: "ap-a",
    roleName: "Advanced Playmaker",
    duty: "Attack",
    positionGroups: ["MC", "AMC"],
    weights: {
      passing: 4, vision: 5, technique: 4, decisions: 5, composure: 4, firstTouch: 4, flair: 4,
      offTheBall: 3, longShots: 2, dribbling: 2,
    },
  },
  {
    templateId: "mez-s",
    roleName: "Mezzala",
    duty: "Support",
    positionGroups: ["MC"],
    weights: {
      passing: 4, dribbling: 4, technique: 4, decisions: 3, vision: 3, offTheBall: 3, workRate: 3,
      stamina: 3, flair: 2, longShots: 2,
    },
  },
  {
    templateId: "mez-a",
    roleName: "Mezzala",
    duty: "Attack",
    positionGroups: ["MC"],
    weights: {
      passing: 3, dribbling: 4, technique: 4, decisions: 3, vision: 3, offTheBall: 4, workRate: 3,
      stamina: 3, flair: 3, longShots: 3, finishing: 2,
    },
  },
  {
    templateId: "rpm-s",
    roleName: "Roaming Playmaker",
    duty: "Support",
    positionGroups: ["MC"],
    weights: {
      passing: 5, vision: 5, technique: 4, decisions: 5, composure: 4, firstTouch: 4, workRate: 4,
      stamina: 4, teamwork: 3, flair: 2,
    },
  },

  // --- Wide Midfielder / Attacking Midfielder Wide (shared across both flanks, ML/MR and AML/AMR) ---
  {
    templateId: "wm-d",
    roleName: "Wide Midfielder",
    duty: "Defend",
    positionGroups: ["ML", "MR"],
    weights: {
      tackling: 4, marking: 3, positioning: 3, concentration: 3, crossing: 2, workRate: 4,
      stamina: 4, teamwork: 4, decisions: 3,
    },
  },
  {
    templateId: "wm-s",
    roleName: "Wide Midfielder",
    duty: "Support",
    positionGroups: ["ML", "MR"],
    weights: {
      crossing: 4, passing: 3, dribbling: 3, technique: 3, workRate: 4, stamina: 4, teamwork: 3,
      decisions: 3, tackling: 2, positioning: 2,
    },
  },
  {
    templateId: "wm-a",
    roleName: "Wide Midfielder",
    duty: "Attack",
    positionGroups: ["ML", "MR"],
    weights: {
      crossing: 4, dribbling: 4, passing: 3, technique: 3, offTheBall: 3, workRate: 3, stamina: 3,
      pace: 3, acceleration: 3, decisions: 3,
    },
  },
  {
    templateId: "wg-s",
    roleName: "Winger",
    duty: "Support",
    positionGroups: ["ML", "MR", "AML", "AMR"],
    weights: {
      crossing: 5, dribbling: 4, technique: 4, pace: 4, acceleration: 4, workRate: 3, stamina: 3,
      flair: 3, offTheBall: 2, agility: 3,
    },
  },
  {
    templateId: "wg-a",
    roleName: "Winger",
    duty: "Attack",
    positionGroups: ["ML", "MR", "AML", "AMR"],
    weights: {
      crossing: 5, dribbling: 5, technique: 4, pace: 5, acceleration: 5, flair: 3, offTheBall: 3,
      finishing: 2, agility: 4, balance: 3,
    },
  },
  {
    templateId: "if-a",
    roleName: "Inside Forward",
    duty: "Attack",
    positionGroups: ["ML", "MR", "AML", "AMR"],
    weights: {
      dribbling: 5, technique: 4, finishing: 4, offTheBall: 4, flair: 3, longShots: 3, pace: 4,
      acceleration: 4, agility: 3, decisions: 3, composure: 3,
    },
  },
  {
    templateId: "wp-s",
    roleName: "Wide Playmaker",
    duty: "Support",
    positionGroups: ["ML", "MR", "AML", "AMR"],
    weights: {
      passing: 5, vision: 4, technique: 4, decisions: 4, crossing: 3, firstTouch: 3, flair: 2,
      teamwork: 2,
    },
  },
  {
    templateId: "iw-a",
    roleName: "Inverted Winger",
    duty: "Attack",
    positionGroups: ["AML", "AMR"],
    weights: {
      dribbling: 5, technique: 4, finishing: 3, offTheBall: 3, flair: 3, longShots: 2, passing: 3,
      pace: 4, acceleration: 4, agility: 3, decisions: 3,
    },
  },
  {
    templateId: "rd-a",
    roleName: "Raumdeuter",
    duty: "Attack",
    positionGroups: ["AML", "AMR"],
    weights: {
      offTheBall: 5, anticipation: 5, finishing: 4, composure: 4, acceleration: 4, pace: 4,
      decisions: 3, flair: 2, firstTouch: 3,
    },
  },

  // --- Attacking Midfielder Central ---
  {
    templateId: "am-s",
    roleName: "Attacking Midfielder",
    duty: "Support",
    positionGroups: ["AMC"],
    weights: {
      passing: 4, technique: 4, decisions: 4, vision: 4, offTheBall: 3, flair: 3, firstTouch: 4,
      longShots: 2, composure: 3,
    },
  },
  {
    templateId: "am-a",
    roleName: "Attacking Midfielder",
    duty: "Attack",
    positionGroups: ["AMC"],
    weights: {
      passing: 3, technique: 4, decisions: 4, vision: 3, offTheBall: 4, flair: 3, firstTouch: 4,
      longShots: 3, finishing: 3, composure: 3, dribbling: 3,
    },
  },
  {
    templateId: "ss-a",
    roleName: "Shadow Striker",
    duty: "Attack",
    positionGroups: ["AMC"],
    weights: {
      finishing: 4, offTheBall: 5, composure: 4, anticipation: 4, decisions: 4, technique: 3,
      longShots: 3, firstTouch: 3, acceleration: 4, pace: 3, dribbling: 2,
    },
  },
  {
    templateId: "eng-s",
    roleName: "Enganche",
    duty: "Support",
    positionGroups: ["AMC"],
    weights: {
      passing: 5, vision: 5, technique: 4, decisions: 5, composure: 4, firstTouch: 4, flair: 3,
      teamwork: 1, workRate: 1,
    },
  },
  {
    templateId: "tre-a",
    roleName: "Trequartista",
    duty: "Attack",
    positionGroups: ["AMC"],
    weights: {
      technique: 5, flair: 5, dribbling: 4, passing: 4, vision: 4, decisions: 4, firstTouch: 4,
      offTheBall: 3, composure: 3, finishing: 2,
    },
  },

  // --- Striker ---
  {
    templateId: "af-a",
    roleName: "Advanced Forward",
    duty: "Attack",
    positionGroups: ["ST"],
    weights: {
      finishing: 5, offTheBall: 5, composure: 4, anticipation: 4, firstTouch: 4, technique: 3,
      acceleration: 4, pace: 4, dribbling: 3, decisions: 3,
    },
  },
  {
    templateId: "cf-s",
    roleName: "Complete Forward",
    duty: "Support",
    positionGroups: ["ST"],
    weights: {
      finishing: 4, firstTouch: 4, technique: 4, offTheBall: 4, passing: 3, dribbling: 3,
      strength: 3, heading: 3, composure: 3, decisions: 3, teamwork: 3, workRate: 3,
    },
  },
  {
    templateId: "cf-a",
    roleName: "Complete Forward",
    duty: "Attack",
    positionGroups: ["ST"],
    weights: {
      finishing: 5, firstTouch: 4, technique: 4, offTheBall: 4, dribbling: 4, strength: 3,
      heading: 3, composure: 4, decisions: 3, acceleration: 3, pace: 3,
    },
  },
  {
    templateId: "dlf-s",
    roleName: "Deep-Lying Forward",
    duty: "Support",
    positionGroups: ["ST"],
    weights: {
      firstTouch: 4, technique: 4, passing: 4, offTheBall: 3, composure: 3, decisions: 3,
      teamwork: 3, heading: 2, strength: 3, finishing: 3,
    },
  },
  {
    templateId: "dlf-a",
    roleName: "Deep-Lying Forward",
    duty: "Attack",
    positionGroups: ["ST"],
    weights: {
      finishing: 4, firstTouch: 4, technique: 4, offTheBall: 4, passing: 3, decisions: 3,
      composure: 3, heading: 2, strength: 3, acceleration: 3,
    },
  },
  {
    templateId: "poa-a",
    roleName: "Poacher",
    duty: "Attack",
    positionGroups: ["ST"],
    weights: {
      finishing: 5, offTheBall: 5, composure: 5, anticipation: 4, firstTouch: 3, decisions: 3,
      acceleration: 3, pace: 3,
    },
  },
  {
    templateId: "tm-s",
    roleName: "Target Man",
    duty: "Support",
    positionGroups: ["ST"],
    weights: {
      heading: 5, strength: 5, jumpingReach: 4, firstTouch: 3, technique: 2, bravery: 3,
      teamwork: 3, composure: 3, balance: 3, passing: 2,
    },
  },
  {
    templateId: "tm-a",
    roleName: "Target Man",
    duty: "Attack",
    positionGroups: ["ST"],
    weights: {
      heading: 5, strength: 5, jumpingReach: 4, finishing: 4, firstTouch: 3, bravery: 3,
      composure: 3, balance: 3, offTheBall: 3,
    },
  },
  {
    templateId: "f9-s",
    roleName: "False Nine",
    duty: "Support",
    positionGroups: ["ST"],
    weights: {
      technique: 4, passing: 4, firstTouch: 4, vision: 4, decisions: 4, offTheBall: 3,
      dribbling: 3, composure: 3, teamwork: 3,
    },
  },
  {
    templateId: "pf-d",
    roleName: "Pressing Forward",
    duty: "Defend",
    positionGroups: ["ST"],
    weights: {
      workRate: 5, stamina: 5, aggression: 4, anticipation: 3, tackling: 2, teamwork: 4,
      determination: 3, strength: 3, decisions: 2,
    },
  },
  {
    templateId: "pf-s",
    roleName: "Pressing Forward",
    duty: "Support",
    positionGroups: ["ST"],
    weights: {
      workRate: 5, stamina: 5, aggression: 4, offTheBall: 3, finishing: 3, firstTouch: 3,
      teamwork: 3, determination: 3, acceleration: 3,
    },
  },
  {
    templateId: "pf-a",
    roleName: "Pressing Forward",
    duty: "Attack",
    positionGroups: ["ST"],
    weights: {
      workRate: 4, stamina: 4, aggression: 3, finishing: 4, offTheBall: 4, firstTouch: 3,
      acceleration: 4, pace: 3, determination: 3,
    },
  },
];

function generate(): { catalogue: RoleDefinition[]; weights: Record<string, RoleWeights> } {
  const catalogue: RoleDefinition[] = [];
  const weights: Record<string, RoleWeights> = {};

  for (const template of ROLE_TEMPLATES) {
    for (const group of template.positionGroups) {
      const id = `${group.toLowerCase()}-${template.templateId}`;
      catalogue.push({
        id,
        positionGroup: group,
        roleName: template.roleName,
        duty: template.duty,
        shortLabel: `${template.roleName} (${DUTY_ABBREV[template.duty]})`,
        isGoalkeeperRole: !!template.isGoalkeeperRole,
      });
      weights[id] = { roleId: id, weights: template.weights };
    }
  }

  return { catalogue, weights };
}

const generated = generate();
export const ROLE_CATALOGUE: RoleDefinition[] = generated.catalogue;
export const ROLE_WEIGHTS: Record<string, RoleWeights> = generated.weights;
