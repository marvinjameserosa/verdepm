"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/hooks/auth/useLogin";
import { usePasswordVisibility } from "@/hooks/auth/usePasswordVisibility";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal";

export function LoginForm() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { authError, isLoading, errors, handleSubmit } = useLogin();
  const { showPassword, togglePassword } = usePasswordVisibility();

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {/* Error Message Alert */}
      {authError && (
        <div
          className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg relative flex items-start gap-2 sm:gap-3 animate-in slide-in-from-top-1"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
          <span className="text-xs sm:text-sm font-medium">{authError}</span>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-1.5 sm:space-y-2">
        <Label
          htmlFor="email"
          className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200"
        >
          Email address
        </Label>
        <div className="relative">
          <Mail className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            required
            disabled={isLoading}
            className={`pl-9 sm:pl-11 h-10 sm:h-11 text-sm sm:text-base bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500 transition-all ${
              errors.email
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
          />
        </div>
        {errors.email && (
          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <p className="text-xs sm:text-sm font-medium">{errors.email[0]}</p>
          </div>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="password"
            className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Password
          </Label>
        </div>
        <div className="relative">
          <Lock className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            required
            disabled={isLoading}
            className={`pl-9 sm:pl-11 pr-9 sm:pr-11 h-10 sm:h-11 text-sm sm:text-base bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500 transition-all ${
              errors.password
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
          />
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
            disabled={isLoading}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <p className="text-xs sm:text-sm font-medium">
              {errors.password[0]}
            </p>
          </div>
        )}
      </div>

      {/* Forgot Password */}
      <button
        type="button"
        onClick={() => setShowForgotPassword(true)}
        className="text-xs sm:text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors focus:outline-none"
      >
        Forgot password?
      </button>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-10 sm:h-11 text-sm sm:text-base bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
    </form>
  );
}
