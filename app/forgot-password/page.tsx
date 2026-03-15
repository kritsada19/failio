"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setMessage("");
    setError("");

    try {
      setLoading(true);

      await axios.post("/api/auth/forgot-password", {
        email: email.trim(),
      });

      setMessage("Please check your email for the reset link.");
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
            <Mail className="w-8 h-8 text-gray-700" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-2">
          Forgot Password
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6 leading-6">
          Enter your email address and we&apos;ll send you a password reset link.
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

        {message && (
          <p className="mt-4 text-sm text-green-600 text-center leading-6">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center leading-6">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-black text-white py-2.5 rounded-lg hover:opacity-90 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send Reset Link"}
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