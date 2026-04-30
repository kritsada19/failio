import Stripe from "stripe";
import { NextResponse } from "next/server";
import { env } from "@/env";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function POST() {
    const sessionUser = await getServerSession(authOptions);

    if (!sessionUser?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],

        line_items: [
            {
                price: "price_1TQFkM1heZpkBPs0nHppFd6H",
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

        success_url: `${env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.NEXT_PUBLIC_APP_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
}