"use client";
import { useEffect } from "react";
import { type Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client"; 

export function SessionLogger() {
  useEffect(() => {
    supabase.auth.getSession().then((response: { data: { session: Session | null } }) => {
      console.log("Current session:", response.data.session);
    });
  }, []);
  return null;
}
