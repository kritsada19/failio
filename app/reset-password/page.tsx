"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export default function ResetPassword() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("/api/auth/reset-password", {
        token,
        password,
      });

      if (response.status === 200 || response.status === 201) {
        setSuccess("Password updated successfully. Redirecting to Sign In...");

        setTimeout(() => {
          router.push("/sign-in");
        }, 1500);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        const message =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof (data as { message?: unknown }).message === "string"
            ? (data as { message?: string }).message
            : undefined;

        setError(message || "Something went wrong. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 p-4 rounded-full">
            <LockKeyhole className="w-8 h-8 text-gray-700" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-2">
          Reset Password
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your new password below to secure your Failio account.
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

        {success && (
          <p className="mt-4 text-sm text-green-600 text-center">{success}</p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-black text-white py-2.5 rounded-lg hover:opacity-90 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Reset Password"}
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