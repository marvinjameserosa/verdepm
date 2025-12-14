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

export const templateOptions = [
  { value: "standard", label: "Standard Construction" },
  { value: "green-building", label: "Green Building" },
  { value: "residential-complex", label: "Residential Complex" },
  { value: "commercial-building", label: "Commercial Building" },
  { value: "infrastructure", label: "Infrastructure Project" },
  { value: "renovation", label: "Renovation/Retrofit" },
];

export const timezoneOptions = [
  { value: "UTC-12:00", label: "(UTC-12:00) International Date Line West" },
  { value: "UTC-11:00", label: "(UTC-11:00) Coordinated Universal Time-11" },
  { value: "UTC-10:00", label: "(UTC-10:00) Hawaii" },
  { value: "UTC-09:00", label: "(UTC-09:00) Alaska" },
  { value: "UTC-08:00", label: "(UTC-08:00) Pacific Time (US & Canada)" },
  { value: "UTC-07:00", label: "(UTC-07:00) Mountain Time (US & Canada)" },
  { value: "UTC-06:00", label: "(UTC-06:00) Central Time (US & Canada)" },
  { value: "UTC-05:00", label: "(UTC-05:00) Eastern Time (US & Canada)" },
  { value: "UTC-04:00", label: "(UTC-04:00) Atlantic Time (Canada)" },
  { value: "UTC-03:00", label: "(UTC-03:00) Buenos Aires, Georgetown" },
  { value: "UTC-02:00", label: "(UTC-02:00) Coordinated Universal Time-02" },
  { value: "UTC-01:00", label: "(UTC-01:00) Azores" },
  { value: "UTC+00:00", label: "(UTC+00:00) London, Dublin, Lisbon" },
  { value: "UTC+01:00", label: "(UTC+01:00) Brussels, Paris, Madrid" },
  { value: "UTC+02:00", label: "(UTC+02:00) Athens, Istanbul, Cairo" },
  { value: "UTC+03:00", label: "(UTC+03:00) Moscow, Baghdad, Nairobi" },
  { value: "UTC+04:00", label: "(UTC+04:00) Abu Dhabi, Dubai" },
  { value: "UTC+05:00", label: "(UTC+05:00) Islamabad, Karachi" },
  { value: "UTC+05:30", label: "(UTC+05:30) Mumbai, New Delhi" },
  { value: "UTC+06:00", label: "(UTC+06:00) Dhaka, Astana" },
  { value: "UTC+07:00", label: "(UTC+07:00) Bangkok, Jakarta" },
  { value: "UTC+08:00", label: "(UTC+08:00) Beijing, Singapore, Manila" },
  { value: "UTC+09:00", label: "(UTC+09:00) Tokyo, Seoul" },
  { value: "UTC+10:00", label: "(UTC+10:00) Sydney, Melbourne" },
  { value: "UTC+11:00", label: "(UTC+11:00) Solomon Islands" },
  { value: "UTC+12:00", label: "(UTC+12:00) Auckland, Fiji" },
];

export const officeOptions = [
  { value: "main-office", label: "Main Office" },
  { value: "branch-office-1", label: "Branch Office 1" },
  { value: "branch-office-2", label: "Branch Office 2" },
  { value: "regional-office-north", label: "Regional Office - North" },
  { value: "regional-office-south", label: "Regional Office - South" },
  { value: "regional-office-east", label: "Regional Office - East" },
  { value: "regional-office-west", label: "Regional Office - West" },
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
