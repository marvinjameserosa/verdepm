import { supabase } from "@/lib/supabase/client";
import type { User } from "@/types/user";

export async function fetchMembers(): Promise<User[]> {
  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    throw error;
  }

  return (data as User[]) ?? [];
}
