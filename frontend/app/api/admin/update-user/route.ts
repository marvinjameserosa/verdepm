import { NextResponse } from "next/server";
import {
  createClient as createServerClient,
  createAdminClient,
} from "@/utils/supabase/server";

export async function PUT(request: Request) {
  const { userId, email, firstname, lastname, phone, role } =
    await request.json();

  if (!userId) {
    return NextResponse.json(
      { error: "Missing user identifier." },
      { status: 400 }
    );
  }

  // Get the current authenticated user (the one making the modification)
  const supabase = await createServerClient();
  const {
    data: { user: currentUser },
    error: authCheckError,
  } = await supabase.auth.getUser();

  if (authCheckError || !currentUser) {
    return NextResponse.json(
      { error: "Unauthorized. You must be logged in to update users." },
      { status: 401 }
    );
  }

  const supabaseAdmin = createAdminClient();
  const shouldUpdateAuth = Boolean(email || phone || firstname || lastname);

  if (shouldUpdateAuth) {
    const displayName = [firstname, lastname].filter(Boolean).join(" ");
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
        ...(displayName
          ? {
              user_metadata: {
                display_name: displayName,
              },
            }
          : {}),
      }
    );

    if (authError) {
      console.error("Supabase auth error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
  }

  // Update the corresponding row in public.users
  const { data: updatedUser, error: profileError } = await supabaseAdmin
    .from("users")
    .update({
      first_name: firstname,
      last_name: lastname,
      phone,
      email,
      role,
      modified_by: currentUser.id, // Track who modified the user
      modified_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (profileError) {
    console.error("Error updating user profile:", profileError);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "User updated successfully.",
    user: updatedUser,
  });
}
