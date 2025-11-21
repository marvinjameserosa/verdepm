import { type ProjectPriority, type ProjectStatus } from "@/types/project";
import type { Material } from "@/types/project";

export const statusOptions: Array<{ value: ProjectStatus; label: string }> = [
  { value: "planning", label: "Planning" },
  { value: "in-progress", label: "In Progress" },
  { value: "on-hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
];

export const priorityOptions: Array<{ value: ProjectPriority; label: string }> =
  [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

export const categoryOptions = [
  { value: "commercial", label: "Commercial" },
  { value: "residential", label: "Residential" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "renovation", label: "Renovation" },
];

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
    id: "1",
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
    id: "2",
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
    id: "3",
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
