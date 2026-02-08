import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await request.json();

  if (!userId) {
    return new NextResponse("User ID is required", { status: 400 });
  }

  const supabase = createAdminClient();

  const {
    data: membershipRecords,
    error: membershipError,
  } = await supabase
    .from("organization_member")
    .select("organization_id, role, user_id")
    .eq("user_id", userId);

  if (membershipError) {
    return new NextResponse(
      `Error loading user membership: ${membershipError.message}`,
      { status: 500 }
    );
  }

  const ownerOrganizationIds = Array.from(
    new Set(
      (membershipRecords ?? [])
        .filter((record) => {
          const role =
            typeof record.role === "string" ? record.role.toLowerCase() : "";
          return role === "owner" && typeof record.organization_id === "string";
        })
        .map((record) => record.organization_id as string)
    )
  );

  if (ownerOrganizationIds.length > 0) {
    const {
      data: organizationMembers,
      error: organizationMembersError,
    } = await supabase
      .from("organization_member")
      .select("user_id")
      .in("organization_id", ownerOrganizationIds);

    if (organizationMembersError) {
      return new NextResponse(
        `Error loading organization members: ${organizationMembersError.message}`,
        { status: 500 }
      );
    }

    const memberUserIds = Array.from(
      new Set(
        (organizationMembers ?? [])
          .map((member) => member.user_id)
          .filter((value): value is string => typeof value === "string")
      )
    );

    if (!memberUserIds.includes(userId)) {
      memberUserIds.push(userId);
    }

    const { error: membershipDeleteError } = await supabase
      .from("organization_member")
      .delete()
      .in("organization_id", ownerOrganizationIds);

    if (membershipDeleteError) {
      return new NextResponse(
        `Error deleting organization memberships: ${membershipDeleteError.message}`,
        { status: 500 }
      );
    }

    if (memberUserIds.length > 0) {
      const { error: usersDeleteError } = await supabase
        .from("users")
        .delete()
        .in("user_id", memberUserIds);

      if (usersDeleteError) {
        return new NextResponse(
          `Error deleting organization users: ${usersDeleteError.message}`,
          { status: 500 }
        );
      }
    }

    const { error: organizationDeleteError } = await supabase
      .from("organizations")
      .delete()
      .in("id", ownerOrganizationIds);

    if (organizationDeleteError) {
      return new NextResponse(
        `Error deleting organization: ${organizationDeleteError.message}`,
        { status: 500 }
      );
    }

    const authErrors: string[] = [];

    for (const authUserId of memberUserIds) {
      const { error: authError } =
        await supabase.auth.admin.deleteUser(authUserId);
      if (authError && authError.message !== "User not found") {
        authErrors.push(
          `Error deleting auth user ${authUserId}: ${authError.message}`
        );
      }
    }

    if (authErrors.length > 0) {
      return new NextResponse(authErrors.join("; "), { status: 500 });
    }

    return new NextResponse(
      "Organization and related members deleted successfully",
      { status: 200 }
    );
  }

  const { error: membershipDeleteError } = await supabase
    .from("organization_member")
    .delete()
    .eq("user_id", userId);

  if (membershipDeleteError) {
    return new NextResponse(
      `Error deleting user membership: ${membershipDeleteError.message}`,
      { status: 500 }
    );
  }

  const { error: dbError } = await supabase
    .from("users")
    .delete()
    .eq("user_id", userId);

  if (dbError) {
    return new NextResponse(
      `Error deleting user from database: ${dbError.message}`,
      { status: 500 }
    );
  }

  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError && authError.message !== "User not found") {
    return new NextResponse(`Error deleting user: ${authError.message}`, {
      status: 500,
    });
  }

  return new NextResponse("User deleted successfully", { status: 200 });
}
