import Stripe from "stripe";
import { NextResponse } from "next/server";
import { env } from "@/env";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function GET() {
    const sessionUser = await getServerSession(authOptions);

    if (!sessionUser?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            id: sessionUser.user.id,
        },
        select: {
            stripeCustomerId: true,
        }
    });

    if (!user?.stripeCustomerId) {
        // If no stripe customer id, redirect to price page or dashboard
        return NextResponse.redirect(new URL("/dashboard/subscription", env.NEXT_PUBLIC_APP_URL));
    }

    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`,
        });

        return NextResponse.redirect(session.url);
    } catch (error) {
        console.error("Error creating billing portal session:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
