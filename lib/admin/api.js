"use client";

// Dashboard calls: Bearer token from the session, English network message,
// and a 401 (expired token, password changed elsewhere, account disabled)
// signs this browser out so the login screen shows.
import { apiFetch } from "@/lib/api/client";
import { adminSession } from "@/lib/storage";

export function adminFetch(path, options = {}) {
    const token = adminSession.get();
    return apiFetch(path, {
        ...options,
        headers: { ...(options.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        networkMessage: "Cannot reach the API. Check the connection and try again.",
    }).catch((err) => {
        // Only drop the session if it is still the one this request used; a
        // fresh login in another tab must not be undone by an old request.
        if (err?.status === 401 && token && adminSession.get() === token) adminSession.set(null);
        throw err;
    });
}

// "?a=1&b=x" from an object, skipping empty values.
export const qs = (params) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
    const s = sp.toString();
    return s ? `?${s}` : "";
};

// Same table as the API's models/Order.js STATUS_FLOW. The API enforces it;
// the dashboard only uses it to offer the right buttons.
export const ORDER_STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
export const PAYMENT_STATUSES = ["Pending", "Verifying", "Advance Paid", "Paid", "Failed", "Refunded"];
export const PAYMENT_METHODS = ["COD", "bKash", "Nagad", "Online"];
export const STATUS_FLOW = {
    Pending: ["Confirmed", "Cancelled"],
    Confirmed: ["Processing", "Shipped", "Cancelled"],
    Processing: ["Shipped", "Cancelled"],
    Shipped: ["Delivered", "Cancelled"],
    Delivered: [],
    Cancelled: [],
};
