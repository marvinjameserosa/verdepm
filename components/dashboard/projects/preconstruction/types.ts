// Re-export shared project types so existing imports keep working.
export {
  type Material,
  type MaterialStatus,
  type EsgTarget,
  type SupplierApprovalStatus,
} from "@/types/project";

export { units, initialMaterials } from "@/lib/project-options";
