"use client";

// The only place the app touches localStorage. Two things live there:
//   - guest order tokens: the API shows an order only to whoever holds its
//     token, and it is returned once, at order time;
//   - the dashboard session token.
// Store content itself comes from the API, never from the browser.

const ORDERS_KEY = "geneticayur.orders.v1";
const ADMIN_KEY = "geneticayur.admin.v1";
const MAX_ORDERS = 20;

const read = (key) => {
    try {
        return JSON.parse(window.localStorage.getItem(key) || "null");
    } catch {
        return null;
    }
};

const write = (key, value) => {
    try {
        if (value === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        // Private mode or full storage.
        return false;
    }
};

export function saveOrderToken(orderNumber, token) {
    const all = read(ORDERS_KEY) || {};
    all[orderNumber] = { token, savedAt: Date.now() };
    // Keep the newest few; old orders can still be traced by phone.
    const kept = Object.entries(all)
        .sort((a, b) => b[1].savedAt - a[1].savedAt)
        .slice(0, MAX_ORDERS);
    return write(ORDERS_KEY, Object.fromEntries(kept));
}

export function getOrderToken(orderNumber) {
    const entry = (read(ORDERS_KEY) || {})[orderNumber];
    return typeof entry?.token === "string" ? entry.token : null;
}

// ─── Dashboard session ────────────────────────────────────────────
// A tiny external store so every component sees login/logout at once,
// including other tabs (storage event).
const listeners = new Set();
let cachedRaw;
let cachedToken = null;

export const adminSession = {
    get() {
        let raw = null;
        try {
            raw = window.localStorage.getItem(ADMIN_KEY);
        } catch {
            // blocked storage: logged out
        }
        if (raw !== cachedRaw) {
            cachedRaw = raw;
            try {
                const v = JSON.parse(raw || "null");
                cachedToken = typeof v?.token === "string" ? v.token : null;
            } catch {
                cachedToken = null;
            }
        }
        return cachedToken;
    },
    getServer: () => null,
    set(token) {
        write(ADMIN_KEY, token ? { token } : null);
        listeners.forEach((fn) => fn());
    },
    subscribe(fn) {
        listeners.add(fn);
        const onStorage = (e) => {
            if (e.key === ADMIN_KEY || e.key === null) fn();
        };
        window.addEventListener("storage", onStorage);
        return () => {
            listeners.delete(fn);
            window.removeEventListener("storage", onStorage);
        };
    },
};
