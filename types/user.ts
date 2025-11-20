export type User = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role:
    | "Administrator"
    | "Project Manager"
    | "ESG Analyst"
    | "Compliance Officer"
    | "Contractor"
    | "Viewer"
    | "owner"
    | "manager"
    | "member"
    | "supplier";
  created_at: string;
  modified_at: string;
  created_by: string;
  modified_by: string;
  department?: string;
  status?: "Active" | "Pending" | "Inactive";
  joinDate?: string;
  lastActive?: string;
  projects?: string[];
  avatar?: string | null;
  avatar_url?: string | null;
  avatar_storage_path?: string | null;
  permissions?: string[];
};

export const USER_ROLE_OPTIONS: User["role"][] = [
  "Administrator",
  "Project Manager",
  "ESG Analyst",
  "Compliance Officer",
  "Contractor",
  "Viewer",
  "owner",
  "manager",
  "member",
  "supplier",
];
