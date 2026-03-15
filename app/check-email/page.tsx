"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";

function CheckEmail() {
  const params = useSearchParams();
  const email = params.get("email");

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <MailCheck className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-800 mb-3">
          Check Your Email
        </h1>

        <p className="text-gray-600 leading-7 mb-2">
          We’ve sent a verification link to{" "}
          <span className="font-semibold text-gray-800">
            {email || "your email address"}
          </span>
          .
        </p>

        <p className="text-gray-600 leading-7 mb-4">
          Please open your inbox and click{" "}
          <span className="font-semibold text-gray-800">Verify Email</span>{" "}
          to activate your Failio account.
        </p>

        <p className="text-sm text-gray-500 mb-6">
          If you don’t see the email, please check your spam or promotions
          folder.
        </p>

        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center w-full bg-black text-white py-2.5 rounded-lg hover:opacity-90 transition"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}

export default CheckEmail;