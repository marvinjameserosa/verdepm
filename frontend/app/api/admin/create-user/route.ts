import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password, phone, firstname, lastname, role } =
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

  // Use the admin client to invite a new user
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    phone: phone,
    email_confirm: true,
    user_metadata: {
      first_name: firstname,
      last_name: lastname,
      role: role,
    },
  });

  if (error) {
    console.error("Supabase admin error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    message: "User created successfully.",
    user: data.user,
  });
}
