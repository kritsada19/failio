import Stripe from "stripe";
import { NextResponse } from "next/server";
import { env } from "@/env";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function POST() {
    const sessionUser = await getServerSession(authOptions);

    if (!sessionUser?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const user = await prisma.user.findUnique({
        where: { id: sessionUser.user.id },
        select: { stripeSubscriptionId: true },
    });

    if (!user?.stripeSubscriptionId) {
        return NextResponse.json(
            { error: "No active subscription found" },
            { status: 400 }
        );
    }

    try {
        // Cancel the subscription immediately
        const subscription = await stripe.subscriptions.cancel(user.stripeSubscriptionId);

        // Update database immediately
        await prisma.user.update({
            where: { id: sessionUser.user.id },
            data: {
                stripeStatus: subscription.status,
                plan: "FREE",
            },
        });

        return NextResponse.json({ success: true, subscription });
    } catch (error) {
        console.error("Error canceling subscription:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to cancel subscription" },
            { status: 500 }
        );
    }
}
