"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { useSession, signOut } from "next-auth/react";
import ProfileAvatar from "@/components/ProfileAvatar";
import { Mail, CalendarDays, User2, LogOut, ShieldCheck, CreditCard, AlertCircle } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
import { useState } from "react";

interface UserProfile {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    createdAt: string;
    plan: "FREE" | "PRO";
    stripeStatus?: string;
    stripeCurrentPeriodEnd: string | null;
}

export default function ProfilePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const t = useTranslations('Profile');
    const tSub = useTranslations('Subscription');
    const locale = useLocale();

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    const { data: user, loading, error } = useFetch<UserProfile>(`/api/me`);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/sign-in");
        }
    }, [status, router]);

    const handleCancelSubscription = async () => {
        setCancelLoading(true);
        try {
            const response = await fetch("/api/subscription/cancel", {
                method: "POST",
            });
            if (response.ok) {
                setShowCancelModal(false);
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Failed to cancel subscription");
            }
        } catch (error) {
            console.error("Error canceling subscription:", error);
            alert("An unexpected error occurred. Please try again.");
        } finally {
            setCancelLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <main className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center transition-colors duration-500">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 dark:border-slate-800 border-t-gray-800 dark:border-t-slate-100" />
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center transition-colors duration-500">
                <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-6 text-center shadow-sm">
                    <User2 className="mx-auto h-8 w-8 text-red-500 mb-3" />
                    <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-1">{t('failedLoad')}</h2>
                    <p className="text-sm text-red-600 dark:text-red-400 px-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-medium rounded-xl text-sm transition-colors"
                    >
                        {t('tryAgain')}
                    </button>
                </div>
            </main>
        );
    }

    if (!session?.user || !user) return null;

    const joinedDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "-";

    return (
        <main className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-10 sm:py-14 transition-colors duration-500">
            <div className="mx-auto max-w-3xl">
                {/* Header */}
                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-500">{t('accountTag')}</p>
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-slate-100">{t('title')}</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                        {t('desc')}
                    </p>
                </div>

                {/* Profile Card */}
                <div className="overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl border border-gray-100 dark:border-slate-800">
                    {/* Banner */}
                    <div className="h-28 bg-linear-to-r from-gray-800 dark:from-slate-800 via-black to-gray-900 dark:to-slate-950" />

                    <div className="px-6 sm:px-8 pb-8">
                        {/* Avatar */}
                        <div className="-mt-14 mb-5">
                            <div className="inline-block rounded-full ring-4 ring-white dark:ring-slate-900 shadow-md">
                                <ProfileAvatar name={user.name} size="xl" />
                            </div>
                        </div>

                        {/* Main Info */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 truncate">
                                {user.name ?? t('unnamedUser')}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 truncate">
                                {user.email ?? t('noEmail')}
                            </p>
                        </div>

                        {/* Info Section */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <InfoCard
                                icon={<User2 className="w-5 h-5 text-gray-700 dark:text-slate-300" />}
                                label={t('nameLabel')}
                                value={user.name ?? "-"}
                            />
                            <InfoCard
                                icon={<Mail className="w-5 h-5 text-gray-700 dark:text-slate-300" />}
                                label={t('emailLabel')}
                                value={user.email ?? "-"}
                            />
                            <InfoCard
                                icon={<CalendarDays className="w-5 h-5 text-gray-700 dark:text-slate-300" />}
                                label={t('joinedLabel')}
                                value={joinedDate}
                            />
                        </div>

                        {/* Subscription Section */}
                        <div className="mt-8">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-500 mb-4">{t('subscriptionSection')}</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <InfoCard
                                    icon={<ShieldCheck className="w-5 h-5 text-gray-700 dark:text-slate-300" />}
                                    label={t('planLabel')}
                                    value={user.plan === "PRO" ? t('planPro') : t('planFree')}
                                />
                                {user.stripeCurrentPeriodEnd && (
                                    <InfoCard
                                        icon={<CreditCard className="w-5 h-5 text-gray-700 dark:text-slate-300" />}
                                        label={t('expiresLabel')}
                                        value={new Date(user.stripeCurrentPeriodEnd).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    />
                                )}
                            </div>

                            {user.plan === "PRO" && user.stripeStatus !== "canceled" && (
                                <div className="mt-4 flex justify-start">
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors duration-200"
                                    >
                                        {tSub("cancelSubscription")}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Optional small note */}
                        <div className="mt-6 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 px-4 py-3">
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                                {t('profileNote')}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/10 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                <LogOut className="h-4 w-4" />
                                {t('signOutBtn')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
                        onClick={() => !cancelLoading && setShowCancelModal(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-md scale-100 transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 transition-all duration-300">
                        <div className="text-center">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {tSub("cancelModalTitle")}
                            </h3>
                            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                {tSub("cancelModalDesc")}
                            </p>

                            <div className="mt-8 flex flex-col gap-3">
                                <button
                                    onClick={handleCancelSubscription}
                                    disabled={cancelLoading}
                                    className="w-full rounded-2xl bg-red-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition-all hover:bg-red-500 hover:shadow-red-900/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cancelLoading ? tSub("canceling") : tSub("cancelConfirm")}
                                </button>
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    disabled={cancelLoading}
                                    className="w-full rounded-2xl bg-slate-100 dark:bg-slate-800 px-6 py-4 text-sm font-bold text-slate-900 dark:text-white transition-all hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {tSub("cancelKeep")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
        <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-900">
                    {icon}
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-500">{label}</p>
            </div>

            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate" title={value}>{value}</p>
        </div>
    );
}