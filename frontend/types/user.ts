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
    | "Viewer";
  created_at: string;
  modified_at: string;
  created_by: string;
  modified_by: string;
  department?: string;
  status?: "Active" | "Pending" | "Inactive";
  joinDate?: string;
  lastActive?: string;
  projects?: string[];
  avatar?: string;
  permissions?: string[];
};
