"use client";

// Browser calls to the API: order form, order page and dashboard. Every API
// answer is { success, ... } or { success: false, message, code?, errors? };
// failures become an ApiError carrying those fields.
import { PUBLIC_API_URL } from "./config";

export class ApiError extends Error {
    constructor(message, { status = 0, code, errors, data } = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.errors = errors || [];
        this.data = data;
    }
}

const NETWORK_BN = "সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।";

/**
 * @param {string} path  "/api/..."
 * @param {object} [o]
 * @param {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} [o.method]
 * @param {object|FormData} [o.body]
 * @param {Record<string,string>} [o.headers]
 * @param {AbortSignal} [o.signal]
 * @param {boolean} [o.raw]  return the Response itself on success (CSV export)
 * @param {string} [o.networkMessage]
 */
export async function apiFetch(path, { method = "GET", body, headers = {}, signal, raw = false, networkMessage = NETWORK_BN } = {}) {
    const isForm = typeof FormData !== "undefined" && body instanceof FormData;
    let res;
    try {
        res = await fetch(`${PUBLIC_API_URL}${path}`, {
            method,
            headers: {
                Accept: "application/json",
                ...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
                ...headers,
            },
            body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
            signal,
            // Never let the browser cache order or dashboard answers.
            cache: "no-store",
        });
    } catch (err) {
        if (err?.name === "AbortError") throw err;
        throw new ApiError(networkMessage, { status: 0, code: "NETWORK" });
    }

    if (raw && res.ok) return res;

    let data = null;
    try {
        data = await res.json();
    } catch {
        // Empty or non-JSON body (proxy error page): handled below.
    }
    if (!res.ok || !data || data.success === false) {
        throw new ApiError(data?.message || `Request failed (${res.status})`, {
            status: res.status,
            code: data?.code,
            errors: data?.errors,
            data,
        });
    }
    return data;
}

// Per-submit idempotency key for POST /api/orders. randomUUID needs a secure
// context; plain http on a LAN IP (testing on a phone) does not have one.
export function newRequestId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
