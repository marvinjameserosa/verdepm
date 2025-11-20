import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, password, firstname, lastname, phone, role } =
    await request.json();

  // Get the current authenticated user
  const supabase = await createServerClient();
  const {
    data: { user: currentUser },
    error: authCheckError,
  } = await supabase.auth.getUser();

  if (authCheckError || !currentUser) {
    return NextResponse.json(
      { error: "Unauthorized. You must be logged in to create users." },
      { status: 401 }
    );
  }

  // Ensure environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Supabase environment variables are not set." },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const {
    data: inviterMemberships,
    error: inviterMembershipError,
  } = await supabaseAdmin
    .from("organization_member")
    .select("organization_id, role")
    .eq("user_id", currentUser.id);

  if (inviterMembershipError) {
    console.error(
      "Failed to resolve inviter organization",
      inviterMembershipError
    );
    return NextResponse.json(
      { error: "Unable to determine organization for the new member." },
      { status: 500 }
    );
  }

  const ownerMembership = (inviterMemberships ?? []).find((membership) => {
    const role =
      typeof membership?.role === "string"
        ? membership.role.toLowerCase()
        : "";
    return (
      role === "owner" && typeof membership?.organization_id === "string"
    );
  });

  if (!ownerMembership?.organization_id) {
    return NextResponse.json(
      {
        error:
          "Only organization owners can invite members. No owner organization found for this account.",
      },
      { status: 403 }
    );
  }

  const organizationId = ownerMembership.organization_id;

  // Step 1: Create the user in auth.users
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      phone: phone,
      email_confirm: true,
      user_metadata: {
        display_name: `${firstname} ${lastname}`,
      },
    });

  if (authError) {
    console.error("Supabase auth error:", authError);
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  if (!authData.user) {
    return NextResponse.json(
      { error: "User could not be created." },
      { status: 500 }
    );
  }

  // Step 2: Create the corresponding row in public.users
  const { error: profileError } = await supabaseAdmin.from("users").insert({
    user_id: authData.user.id,
    first_name: firstname,
    last_name: lastname,
    phone: phone,
    email: email,
    created_by: currentUser.id,
    modified_by: currentUser.id,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
    organization_id: organizationId,
  });

  if (profileError) {
    console.error("Error creating user profile:", profileError);
    // If profile creation fails, delete the auth user to roll back
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const { error: organizationMemberError } = await supabaseAdmin
    .from("organization_member")
    .insert({
      organization_id: organizationId,
      user_id: authData.user.id,
      role,
    });

  if (organizationMemberError) {
    console.error(
      "Error assigning user to organization:",
      organizationMemberError
    );
    await supabaseAdmin.from("users").delete().eq("user_id", authData.user.id);
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json(
      { error: organizationMemberError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "User created successfully.",
    user: authData.user,
  });
}
