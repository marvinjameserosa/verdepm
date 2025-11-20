import { NextResponse } from "next/server";
import {
  createClient as createServerClient,
  createAdminClient,
} from "@/lib/supabase/server";

type OrganizationMemberRow = {
  organization_id: string | null;
  user_id: string | null;
  role: string | null;
};

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user: currentUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !currentUser) {
    return NextResponse.json(
      { error: "Unauthorized. You must be logged in to view members." },
      { status: 401 }
    );
  }

  const supabaseAdmin = createAdminClient();

  const {
    data: requesterMemberships,
    error: requesterMembershipError,
  } = await supabaseAdmin
    .from("organization_member")
    .select("organization_id")
    .eq("user_id", currentUser.id);

  if (requesterMembershipError) {
    console.error(
      "Failed to resolve requester organization:",
      requesterMembershipError
    );
    return NextResponse.json(
      { error: "Unable to determine your organization membership." },
      { status: 500 }
    );
  }

  const resolvedMembership = (requesterMemberships ?? []).find(
    (membership) => typeof membership?.organization_id === "string"
  );

  if (!resolvedMembership?.organization_id) {
    return NextResponse.json(
      { error: "No organization membership found for this account." },
      { status: 403 }
    );
  }

  const organizationId = resolvedMembership.organization_id;

  const {
    data: organizationMembers,
    error: organizationMembersError,
  } = await supabaseAdmin
    .from("organization_member")
    .select("user_id, role")
    .eq("organization_id", organizationId);

  if (organizationMembersError) {
    console.error(
      "Failed to load organization memberships:",
      organizationMembersError
    );
    return NextResponse.json(
      { error: "Unable to load members for your organization." },
      { status: 500 }
    );
  }

  const memberRows = (organizationMembers ?? []).filter(
    (row): row is OrganizationMemberRow =>
      typeof row.user_id === "string" && row.user_id.length > 0
  );

  const memberIds = memberRows.map((row) => row.user_id!);

  if (memberIds.length === 0) {
    return NextResponse.json({ members: [] });
  }

  const {
    data: users,
    error: usersError,
  } = await supabaseAdmin
    .from("users")
    .select("*")
    .in("user_id", memberIds);

  if (usersError) {
    console.error("Failed to load users:", usersError);
    return NextResponse.json(
      { error: "Unable to load member profiles." },
      { status: 500 }
    );
  }

  const roleByUserId = new Map(
    memberRows.map((row) => [row.user_id!, row.role ?? null])
  );

  const membersWithRoles = (users ?? []).map((user) => ({
    ...user,
    role: roleByUserId.get(user.user_id) ?? user.role ?? "member",
  }));

  return NextResponse.json({ members: membersWithRoles });
}

