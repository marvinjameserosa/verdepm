import { NextResponse } from "next/server";
import {
  createClient as createServerClient,
  createAdminClient,
} from "@/lib/supabase/server";

type MembershipRow = {
  role: string | null;
};

export async function GET() {
  const supabase = await createServerClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: authError?.message ?? "You must be signed in." },
      { status: authError ? 500 : 401 }
    );
  }

  const [
    { data: userProfile, error: profileError },
    { data: memberships, error: membershipError },
  ] = await Promise.all([
    adminSupabase
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    adminSupabase
      .from("organization_member")
      .select("role")
      .eq("user_id", user.id),
  ]);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (membershipError) {
    return NextResponse.json(
      { error: membershipError.message },
      { status: 500 }
    );
  }

  const membershipList = (memberships ?? []) as MembershipRow[];

  const membershipRoleCandidates = membershipList
    .map((row) => (typeof row?.role === "string" ? row.role.trim() : null))
    .filter((role): role is string => Boolean(role));

  const membershipRole =
    membershipRoleCandidates.find((role) => role.toLowerCase() === "owner") ??
    membershipRoleCandidates[0] ??
    null;

  return NextResponse.json({
    user,
    profile: userProfile,
    membershipRole,
  });
}
