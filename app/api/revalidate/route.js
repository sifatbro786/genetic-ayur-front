// POST /api/revalidate  { tags: ["storefront"] }  header x-revalidate-secret
// Called by the Express API (services/revalidate.js) after a dashboard save
// or a stock change, so cached pages show the change on the next visit.
import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

const TAG_RE = /^[a-z0-9:_-]{1,64}$/;

// Hash both sides first: timingSafeEqual needs equal lengths, and comparing
// digests does not leak the secret's length either.
const sameSecret = (given, expected) =>
    timingSafeEqual(createHash("sha256").update(given).digest(), createHash("sha256").update(expected).digest());

export async function POST(request) {
    const secret = process.env.REVALIDATE_SECRET || "";
    const given = request.headers.get("x-revalidate-secret") || "";
    // A missing or short secret on this side means the route is not set up;
    // answer like a wrong secret so it cannot be used to expire caches.
    if (secret.length < 24 || !sameSecret(given, secret)) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ success: false, message: "Body must be JSON" }, { status: 400 });
    }
    const tags = Array.isArray(body?.tags) ? [...new Set(body.tags.filter((t) => typeof t === "string" && TAG_RE.test(t)))].slice(0, 10) : [];
    if (!tags.length) return Response.json({ success: false, message: "No valid tags" }, { status: 400 });

    // expire: 0, not "max": the owner saves and opens the site to check, so
    // the next request must get the new content, not one more stale copy.
    for (const tag of tags) revalidateTag(tag, { expire: 0 });
    return Response.json({ success: true, revalidated: tags });
}
