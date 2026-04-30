// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPeriodEnd(subscription: any) {
    if (subscription.current_period_end) {
        return new Date(subscription.current_period_end * 1000);
    }

    const anchor = subscription.billing_cycle_anchor;
    const interval = subscription.plan?.interval;
    const count = subscription.plan?.interval_count ?? 1;

    const date = new Date(anchor * 1000);

    if (interval === "month") {
        date.setMonth(date.getMonth() + count);
    } else if (interval === "year") {
        date.setFullYear(date.getFullYear() + count);
    } else if (interval === "week") {
        date.setDate(date.getDate() + 7 * count);
    } else if (interval === "day") {
        date.setDate(date.getDate() + count);
    }

    return date;
}

export { getPeriodEnd };