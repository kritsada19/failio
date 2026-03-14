'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FaGoogle, FaFacebook, FaGithub } from "react-icons/fa";
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('');
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })

    if (result?.error) {
      setError(result.error)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Sign in to Your Failio Account
        </h1>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full mt-6 bg-black text-white py-2.5 rounded-lg hover:opacity-90 transition cursor-pointer"
        >
          Sign In
        </button>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3 text-sm text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/profile' })}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            <FaGoogle size={18} />
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => signIn('facebook', { callbackUrl: '/profile' })}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            <FaFacebook size={18} />
            Continue with Facebook
          </button>

          <button
            type="button"
            onClick={() => signIn('github', { callbackUrl: '/profile' })}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            <FaGithub size={18} />
            Continue with GitHub
          </button>

          <div>
            <p className="text-sm text-center">
              <Link href='/forgot-password' className='text-blue-600 hover:underline transition'>
                Forgot Password?
              </Link>
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 text-center">
              Don&apos;t have an account?{" "}
              <a
                href="/sign-up"
                className="text-blue-600 hover:underline transition"
              >
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}