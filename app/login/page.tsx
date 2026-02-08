import type { Metadata } from "next";
import { LoginPageContent } from "@/components/auth/LoginPageContent";

export const metadata: Metadata = {
  title: "VerdePM - Login",
};

export default function LoginPage() {
  return <LoginPageContent />;
}
