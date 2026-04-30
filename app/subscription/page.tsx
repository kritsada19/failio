"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";

interface UserProfile {
  plan: "FREE" | "PRO";
  stripeStatus?: string;
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const t = useTranslations("Subscription");
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const router = useRouter();

  const { data: user, loading: userLoading } = useFetch<UserProfile>(`/api/me`);

  if (status === "loading" || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const handleUpgrade = async () => {
    if (status === "unauthenticated") {
      router.push("/sign-in?callbackUrl=/subscription");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      });
      if (response.ok) {
        setShowCancelModal(false);
        // Refresh the page to show updated status
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

  const currentPlan = user?.plan || session?.user?.plan || "FREE";

  const plans = [
    {
      name: t("freeTitle"),
      price: t("freePrice"),
      currency: t("currency"),
      period: t("perMonth"),
      features: [t("freeFeature1"), t("freeFeature2")],
      buttonText: currentPlan === "FREE" ? t("currentPlan") : t("choosePlan"),
      isCurrent: currentPlan === "FREE",
      highlight: false,
    },
    {
      name: t("proTitle"),
      price: t("proPrice"),
      currency: t("currency"),
      period: t("perMonth"),
      features: [
        t("proFeature1"),
        t("proFeature2"),
        t("proFeature3"),
        t("proFeature4"),
      ],
      buttonText: currentPlan === "PRO" ? t("currentPlan") : t("upgradeNow"),
      isCurrent: currentPlan === "PRO",
      highlight: true,
    },
  ];

  return (
    <main className="min-h-screen bg-linear-to-b from-white via-slate-50 to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 pt-20 pb-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-4xl lg:grid-cols-2 lg:gap-x-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between rounded-4xl p-8 shadow-xl ring-1 transition-all duration-300 hover:-translate-y-1 ${plan.highlight
                ? "bg-slate-900 dark:bg-slate-800 ring-slate-900 text-white"
                : "bg-white dark:bg-slate-900 ring-slate-200 dark:ring-slate-800"
                }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                  Most Popular
                </div>
              )}
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h2
                    className={`text-2xl font-bold leading-8 ${plan.highlight ? "text-white" : "text-slate-900 dark:text-white"
                      }`}
                  >
                    {plan.name}
                  </h2>
                </div>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className={`text-4xl font-bold tracking-tight ${plan.highlight ? "text-white" : "text-slate-900 dark:text-white"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm font-semibold leading-6 ${plan.highlight ? "text-slate-300" : "text-slate-600 dark:text-slate-400"}`}>
                    {plan.currency}{plan.period}
                  </span>
                </p>
                <ul
                  className={`mt-8 space-y-3 text-sm leading-6 ${plan.highlight ? "text-slate-300" : "text-slate-600 dark:text-slate-400"
                    }`}
                >
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon
                        className={`h-6 w-5 flex-none ${plan.highlight ? "text-orange-400" : "text-orange-600"
                          }`}
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={plan.highlight && !plan.isCurrent ? handleUpgrade : undefined}
                disabled={plan.isCurrent || (plan.highlight && loading)}
                className={`mt-8 block w-full rounded-2xl px-6 py-4 text-center text-sm font-bold leading-6 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${plan.isCurrent
                  ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-default"
                  : plan.highlight
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20 hover:bg-orange-500 hover:shadow-orange-900/40 focus-visible:outline-orange-600"
                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 ring-1 ring-inset ring-slate-200 dark:ring-transparent focus-visible:outline-slate-900 dark:focus-visible:outline-white cursor-not-allowed opacity-50"
                  }`}
              >
                {plan.isCurrent ? plan.buttonText : plan.highlight && loading ? "..." : plan.buttonText}
              </button>

              {plan.isCurrent && plan.highlight && user?.stripeStatus !== "canceled" && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="mt-4 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors duration-200 text-center w-full"
                >
                  {t("cancelSubscription")}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Safe and secure payments powered by Stripe.
          </p>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !cancelLoading && setShowCancelModal(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md scale-100 transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 transition-all duration-300 animate-in zoom-in-95">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <svg
                  className="h-8 w-8 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t("cancelModalTitle")}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {t("cancelModalDesc")}
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                  className="w-full rounded-2xl bg-red-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition-all hover:bg-red-500 hover:shadow-red-900/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelLoading ? t("canceling") : t("cancelConfirm")}
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelLoading}
                  className="w-full rounded-2xl bg-slate-100 dark:bg-slate-800 px-6 py-4 text-sm font-bold text-slate-900 dark:text-white transition-all hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("cancelKeep")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
