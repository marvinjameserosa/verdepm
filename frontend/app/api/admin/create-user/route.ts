import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password, firstname, lastname, phone, role } =
    await request.json();

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
    role: role,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
  });

  if (profileError) {
    console.error("Error creating user profile:", profileError);
    // If profile creation fails, delete the auth user to roll back
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "User created successfully.",
    user: authData.user,
  });
}
