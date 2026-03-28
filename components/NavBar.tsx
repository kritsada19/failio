"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

function NavBar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
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

        {/* Menu */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/"
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
          >
            Home
          </Link>

          {session?.user.role === "ADMIN" ? (
            <Link
              href="/admin"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
            >
              My Failure
            </Link>
          )}

          {session?.user.role === "ADMIN" ? (
            <>
              <Link
                href="/admin/users"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
              >
                Users
              </Link>
              <Link
                href="/admin/failures"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
              >
                Failures
              </Link>
              <Link
                href="/admin/categories"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
              >
                Categories
              </Link>
              <Link
                href="/admin/emotions"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
              >
                Emotions
              </Link>
            </>
          ) : undefined}
        </div>

        {/* Auth / Profile */}
        <div>
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
      </div>
    </nav>
  );
}

export default NavBar;