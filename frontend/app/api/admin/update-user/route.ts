import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function PUT(request: Request) {
  const { userId, email, firstname, lastname, phone, role } =
    await request.json();

  // Get the current authenticated user (the one making the modification)
  const supabase = await createServerClient();
  const { data: { user: currentUser }, error: authCheckError } = await supabase.auth.getUser();

  if (authCheckError || !currentUser) {
    return NextResponse.json(
      { error: "Unauthorized. You must be logged in to update users." },
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

  // Update the user in auth.users if email changed
  if (email) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        email: email,
        phone: phone,
        user_metadata: {
          display_name: `${firstname} ${lastname}`,
        },
      }
    );

    if (authError) {
      console.error("Supabase auth error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
  }

  // Update the corresponding row in public.users
  const { error: profileError } = await supabaseAdmin
    .from("users")
    .update({
      first_name: firstname,
      last_name: lastname,
      phone: phone,
      email: email,
      role: role,
      modified_by: currentUser.id, // Track who modified the user
      modified_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (profileError) {
    console.error("Error updating user profile:", profileError);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "User updated successfully.",
  });
}
