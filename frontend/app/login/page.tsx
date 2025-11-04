import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/ui/logo";
import { LoginForm } from "@/components/auth/login-form";
import { Background } from "@/components/ui/background";

export const metadata: Metadata = {
  title: "VerdePM - Login",
};

export default function LoginPage() {
  return (
    <Background className="flex min-h-screen">
      {/* Login Form Container */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12 w-full max-w-md sm:max-w-lg mx-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="mb-8 lg:mb-12">
            <Logo />
          </div>

          {/* Modern Card Container */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl shadow-emerald-500/10 p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Sign in to your VerdePM account
              </p>
            </div>

            {/* Login Form */}
            <div className="space-y-4 sm:space-y-6">
              <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
              </Suspense>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center px-4 sm:px-0">
            <p className="text-xs text-muted-foreground leading-relaxed">
              By signing in, you agree to our{" "}
              <Link
                href="/terms"
                className="hover:text-emerald-600 transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="hover:text-emerald-600 transition-colors"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Background>
  );
}
