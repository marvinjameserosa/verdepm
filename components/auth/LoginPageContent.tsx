"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/ui/logo";
import { LoginForm } from "@/components/auth/login-form";
import { Background } from "@/components/ui/background";

export function LoginPageContent() {
    return (
        <Background className="flex min-h-screen items-center justify-center">
            {/* Main Container - Responsive Grid Layout */}
            <div className="w-full min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo Section */}
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <Logo className="scale-110 sm:scale-125" />
                        </div>
                    </div>

                    {/* Login Card */}
                    <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-emerald-500/5 overflow-hidden">
                        {/* Card Header */}
                        <div className="px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6 text-center border-b border-gray-200/50 dark:border-gray-700/50">
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                                Welcome Back
                            </h1>
                            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                                Sign in to your VerdePM account
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
                                <LoginForm />
                            </Suspense>
                        </div>
                    </div>

                    {/* Terms and Privacy */}
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground leading-relaxed px-4">
                            By signing in, you agree to our{" "}
                            <Link
                                href="/terms"
                                className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors underline underline-offset-2"
                            >
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link
                                href="/privacy"
                                className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors underline underline-offset-2"
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
