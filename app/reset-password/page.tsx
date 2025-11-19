import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/ui/logo";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Background } from "@/components/ui/background";

export const metadata: Metadata = {
  title: "VerdePM - Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <Background className="flex min-h-screen items-center justify-center">
      <div className="w-full min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo Section */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Logo className="scale-110 sm:scale-125" />
            </div>
          </div>

          {/* Reset Password Card */}
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-emerald-500/5 overflow-hidden">
            {/* Card Header */}
            <div className="px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6 text-center border-b border-gray-200/50 dark:border-gray-700/50">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                Reset Password
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Enter your new password below
              </p>
            </div>

            {/* Card Content */}
            <div className="p-6 sm:p-8 lg:p-10">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                }
              >
                <ResetPasswordForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
}
