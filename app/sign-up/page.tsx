'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FaGoogle, FaFacebook, FaGithub } from "react-icons/fa";
import axios from 'axios'
import Link from 'next/link'

export default function SignUp() {
    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')

        // กัน submit รัว
        if (loading) return

        // เช็คก่อนยิง API ฝั่ง client (UX ดีขึ้น)
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        try {
            setLoading(true)

            const response = await axios.post('/api/auth/sign-up', {
                name: name.trim(),
                email: email.trim(),
                password,
                confirmPassword,
            })

            if (response.status === 201) {
                router.push('/check-email')
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const status = err.response?.status
                const data = err.response?.data
                const message =
                    data && typeof data === 'object' && 'message' in data && typeof (data as { message?: unknown }).message === 'string'
                        ? (data as { message?: string }).message
                        : undefined

                if (status === 409) {
                    setError(message || 'Email already exists.')
                    return
                }

                if (status === 400) {
                    setError(message || 'Invalid input.')
                    return
                }

                setError(message || 'Something went wrong. Please try again.')
            } else {
                setError('Something went wrong. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-100"
            >
                <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                    Create Your Failio Account
                </h1>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-600">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                            placeholder="your name"
                        />
                    </div>

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

                    <div>
                        <label className="text-sm text-gray-600">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                    disabled={loading}
                    className="w-full mt-6 bg-black text-white py-2.5 rounded-lg hover:opacity-90 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating account...' : 'Sign Up'}
                </button>

                <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="px-3 text-sm text-gray-400">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                        className="w-full flex items-center justify-center gap-3 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    >
                        <FaGoogle size={18} />
                        Continue with Google
                    </button>

                    <button
                        type="button"
                        onClick={() => signIn('facebook', { callbackUrl: '/dashboard' })}
                        className="w-full flex items-center justify-center gap-3 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    >
                        <FaFacebook size={18} />
                        Continue with Facebook
                    </button>

                    <button
                        type="button"
                        onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
                        className="w-full flex items-center justify-center gap-3 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    >
                        <FaGithub size={18} />
                        Continue with GitHub
                    </button>

                    <div>
                        <p className="text-sm text-gray-600 text-center">
                            Already have an account?{" "}
                            <Link
                                href="/sign-in"
                                className="text-blue-600 hover:underline transition"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </form>
        </div>
    )
}