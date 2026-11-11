"use client";

// Browser-only persistence for the static phase. Each store is one JSON
// document in localStorage, exposed through useSyncExternalStore so the
// storefront re-renders when the dashboard saves (same tab or another tab).
//
// Backend phase: replace the body of createStore's read/write with fetch calls
// (or swap these hooks for TanStack Query). Components only use the hooks and
// the save/reset functions exported below, so nothing else has to change.

import { useSyncExternalStore } from "react";
import { defaultLanding, defaultProduct, defaultSite } from "./defaults";

// Bump when a default shape changes, so stale browser copies are ignored
// instead of crashing the page on a missing field.
const VERSION = "v2";

function createStore(name, fallback) {
    const key = `geneticayur.${name}.${VERSION}`;
    const listeners = new Set();
    // getSnapshot must return the same reference until the data changes,
    // otherwise React re-renders forever. Cache by the raw string.
    let cachedRaw = null;
    let cachedValue = fallback;

    const read = () => {
        let raw = null;
        try {
            raw = window.localStorage.getItem(key);
        } catch {
            // Private mode or blocked storage: fall through to the defaults.
        }
        if (raw === cachedRaw) return cachedValue;
        cachedRaw = raw;
        try {
            cachedValue = raw ? JSON.parse(raw) : fallback;
        } catch {
            cachedValue = fallback;
        }
        return cachedValue;
    };

    const emit = () => listeners.forEach((fn) => fn());

    const subscribe = (fn) => {
        listeners.add(fn);
        const onStorage = (e) => {
            if (e.key === key || e.key === null) fn();
        };
        window.addEventListener("storage", onStorage);
        return () => {
            listeners.delete(fn);
            window.removeEventListener("storage", onStorage);
        };
    };

    return {
        subscribe,
        get: read,
        getServer: () => fallback,
        set(value) {
            try {
                window.localStorage.setItem(key, JSON.stringify(value));
            } catch (err) {
                // Usually the 5 MB quota, hit by large uploaded images.
                return { ok: false, error: err };
            }
            emit();
            return { ok: true };
        },
        reset() {
            try {
                window.localStorage.removeItem(key);
            } catch {
                // nothing to clear
            }
            emit();
        },
    };
}

export const siteStore = createStore("site", defaultSite);
export const productStore = createStore("product", defaultProduct);
export const landingStore = createStore("landing", defaultLanding);
export const ordersStore = createStore("orders", []);
export const sessionStore = createStore("session", null);

const useStore = (store) => useSyncExternalStore(store.subscribe, store.get, store.getServer);

export const useSite = () => useStore(siteStore);
export const useProduct = () => useStore(productStore);
export const useLanding = () => useStore(landingStore);
export const useOrders = () => useStore(ordersStore);
export const useSession = () => useStore(sessionStore);

const noop = () => () => {};
// False during SSR and the hydration pass, true afterwards. Lets the dashboard
// wait for real localStorage data before it seeds an edit form from it.
export const useHydrated = () =>
    useSyncExternalStore(
        noop,
        () => true,
        () => false,
    );
