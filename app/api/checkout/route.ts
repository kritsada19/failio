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
        where: {
            id: sessionUser.user.id,
        },
        select: {
            stripeCustomerId: true,
            email: true,
        }
    });

    const session = await stripe.checkout.sessions.create({
        customer: user?.stripeCustomerId || undefined,
        customer_email: user?.stripeCustomerId ? undefined : (user?.email || undefined),
        mode: "subscription",
        payment_method_types: ["card"],

        line_items: [
            {
                price: env.STRIPE_PRO_PRICE_ID,
                quantity: 1,
            },
        ],

        metadata: {
            userId: sessionUser.user.id,
        },

        subscription_data: {
            metadata: {
                userId: sessionUser.user.id,
            },
        },

        success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/cancel`,
    });

    return NextResponse.json({ url: session.url });
}