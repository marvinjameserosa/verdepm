import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { LoginForm } from "@/components/auth/login-form";
import { Background } from "@/components/ui/background";

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
                Welcome back
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Sign in to your VerdePM account
              </p>
            </div>

            {/* Login Form */}
            <div className="space-y-4 sm:space-y-6">
              <LoginForm />

              {/* Divider */}
              <div className="relative my-6 sm:my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 sm:px-4 bg-white/80 dark:bg-gray-900/80 text-muted-foreground rounded-full">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button className="group relative w-full inline-flex justify-center items-center py-2.5 sm:py-3 px-3 sm:px-4 border border-emerald-200/50 rounded-xl sm:rounded-2xl shadow-sm bg-white/50 dark:bg-gray-800/50 text-sm font-medium text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:border-emerald-300 transition-all duration-300 transform hover:scale-[1.02]">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="ml-2 text-xs sm:text-sm">Google</span>
                </button>

                <button className="group relative w-full inline-flex justify-center items-center py-2.5 sm:py-3 px-3 sm:px-4 border border-emerald-200/50 rounded-xl sm:rounded-2xl shadow-sm bg-white/50 dark:bg-gray-800/50 text-sm font-medium text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:border-emerald-300 transition-all duration-300 transform hover:scale-[1.02]">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.001 2C6.47598 2 2.00098 6.475 2.00098 12C2.00098 16.425 4.86348 20.1625 8.83848 21.4875C9.33848 21.575 9.52598 21.275 9.52598 21.0125C9.52598 20.775 9.51348 19.9875 9.51348 19.15C7.00098 19.6125 6.35098 18.5375 6.15098 17.975C6.03848 17.6875 5.55098 16.8 5.12598 16.5625C4.77598 16.375 4.27598 15.9125 5.11348 15.9C5.90098 15.8875 6.46348 16.625 6.65098 16.925C7.55098 18.4375 8.98848 18.0125 9.56348 17.75C9.65098 17.1 9.91348 16.6625 10.201 16.4125C7.97598 16.1625 5.65098 15.3 5.65098 11.475C5.65098 10.3875 6.03848 9.4875 6.67598 8.7875C6.57598 8.5375 6.22598 7.5125 6.77598 6.1375C6.77598 6.1375 7.61348 5.875 9.52598 7.1625C10.326 6.9375 11.176 6.825 12.026 6.825C12.876 6.825 13.726 6.9375 14.526 7.1625C16.4385 5.8625 17.276 6.1375 17.276 6.1375C17.826 7.5125 17.476 8.5375 17.376 8.7875C18.0135 9.4875 18.401 10.375 18.401 11.475C18.401 15.3125 16.0635 16.1625 13.8385 16.4125C14.201 16.725 14.5135 17.325 14.5135 18.2625C14.5135 19.6 14.501 20.675 14.501 21.0125C14.501 21.275 14.6885 21.5875 15.1885 21.4875C19.259 20.1133 21.9999 16.2963 22.001 12C22.001 6.475 17.526 2 12.001 2Z" />
                  </svg>
                  <span className="ml-2 text-xs sm:text-sm">GitHub</span>
                </button>
              </div>

              {/* Sign up link */}
              <div className="text-center mt-6 sm:mt-8">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
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
