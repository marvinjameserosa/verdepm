"use server";

import { createClient } from "@/lib/supabase/server";
import { safeAsyncOperation } from "@/lib/errors";
import { Project } from "@/types/project";
import { mapProjectFromSupabase } from "@/components/dashboard/projects/project-helpers";

export async function getProjects(): Promise<{
  data: Project[] | null;
  error: string | null;
}> {
  return safeAsyncOperation(async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(authError.message);
    }

    if (!user) {
      throw new Error("You must be signed in to view projects.");
    }

    const { data: membershipRows, error: membershipError } = await supabase
      .from("organization_member")
      .select("organization_id, role")
      .eq("user_id", user.id);

    if (membershipError) {
      throw new Error(membershipError.message);
    }

    const membershipList = membershipRows ?? [];

    const ownerMembership = membershipList.find((membership) => {
      const role =
        typeof membership?.role === "string"
          ? membership.role.toLowerCase()
          : "";
      return (
        role === "owner" && typeof membership?.organization_id === "string"
      );
    });

    const firstMembershipWithOrganization = membershipList.find(
      (membership) => typeof membership?.organization_id === "string"
    );

    let organizationId =
      ownerMembership?.organization_id ??
      firstMembershipWithOrganization?.organization_id ??
      null;

    if (!organizationId) {
      const { data: userRecord, error: userRecordError } = await supabase
        .from("users")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userRecordError) {
        throw new Error(userRecordError.message);
      }

      if (userRecord?.organization_id) {
        organizationId = userRecord.organization_id as string;
      }
    }

    if (!organizationId) {
      return [] as Project[];
    }

    const { data: organizationRecord, error: organizationLookupError } =
      await supabase
        .from("organizations")
        .select("organization_id")
        .eq("organization_id", organizationId)
        .maybeSingle();

    if (organizationLookupError) {
      throw new Error(organizationLookupError.message);
    }

    if (!organizationRecord) {
      return [] as Project[];
    }

    const { data, error } = await supabase
      .from("projects")
      .select(
        "project_id, organization_id, project_name, slug, description, status, priority, category, client_name, location, budget, start_date, end_date, created_at, updated_at"
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(mapProjectFromSupabase);
  });
}
