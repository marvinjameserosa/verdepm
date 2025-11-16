export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "On Track" | "Delayed" | "Completed";
}

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

export const units = [
  { value: "per Lot", label: "per Lot" },
  { value: "per Piece", label: "per Piece" },
  { value: "per Kg", label: "per Kg" },
  { value: "per Set", label: "per Set" },
  { value: "per Cubic Meter", label: "per Cubic Meter" },
  { value: "per Ton", label: "per Ton" },
  { value: "per Square Meter", label: "per Square Meter" },
];

export const initialMaterials: Material[] = [
  {
    id: 1,
    category: "Concrete",
    name: "Low-Carbon Concrete Mix",
    supplier: "EcoMix Industries",
    cost: "120000",
    unit: "per Cubic Meter",
    notes: "50% GGBS substitution lowers embodied carbon by 35%",
    credentials: "EPD, ISO 14001",
    status: "Vetted",
  },
  {
    id: 2,
    category: "Structural Steel",
    name: "Recycled Steel Sections",
    supplier: "Circular Metals Co.",
    cost: "98000",
    unit: "per Ton",
    notes: "97% recycled content; regional sourcing within 250 km",
    credentials: "SCS Recycled Content",
    status: "Identified",
  },
  {
    id: 3,
    category: "Interior Finishes",
    name: "Bamboo Acoustic Panels",
    supplier: "GreenAcoustics",
    cost: "4500",
    unit: "per Square Meter",
    notes: "Rapidly renewable material with low VOC adhesives",
    credentials: "FSC, Declare Red List Free",
    status: "Vetted",
  },
];
