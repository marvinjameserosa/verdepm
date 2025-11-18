import { createAdminClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await request.json();

  if (!userId) {
    return new NextResponse("User ID is required", { status: 400 });
  }

  const supabase = createAdminClient();

  // First, delete from public.users table
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

  // Then, delete from auth.users
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    // If the user is already deleted from auth, we don't consider it an error
    if (authError.message !== "User not found") {
      return new NextResponse(`Error deleting user: ${authError.message}`, {
        status: 500,
      });
    }
  }

  return new NextResponse("User deleted successfully", { status: 200 });
}
