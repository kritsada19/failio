import React from "react";
import Link from "next/link";

function CheckEmail() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">
          Check Your Email
        </h1>

        <p className="text-gray-600 mb-6">
          We’ve sent a verification link to your email address.  
          Please open your email and click <b>Verify Email</b> to activate your account.
        </p>

        <div className="text-sm text-gray-500 mb-6">
          If you don’t see the email, please check your spam folder.
        </div>

        <Link
          href="/sign-in"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}

export default CheckEmail;