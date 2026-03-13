"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function ResetPassword() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("/api/auth/reset-password", {
        token,
        password,
      });

      if (response.status === 201) {
        router.push('/sign-in')
      }

      alert("Password updated");
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
          Reset Password
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your new password below.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-black text-white py-2.5 rounded-lg hover:opacity-90 transition cursor-pointer"
        >
          Reset Password
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