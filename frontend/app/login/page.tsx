import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-6 md:p-12 lg:justify-center bg-black">
        <div className="flex justify-center md:justify-start items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-white text-xl">
            <div className="bg-emerald-500 text-black flex h-10 w-10 items-center justify-center rounded-md shadow-md">
              <GalleryVerticalEnd className="h-5 w-5" />
            </div>
            VerdePM
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md bg-gray-900/90 p-8 rounded-2xl shadow-xl ring-1 ring-emerald-400/20 backdrop-blur-sm">
            <h2 className="text-2xl font-extrabold text-white mb-2 text-center">Welcome Back</h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              Sign in to continue to your sustainable project dashboard
            </p>
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <Image
          src="https://www.greencareershub.com/app/uploads/2023/05/construction-sector.jpg"
          alt="Sustainable construction site"
          fill
          className="absolute inset-0 h-full w-full object-cover brightness-50 contrast-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
          <h3 className="text-3xl font-bold mb-3 text-balance">Building Sustainably. Managing Intelligently.</h3>
          <p className="text-lg text-gray-200 max-w-lg text-pretty">
            Transform construction project management through data-driven ESG tracking — unifying environmental, social,
            and governance performance into one intelligent system.
          </p>
        </div>
      </div>
    </div>
  )
}
