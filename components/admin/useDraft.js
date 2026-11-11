"use client";

import { useState, useSyncExternalStore } from "react";

// Edit-then-save for one store document. The draft is local state; nothing
// reaches the storefront until save(). Must be used below AdminShell, which
// only mounts children after hydration, so store.get() is the real saved copy.
export function useDraft(store) {
    const saved = useSyncExternalStore(store.subscribe, store.get, store.getServer);
    const [draft, setDraft] = useState(saved);
    const [message, setMessage] = useState(null);

    const dirty = draft !== saved && JSON.stringify(draft) !== JSON.stringify(saved);

    return {
        draft,
        dirty,
        message,
        setDraft(next) {
            setDraft(next);
            setMessage(null);
        },
        save() {
            const result = store.set(draft);
            setMessage(
                result.ok
                    ? { ok: true, text: "Saved. The site is updated." }
                    : { ok: false, text: "Could not save. Browser storage is full; use smaller images or image URLs." },
            );
        },
        discard() {
            setDraft(saved);
            setMessage(null);
        },
        resetToDefault() {
            store.reset();
            setDraft(store.get());
            setMessage({ ok: true, text: "Restored the original content." });
        },
    };
}
