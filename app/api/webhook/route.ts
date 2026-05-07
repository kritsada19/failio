/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { env } from "@/env";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPeriodEnd } from "@/lib/stripe";
import { sendNotificationSubscript } from "@/lib/notificationSubscription";

const stripe = new Stripe(env.STRIPE_SECRET_KEY!);

if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
}

export async function POST(req: NextRequest) {
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

                console.log(subscription);

                if (!session?.metadata?.userId) {
                    return NextResponse.json({ error: "User ID not found in metadata" }, { status: 400 });
                }


                await prisma.user.update({
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

                const email = await prisma.user.findUnique({
                    where: { id: session.metadata.userId },
                    select: { email: true },
                });

                sendNotificationSubscript(email?.email as string);
                break;
            }

            case "invoice.payment_succeeded": {
                if (!session.subscription) return NextResponse.json({ received: true });

                const subscription = (await stripe.subscriptions.retrieve(
                    session.subscription as string
                )) as any;

                await prisma.user.update({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        stripePriceId: subscription.items.data[0].price.id || subscription.items.data[0].price,
                        stripeStatus: subscription.status,
                        stripeCurrentPeriodEnd: getPeriodEnd(subscription),
                    },
                });

                const email = await prisma.user.findUnique({
                    where: { stripeSubscriptionId: subscription.id },
                    select: { email: true },
                });

                sendNotificationSubscript(email?.email as string);
                break;
            }

            case "invoice.payment_failed": {
                if (!session.subscription) return NextResponse.json({ received: true });

                const subscription = (await stripe.subscriptions.retrieve(
                    session.subscription as string
                )) as any;

                await prisma.user.update({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        stripeStatus: subscription.status,
                    },
                });
                break;
            }

            case "customer.subscription.deleted": {
                await prisma.user.update({
                    where: { stripeSubscriptionId: session.id },
                    data: {
                        stripeStatus: "canceled",
                        plan: "FREE",
                    },
                });
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as any;
                await prisma.user.update({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        stripeStatus: subscription.status,
                        stripeCurrentPeriodEnd: getPeriodEnd(subscription),
                        plan: (subscription.status === "active" || subscription.status === "trialing" || subscription.status === "past_due") ? "PRO" : "FREE",
                    },
                });
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}