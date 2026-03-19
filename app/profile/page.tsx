"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { useSession, signOut } from "next-auth/react";
import ProfileAvatar from "@/components/ProfileAvatar";
import { Mail, CalendarDays, User2, LogOut } from "lucide-react";

interface UserProfile {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    createdAt: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const { data: user, loading, error } = useFetch<UserProfile>(`/api/user/${session?.user?.id}`);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/sign-in");
        }
    }, [status, router]);

    if (status === "loading" || loading) {
        return (
            <main className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-800" />
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
                    <User2 className="mx-auto h-8 w-8 text-red-500 mb-3" />
                    <h2 className="text-lg font-semibold text-red-800 mb-1">Failed to Load Profile</h2>
                    <p className="text-sm text-red-600 px-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-xl text-sm transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </main>
        );
    }

    if (!session?.user || !user) return null;

    const joinedDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "-";

    return (
        <main className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 px-4 py-10 sm:py-14">
            <div className="mx-auto max-w-3xl">
                {/* Header */}
                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-500">Account</p>
                    <h1 className="text-3xl font-semibold text-gray-900">Your Profile</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Manage your basic account information in Failio.
                    </p>
                </div>

                {/* Profile Card */}
                <div className="overflow-hidden rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-gray-100">
                    {/* Banner */}
                    <div className="h-28 bg-linear-to-r from-gray-800 via-black to-gray-900" />

                    <div className="px-6 sm:px-8 pb-8">
                        {/* Avatar */}
                        <div className="-mt-14 mb-5">
                            <div className="inline-block rounded-full ring-4 ring-white shadow-md">
                                <ProfileAvatar name={user.name} size="xl" />
                            </div>
                        </div>

                        {/* Main Info */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 truncate">
                                {user.name ?? "Unnamed User"}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 truncate">
                                {user.email ?? "No email"}
                            </p>
                        </div>

                        {/* Info Section */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <InfoCard
                                icon={<User2 className="w-5 h-5 text-gray-700" />}
                                label="Name"
                                value={user.name ?? "-"}
                            />
                            <InfoCard
                                icon={<Mail className="w-5 h-5 text-gray-700" />}
                                label="Email"
                                value={user.email ?? "-"}
                            />
                            <InfoCard
                                icon={<CalendarDays className="w-5 h-5 text-gray-700" />}
                                label="Joined"
                                value={joinedDate}
                            />
                        </div>

                        {/* Optional small note */}
                        <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                            <p className="text-sm text-gray-500">
                                Your profile helps personalize your Failio experience and keeps
                                your account information organized.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function InfoCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                    {icon}
                </div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
            </div>

            <p className="text-sm font-semibold text-gray-900 truncate" title={value}>{value}</p>
        </div>
    );
}