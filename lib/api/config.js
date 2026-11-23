// Where the Express API lives. NEXT_PUBLIC_API_URL is inlined into the
// browser bundle at build time, so changing it on Vercel needs a redeploy.
// API_URL lets the Next.js server use another address for its own fetches
// (same server, private network); it falls back to the public one.
const trim = (v) => (v || "").trim().replace(/\/+$/, "");

export const PUBLIC_API_URL = trim(process.env.NEXT_PUBLIC_API_URL) || "http://localhost:5000";

export const SERVER_API_URL = trim(process.env.API_URL) || PUBLIC_API_URL;
