"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client"; // adjust path if needed

export function SessionLogger() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Current session:", session);
    });
  }, []);
  return null;
}
