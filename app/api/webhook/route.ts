/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { env } from "@/env";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPeriodEnd } from "@/lib/stripe";
import { sendNotificationSubscript } from "@/lib/notificationSubscription";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/getClientIp";

import { redis } from "@/lib/redis";

const stripe = new Stripe(env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {

    if (!env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json(
            { error: "STRIPE_WEBHOOK_SECRET is not defined" },
            { status: 500 }
        );
    }

    const ip = getClientIp(req);
    const rateLimitResult = await rateLimit(ip, 100, 60, req);

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { message: "Too many requests" },
            { status: 429 }
        );
    }

    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const session = event.data.object as any;

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const subscription = (await stripe.subscriptions.retrieve(
                    session.subscription as string
                )) as any;

                if (!session?.metadata?.userId) {
                    return NextResponse.json({ error: "User ID not found in metadata" }, { status: 400 });
                }

                const user = await prisma.user.update({
                    where: { id: session.metadata.userId },
                    data: {
                        stripeCustomerId: session.customer as string,
                        stripeSubscriptionId: session.subscription as string,
                        stripePriceId: subscription.items.data[0].price.id || subscription.items.data[0].price,
                        stripeStatus: subscription.status,
                        stripeCurrentPeriodEnd: getPeriodEnd(subscription),
                        plan: "PRO",
                    },
                });

                // ✅ Clear cache
                await redis.del(`user:${user.id}`);

                const locale = session?.metadata?.locale || "en";
                sendNotificationSubscript(user.email, locale);
                break;
            }

            case "invoice.payment_succeeded": {
                if (!session.subscription) return NextResponse.json({ received: true });

                const subscription = (await stripe.subscriptions.retrieve(
                    session.subscription as string
                )) as any;

                const user = await prisma.user.update({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        stripePriceId: subscription.items.data[0].price.id || subscription.items.data[0].price,
                        stripeStatus: subscription.status,
                        stripeCurrentPeriodEnd: getPeriodEnd(subscription),
                    },
                });

                // ✅ Clear cache
                await redis.del(`user:${user.id}`);

                const locale = subscription?.metadata?.locale || "en";
                sendNotificationSubscript(user.email, locale);
                break;
            }

            case "invoice.payment_failed": {
                if (!session.subscription) return NextResponse.json({ received: true });

                const subscription = (await stripe.subscriptions.retrieve(
                    session.subscription as string
                )) as any;

                const user = await prisma.user.update({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        stripeStatus: subscription.status,
                    },
                });

                // ✅ Clear cache
                await redis.del(`user:${user.id}`);
                break;
            }

            case "customer.subscription.deleted": {
                const user = await prisma.user.update({
                    where: { stripeSubscriptionId: session.id },
                    data: {
                        stripeStatus: "canceled",
                        plan: "FREE",
                    },
                });

                // ✅ Clear cache
                await redis.del(`user:${user.id}`);
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as any;
                const user = await prisma.user.update({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        stripeStatus: subscription.status,
                        stripeCurrentPeriodEnd: getPeriodEnd(subscription),
                        plan: (subscription.status === "active" || subscription.status === "trialing" || subscription.status === "past_due") ? "PRO" : "FREE",
                    },
                });

                // ✅ Clear cache
                await redis.del(`user:${user.id}`);
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error("Webhook Error Handled:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}
