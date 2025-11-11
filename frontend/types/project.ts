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
