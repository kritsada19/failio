"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await axios.post("/api/auth/forgot-password", { email });
      alert("Please check your email");
    } catch {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-2">
          Forgot Password
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-black text-white py-2.5 rounded-lg hover:opacity-90 transition cursor-pointer"
        >
          Send Reset Link
        </button>

        <div className="mt-5 text-center">
          <Link
            href="/sign-in"
            className="text-sm text-blue-600 hover:underline transition"
          >
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}