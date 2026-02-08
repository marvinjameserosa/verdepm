export type ProjectStatus =
  | "planning"
  | "in-progress"
  | "on-hold"
  | "completed";

export type ProjectPriority = "low" | "medium" | "high";

export type SupplierApprovalStatus = "pending" | "approved" | "rejected";

export interface Project {
  id: string;
  ownerId?: string | null;
  organizationId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  category?: string | null;
  projectManager?: string | null;
  clientName?: string | null;
  location?: string | null;
  budget?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  buildingPermitUrl?: string | null;
  buildingPermitStoragePath?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseProject {
  id?: string;
  project_id?: string | null;
  owner_id?: string | null;
  organization_id?: string | null;
  project_name?: string | null;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  category?: string | null;
  project_manager?: string | null;
  client_name?: string | null;
  location?: string | null;
  budget?: number | string | null;
  start_date?: string | null;
  end_date?: string | null;
  building_permit_url?: string | null;
  building_permit_storage_path?: string | null;
  created_at: string;
  updated_at: string;
}

export type MaterialStatus =
  | "Identified"
  | "Vetted"
  | "Denied"
  | "Not Delivered";

export type Material = {
  id: string;
  category: string;
  name: string;
  supplier: string;
  cost: string;
  unit?: string;
  notes: string;
  credentials?: string;
  warehouse?: string;
  specSheetPath?: string;
  specSheetUrl?: string;
  status: MaterialStatus;
  approvalStatus?: SupplierApprovalStatus;
  submittedBy?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  deliveryStatus?: string;
};

export type EsgTarget = {
  id: string;
  category: "Environmental" | "Social" | "Governance";
  goal: string;
  metric: string;
  approvalStatus?: SupplierApprovalStatus;
  submittedBy?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
};
