import Stripe from "stripe";
import { NextResponse, NextRequest } from "next/server";
import { env } from "@/env";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/getClientIp";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    const rateLimitResult = await rateLimit(ip, 5, 60, request);

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { message: "Too many requests" },
            { status: 429 }
        );
    }
    const sessionUser = await getServerSession(authOptions);
    const locale = await getLocale();

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
            locale: locale,
        },

        subscription_data: {
            metadata: {
                userId: sessionUser.user.id,
                locale: locale,
            },
        },

        success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/cancel`,
    });

    return NextResponse.json({ url: session.url });
}