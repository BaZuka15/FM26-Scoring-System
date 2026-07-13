export interface FormationSlot {
  slotId: string;
  label: string;
  roleId: string;
  /** Pitch position as a percentage: x=0 left touchline/100 right, y=0 opponent's goal/100 own goal. */
  x: number;
  y: number;
}

export interface Formation {
  id: string;
  name: string;
  slots: FormationSlot[];
}

export const FORMATIONS: Formation[] = [
  {
    id: "442",
    name: "4-4-2",
    slots: [
      { slotId: "gk", label: "GK", roleId: "gk-gk-d", x: 50, y: 95 },
      { slotId: "dl", label: "LB", roleId: "dl-fb-s", x: 12, y: 78 },
      { slotId: "dc1", label: "CB", roleId: "dc-cd-d", x: 37, y: 82 },
      { slotId: "dc2", label: "CB", roleId: "dc-cd-d", x: 63, y: 82 },
      { slotId: "dr", label: "RB", roleId: "dr-fb-s", x: 88, y: 78 },
      { slotId: "ml", label: "LM", roleId: "ml-wm-s", x: 12, y: 48 },
      { slotId: "mc1", label: "CM", roleId: "mc-cm-d", x: 37, y: 52 },
      { slotId: "mc2", label: "CM", roleId: "mc-b2b-s", x: 63, y: 52 },
      { slotId: "mr", label: "RM", roleId: "mr-wm-s", x: 88, y: 48 },
      { slotId: "st1", label: "ST", roleId: "st-af-a", x: 38, y: 15 },
      { slotId: "st2", label: "ST", roleId: "st-dlf-s", x: 62, y: 15 },
    ],
  },
  {
    id: "433",
    name: "4-3-3",
    slots: [
      { slotId: "gk", label: "GK", roleId: "gk-gk-d", x: 50, y: 95 },
      { slotId: "dl", label: "LB", roleId: "dl-fb-a", x: 12, y: 78 },
      { slotId: "dc1", label: "CB", roleId: "dc-cd-d", x: 37, y: 82 },
      { slotId: "dc2", label: "CB", roleId: "dc-bpd-d", x: 63, y: 82 },
      { slotId: "dr", label: "RB", roleId: "dr-fb-a", x: 88, y: 78 },
      { slotId: "dm", label: "DM", roleId: "dm-dm-d", x: 50, y: 62 },
      { slotId: "mc1", label: "CM", roleId: "mc-cm-s", x: 30, y: 48 },
      { slotId: "mc2", label: "CM", roleId: "mc-b2b-s", x: 70, y: 48 },
      { slotId: "aml", label: "LW", roleId: "aml-wg-a", x: 15, y: 22 },
      { slotId: "amr", label: "RW", roleId: "amr-wg-a", x: 85, y: 22 },
      { slotId: "st", label: "ST", roleId: "st-af-a", x: 50, y: 12 },
    ],
  },
  {
    id: "4231",
    name: "4-2-3-1",
    slots: [
      { slotId: "gk", label: "GK", roleId: "gk-gk-d", x: 50, y: 95 },
      { slotId: "dl", label: "LB", roleId: "dl-fb-s", x: 12, y: 78 },
      { slotId: "dc1", label: "CB", roleId: "dc-cd-d", x: 37, y: 82 },
      { slotId: "dc2", label: "CB", roleId: "dc-bpd-d", x: 63, y: 82 },
      { slotId: "dr", label: "RB", roleId: "dr-fb-s", x: 88, y: 78 },
      { slotId: "dm1", label: "DM", roleId: "dm-dm-d", x: 35, y: 62 },
      { slotId: "dm2", label: "DM", roleId: "dm-dlp-s", x: 65, y: 62 },
      { slotId: "aml", label: "LAM", roleId: "aml-if-a", x: 15, y: 32 },
      { slotId: "amc", label: "CAM", roleId: "amc-ap-a", x: 50, y: 28 },
      { slotId: "amr", label: "RAM", roleId: "amr-if-a", x: 85, y: 32 },
      { slotId: "st", label: "ST", roleId: "st-af-a", x: 50, y: 12 },
    ],
  },
  {
    id: "352",
    name: "3-5-2",
    slots: [
      { slotId: "gk", label: "GK", roleId: "gk-gk-d", x: 50, y: 95 },
      { slotId: "dc1", label: "CB", roleId: "dc-cd-d", x: 25, y: 82 },
      { slotId: "dc2", label: "CB", roleId: "dc-cd-cv", x: 50, y: 85 },
      { slotId: "dc3", label: "CB", roleId: "dc-bpd-d", x: 75, y: 82 },
      { slotId: "dl", label: "LWB", roleId: "dl-wb-a", x: 8, y: 55 },
      { slotId: "dm", label: "DM", roleId: "dm-dlp-s", x: 50, y: 62 },
      { slotId: "mc1", label: "CM", roleId: "mc-b2b-s", x: 33, y: 45 },
      { slotId: "mc2", label: "CM", roleId: "mc-mez-a", x: 67, y: 45 },
      { slotId: "dr", label: "RWB", roleId: "dr-wb-a", x: 92, y: 55 },
      { slotId: "st1", label: "ST", roleId: "st-af-a", x: 38, y: 15 },
      { slotId: "st2", label: "ST", roleId: "st-poa-a", x: 62, y: 15 },
    ],
  },
];
