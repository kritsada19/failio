export function sanitize(input: string): string {
    if (!input) return "";
    return input
        .replace(/<\/DATA>/gi, "[DATA_END_TAG_BLOCKED]")
        .replace(/<[^>]*>?/gm, "")
        .replace(/(?:ignore|forget|skip|reset|override|disregard)\s+(?:all\s+)?(?:instructions|previous|rules|system|settings|directives)/gi, "")
        .replace(/(?:system|hidden)\s+(?:prompt|message|instruction)/gi, "")
        .replace(/(?:act\s+as|you\s+are\s+now|new\s+role|persona)/gi, "")
        .replace(/instead\s+of\s+following/gi, "")
        .replace(/output\s+(?:the\s+)?(?:prompt|instructions)/gi, "")
        .replace(/do\s+not\s+(?:follow|heed)/gi, "")
        .replace(/[\x00-\x1F\x7F\u200B-\u200D\uFEFF]/g, "")
        .trim();
}

export function isValidAIResponse(data: unknown): boolean {
    if (typeof data !== "object" || data === null) return false;
    const d = data as Record<string, unknown>;
    return (
        typeof d.summary === "string" &&
        typeof d.rootCause === "string" &&
        Array.isArray(d.suggestions) &&
        (d.suggestions as unknown[]).every((s) => typeof s === "string") &&
        typeof d.lesson === "string"
    );
}
