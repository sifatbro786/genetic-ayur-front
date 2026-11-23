// Server-side reads of the public store data. Everything the storefront
// renders comes through getStorefront(): one request, cached by Next.js and
// tagged "storefront". The API calls POST /api/revalidate after a dashboard
// save (and when a confirmed order changes stock), which expires the tag, so
// edits show on the next visit. The 5 minute revalidate is the safety net if
// that call ever fails.
//
// A failed fetch throws on purpose. Next.js keeps serving the last good copy
// while it retries, and a first visit with the API down gets the error page
// with the shop's phone number. Showing placeholder prices instead would be
// worse: the order form would quote numbers the server then refuses.
import { cacheLife, cacheTag } from "next/cache";
import { SERVER_API_URL } from "./config";

export async function getStorefront() {
    "use cache";
    cacheTag("storefront");
    cacheLife({ stale: 300, revalidate: 300, expire: 86400 });

    const res = await fetch(`${SERVER_API_URL}/api/storefront`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`GET /api/storefront answered ${res.status}`);
    const data = await res.json();
    return { site: data.site, landing: data.landing, products: data.products || [] };
}

// The product the landing page sells: the one picked in the dashboard, or the
// first active product if that one is hidden.
export const landingProduct = (landing, products) =>
    products.find((p) => p.slug === landing?.productSlug) || products[0] || null;
