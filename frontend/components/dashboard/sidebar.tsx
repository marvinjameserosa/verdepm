"use client"

import type { ReactNode } from "react"
import {
  BarChart2,
  Receipt,
  Building2,
  CreditCard,
  Folder,
  Wallet,
  Users2,
  Shield,
  MessagesSquare,
  Video,
  Settings,
  HelpCircle,
  Menu,
  Home,
} from "lucide-react"

import Link from "next/link"
import { useState } from "react"
import Image from "next/image"

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  function handleNavigation() {
    setIsMobileMenuOpen(false)
  }

  function NavItem({
    href,
    icon: Icon,
    children,
  }: {
    href: string
    icon: typeof Home
    children: ReactNode
  }) {
    return (
      <Link
        href={href}
        onClick={handleNavigation}
        className="flex items-center px-3 py-2 text-sm rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
      >
        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
        {children}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white dark:bg-[#0F0F12] shadow-md"
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Sidebar */}
      <nav
        className={`fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-[#0F0F12] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:w-64 border-r border-gray-200 dark:border-[#1F1F23] ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <Link
            href="https://kokonutui.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-16 items-center gap-3 border-b border-gray-200 px-6 dark:border-[#1F1F23]"
          >
            <Image
              src="https://kokonutui.com/logo.svg"
              alt="KokonutUI"
              width={32}
              height={32}
              className="hidden flex-shrink-0 dark:block"
            />
            <Image
              src="https://kokonutui.com/logo-black.svg"
              alt="KokonutUI"
              width={32}
              height={32}
              className="block flex-shrink-0 dark:hidden"
            />
            <span className="text-lg font-semibold text-gray-900 hover:cursor-pointer dark:text-white">KokonutUI</span>
          </Link>

          {/* Navigation groups */}
          <div className="flex-grow overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Overview */}
              <div>
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Overview
                </p>
                <div className="space-y-1">
                  <NavItem href="/dashboard" icon={Home}>
                    Dashboard
                  </NavItem>
                  <NavItem href="/analytics" icon={BarChart2}>
                    Analytics
                  </NavItem>
                  <NavItem href="#" icon={Building2}>
                    Organization
                  </NavItem>
                  <NavItem href="#" icon={Folder}>
                    Projects
                  </NavItem>
                </div>
              </div>

              {/* Finance */}
              <div>
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Finance
                </p>
                <div className="space-y-1">
                  <NavItem href="#" icon={Wallet}>
                    Transactions
                  </NavItem>
                  <NavItem href="#" icon={Receipt}>
                    Invoices
                  </NavItem>
                  <NavItem href="#" icon={CreditCard}>
                    Payments
                  </NavItem>
                </div>
              </div>

              {/* Team */}
              <div>
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Team
                </p>
                <div className="space-y-1">
                  <NavItem href="#" icon={Users2}>
                    Members
                  </NavItem>
                  <NavItem href="#" icon={Shield}>
                    Permissions
                  </NavItem>
                  <NavItem href="#" icon={MessagesSquare}>
                    Chat
                  </NavItem>
                  <NavItem href="#" icon={Video}>
                    Meetings
                  </NavItem>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-4 dark:border-[#1F1F23]">
            <div className="space-y-1">
              <NavItem href="#" icon={Settings}>
                Settings
              </NavItem>
              <NavItem href="#" icon={HelpCircle}>
                Help
              </NavItem>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          role="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-[65] bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
