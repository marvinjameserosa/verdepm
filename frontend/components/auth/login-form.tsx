"use client";

import type React from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, Mail, Lock } from "lucide-react";
import { Login } from "@/app/login/actions";
import { loginSchema } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginForm() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("message");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string[];
    password?: string[];
  }>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setIsLoading(false);
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    try {
      await Login(formData);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Error Message Alert */}
      {errorMessage && (
        <div
          className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg relative flex items-start gap-3 animate-in slide-in-from-top-1"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-sm font-semibold text-gray-700 dark:text-gray-200"
        >
          Email address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            required
            disabled={isLoading}
            className={`pl-11 h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500 transition-all ${
              errors.email
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
          />
        </div>
        {errors.email && (
          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">{errors.email[0]}</p>
          </div>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="password"
            className="text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Password
          </Label>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
            disabled={isLoading}
            className={`pl-11 h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500 transition-all ${
              errors.password
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
          />
        </div>
        {errors.password && (
          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">{errors.password[0]}</p>
          </div>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            disabled={isLoading}
            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
          <label
            htmlFor="remember"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
          >
            Remember me
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/40"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
