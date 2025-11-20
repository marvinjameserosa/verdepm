import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { isMissingRelationError } from "@/lib/supabase/errors";
import type { EsgTarget, SupplierApprovalStatus } from "@/types/project";

export type TargetCategory = "Environmental" | "Social" | "Governance";

export type TargetDraft = {
  category: TargetCategory;
  goal: string;
  metric: string;
};

type UsePreconstructionEsgTargetsArgs = {
  projectSetupId?: string | null;
  initialTargets?: EsgTarget[];
  onError?: (message: string) => void;
  onResetFeedback?: () => void;
  currentUserId?: string | null;
};

export function usePreconstructionEsgTargets({
  projectSetupId,
  initialTargets,
  onError,
  onResetFeedback,
  currentUserId,
}: UsePreconstructionEsgTargetsArgs) {
  const [targets, setTargets] = useState<EsgTarget[]>(initialTargets ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingTargetId, setDeletingTargetId] = useState<string | null>(null);
  const [updatingTargetId, setUpdatingTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (initialTargets) {
      setTargets(initialTargets);
    }
  }, [initialTargets]);

  const loadTargets = useCallback(async () => {
    if (!projectSetupId) {
      setTargets([]);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("preconstruction_esg_target")
        .select(
          "id, category, goal, metric_kpi, approval_status, submitted_by, approved_by, approved_at"
        )
        .eq("project_setup_id", projectSetupId)
        .order("created_at", { ascending: true });

      if (error) {
        if (isMissingRelationError(error)) {
          console.warn(
            "Optional pre-construction ESG target relation missing; skipping load."
          );
          setTargets([]);
          return;
        }
        throw error;
      }

      type TargetRow = {
        id: string;
        category: EsgTarget["category"];
        goal: string;
        metric_kpi: string;
        approval_status: SupplierApprovalStatus | null;
        submitted_by: string | null;
        approved_by: string | null;
        approved_at: string | null;
      };

      const mappedTargets: EsgTarget[] = ((data ?? []) as TargetRow[]).map(
        (row) => ({
          id: row.id,
          category: row.category,
          goal: row.goal,
          metric: row.metric_kpi,
          approvalStatus: row.approval_status ?? "pending",
          submittedBy: row.submitted_by,
          approvedBy: row.approved_by,
          approvedAt: row.approved_at,
        })
      );

      setTargets(mappedTargets);
    } catch (error) {
      console.error("Failed to load ESG targets", error);
      if (error instanceof Error) {
        onError?.(error.message);
      } else {
        onError?.("Unable to load ESG targets.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [onError, projectSetupId]);

  const saveTarget = useCallback(
    async (draft: TargetDraft): Promise<EsgTarget | null> => {
      if (!projectSetupId) {
        onError?.("Save project setup before adding ESG targets.");
        return null;
      }

      setIsSaving(true);
      onResetFeedback?.();

      try {
        const { data, error } = await supabase
          .from("preconstruction_esg_target")
          .insert([
            {
              project_setup_id: projectSetupId,
              category: draft.category,
              goal: draft.goal,
              metric_kpi: draft.metric,
              approval_status: "pending",
              submitted_by: currentUserId ?? null,
            },
          ])
          .select(
            "id, category, goal, metric_kpi, approval_status, submitted_by, approved_by, approved_at"
          )
          .single();

        if (error) {
          if (isMissingRelationError(error)) {
            console.warn(
              "Skipping ESG target save because the related table is not configured."
            );
            return null;
          }
          throw error;
        }

        if (!data) {
          throw new Error("Supabase did not return the created ESG target.");
        }

        const mappedTarget: EsgTarget = {
          id: data.id,
          category: data.category as EsgTarget["category"],
          goal: data.goal,
          metric: data.metric_kpi,
          approvalStatus: (data.approval_status as SupplierApprovalStatus) ?? "pending",
          submittedBy: data.submitted_by,
          approvedBy: data.approved_by,
          approvedAt: data.approved_at,
        };

        setTargets((prev) => [...prev, mappedTarget]);
        return mappedTarget;
      } catch (error) {
        console.error("Failed to save ESG target", error);
        if (error instanceof Error) {
          onError?.(error.message);
        } else {
          onError?.("Unable to save ESG target.");
        }
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [onError, onResetFeedback, projectSetupId]
  );

  const deleteTarget = useCallback(
    async (targetId: string): Promise<boolean> => {
      if (!projectSetupId) {
        onError?.("Save project setup before modifying ESG targets.");
        return false;
      }

      setDeletingTargetId(targetId);
      onResetFeedback?.();

      try {
        const { error } = await supabase
          .from("preconstruction_esg_target")
          .delete()
          .eq("id", targetId)
          .eq("project_setup_id", projectSetupId);

        if (error) {
          if (isMissingRelationError(error)) {
            console.warn(
              "Skipping ESG target delete because the related table is not configured."
            );
            return false;
          }
          throw error;
        }

        setTargets((prev) => prev.filter((target) => target.id !== targetId));
        return true;
      } catch (error) {
        console.error("Failed to delete ESG target", error);
        if (error instanceof Error) {
          onError?.(error.message);
        } else {
          onError?.("Unable to delete ESG target.");
        }
        return false;
      } finally {
        setDeletingTargetId(null);
      }
    },
    [onError, onResetFeedback, projectSetupId]
  );

  const updateTargetApprovalStatus = useCallback(
    async (
      targetId: string,
      nextStatus: SupplierApprovalStatus,
      reviewerId?: string | null
    ) => {
      if (!projectSetupId) {
        onError?.("Save project setup before approving ESG targets.");
        return;
      }

      setUpdatingTargetId(targetId);
      onResetFeedback?.();

      try {
        const { data, error } = await supabase
          .from("preconstruction_esg_target")
          .update({
            approval_status: nextStatus,
            approved_by: reviewerId ?? null,
            approved_at: nextStatus === "approved" ? new Date().toISOString() : null,
          })
          .eq("id", targetId)
          .eq("project_setup_id", projectSetupId)
          .select(
            "id, category, goal, metric_kpi, approval_status, submitted_by, approved_by, approved_at"
          )
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          return;
        }

        setTargets((prev) =>
          prev.map((target) =>
            target.id === targetId
              ? {
                  ...target,
                  approvalStatus: (data.approval_status as SupplierApprovalStatus) ?? target.approvalStatus,
                  approvedBy: data.approved_by,
                  approvedAt: data.approved_at,
                }
              : target
          )
        );
      } catch (error) {
        console.error("Failed to update ESG target approval", error);
        onError?.(
          error instanceof Error
            ? error.message
            : "Unable to update target approval."
        );
      } finally {
        setUpdatingTargetId(null);
      }
    },
    [onError, onResetFeedback, projectSetupId]
  );

  useEffect(() => {
    void loadTargets();
  }, [loadTargets]);

  return {
    targets,
    isLoading,
    isSaving,
    deletingTargetId,
    updatingTargetId,
    reloadTargets: loadTargets,
    saveTarget,
    deleteTarget,
    updateTargetApprovalStatus,
  };
}
