"use server";

import { createClient } from "@/lib/supabase/server";
import { safeAsyncOperation } from "@/lib/errors";
import { type Project } from "@/types/project";
import { mapProjectFromSupabase } from "@/components/dashboard/projects/project-helpers";
import type { AddProjectData } from "@/types/forms";

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function addProject(
  projectData: AddProjectData
): Promise<{ data: Project | null; error: string | null }> {
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
      throw new Error("You must be signed in to create a project.");
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

    let resolvedOrganizationId =
      ownerMembership?.organization_id ??
      firstMembershipWithOrganization?.organization_id ??
      null;

    let resolvedRole =
      typeof ownerMembership?.role === "string"
        ? ownerMembership.role.toLowerCase()
        : typeof firstMembershipWithOrganization?.role === "string"
        ? firstMembershipWithOrganization.role.toLowerCase()
        : null;

    if (!resolvedOrganizationId) {
      const { data: userRecord, error: userRecordError } = await supabase
        .from("users")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userRecordError) {
        throw new Error(userRecordError.message);
      }

      if (userRecord?.organization_id) {
        resolvedOrganizationId = userRecord.organization_id as string;
        resolvedRole = resolvedRole ?? "owner";
      }
    }

    if (!resolvedOrganizationId) {
      throw new Error("Unable to determine an organization for this account.");
    }

    const { data: organizationRecord, error: organizationLookupError } =
      await supabase
        .from("organizations")
        .select("organization_id, organization_name")
        .eq("organization_id", resolvedOrganizationId)
        .maybeSingle();

    if (organizationLookupError) {
      throw new Error(organizationLookupError.message);
    }

    if (!organizationRecord) {
      throw new Error("Organization not found for this account.");
    }

    const effectiveRole = resolvedRole ?? "owner";

    if (effectiveRole !== "owner" && effectiveRole !== "manager") {
      throw new Error(
        "Only organization owners or managers can create new projects."
      );
    }

    const slug = slugify(projectData.name);
    if (!slug) {
      throw new Error(
        "Project name must contain at least one alphanumeric character."
      );
    }

    const budgetValue = projectData.budget ? Number(projectData.budget) : null;
    if (budgetValue !== null && Number.isNaN(budgetValue)) {
      throw new Error("Budget must be a number.");
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          project_name: projectData.name.trim(),
          slug,
          description: (projectData.description || "").trim() || null,
          status: projectData.status,
          priority: projectData.priority,
          client_name: (projectData.clientName || "").trim() || null,
          category: projectData.category || null,
          budget: budgetValue,
          location: (projectData.location || "").trim() || null,
          organization_id: resolvedOrganizationId,
          start_date: projectData.startDate || null,
          end_date: projectData.endDate || null,
        },
      ])
      .select(
        "project_id, organization_id, project_name, slug, description, status, priority, category, client_name, location, budget, created_at, updated_at, start_date, end_date"
      )
      .single();

    if (error) {
      throw error;
    }

    return mapProjectFromSupabase(data);
  });
}
