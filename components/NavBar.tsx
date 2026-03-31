"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";

function NavBar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const isAdmin = session?.user.role === "ADMIN";

  const renderNavLinks = (className?: string) => (
    <>
      <Link
        href="/"
        className={className || "rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"}
        onClick={() => setIsOpen(false)}
      >
        Home
      </Link>

      {isAdmin ? (
        <Link
          href="/admin"
          className={className || "rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"}
          onClick={() => setIsOpen(false)}
        >
          Dashboard
        </Link>
      ) : (
        <>
          <Link
            href="/dashboard"
            className={className || "rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"}
            onClick={() => setIsOpen(false)}
          >
            My Failures
          </Link>
          <Link
            href="/dashboard/analytics"
            className={className || "rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"}
            onClick={() => setIsOpen(false)}
          >
            Growth Insights
          </Link>
        </>
      )}

      {isAdmin && (
        <>
          <Link
            href="/admin/users"
            className={className || "rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"}
            onClick={() => setIsOpen(false)}
          >
            Users
          </Link>
          <Link
            href="/admin/failures"
            className={className || "rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"}
            onClick={() => setIsOpen(false)}
          >
            Failures
          </Link>
          <Link
            href="/admin/categories"
            className={className || "rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"}
            onClick={() => setIsOpen(false)}
          >
            Categories
          </Link>
          <Link
            href="/admin/emotions"
            className={className || "rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"}
            onClick={() => setIsOpen(false)}
          >
            Emotions
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-100 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-nav.png"
            alt="Failio logo"
            width={120}
            height={120}
            className="h-auto w-27.5 sm:w-31.5"
            priority
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-2 md:flex">
          {renderNavLinks()}
        </div>

        {/* Auth / Profile & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center sm:flex">
            {session ? (
              <Link
                href="/profile"
                className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
              >
                Profile
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/sign-in"
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
                >
                  Sign In
                </Link>

                <Link
                  href="/sign-up"
                  className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-orange-600"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[-1] bg-black/20 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Container */}
      <div
        className={`fixed left-0 top-[61px] h-[calc(100vh-61px)] w-full overflow-y-auto bg-white transition-all duration-300 ease-in-out md:hidden ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
          }`}
      >
        <div className="flex flex-col gap-2 p-6">
          <div className="mb-4 flex flex-col gap-2">
            <span className="px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Navigation
            </span>
            {renderNavLinks("block rounded-xl px-4 py-3 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-orange-600")}
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-slate-100">
            {session ? (
              <Link
                href="/profile"
                className="flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-base font-medium text-white shadow-sm transition-all active:scale-95"
                onClick={() => setIsOpen(false)}
              >
                Profile Settings
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-base font-medium text-slate-600 transition-all hover:bg-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
