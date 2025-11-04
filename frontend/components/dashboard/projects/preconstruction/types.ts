export type Material = {
  id: number;
  category: string;
  name: string;
  supplier: string;
  cost: string;
  unit?: string;
  notes: string;
  credentials?: string;
  status: "Identified" | "Vetted" | "Denied";
};

export const initialMaterials: Material[] = [
  {
    id: 1,
    category: "Concrete",
    name: "Low-Carbon Concrete Mix",
    supplier: "EcoCrete Inc.",
    cost: "15000",
    unit: "per Cubic Meter",
    notes: "EPD verified, 30% less carbon than standard mix.",
    status: "Vetted",
  },
  {
    id: 2,
    category: "Structural Steel",
    name: "Recycled Steel Beams",
    supplier: "SteelAgain Corp.",
    cost: "80000",
    unit: "per Ton",
    notes: "95% recycled content. Lead time is 6 weeks.",
    status: "Identified",
  },
  {
    id: 3,
    category: "Carpentry",
    name: "Bamboo Composite Decking",
    supplier: "GreenDeck Solutions",
    cost: "5000",
    unit: "per Square Meter",
    notes: "FSC certified bamboo. High durability.",
    status: "Vetted",
  },
];

export const units = [
  { value: "per Lot", label: "per Lot" },
  { value: "per Piece", label: "per Piece" },
  { value: "per Kg", label: "per Kg" },
  { value: "per Set", label: "per Set" },
  { value: "per Meter", label: "per Meter" },
  { value: "per Square Meter", label: "per Square Meter" },
  { value: "per Cubic Meter", label: "per Cubic Meter" },
  { value: "per Liter", label: "per Liter" },
  { value: "per Ton", label: "per Ton" },
  { value: "per Roll", label: "per Roll" },
  { value: "per Box", label: "per Box" },
  { value: "per Pack", label: "per Pack" },
  { value: "per Bundle", label: "per Bundle" },
];
