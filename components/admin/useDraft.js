"use client";

import { useState } from "react";

// Edit-then-save for one document loaded from the API. Mount the editor with
// key={version} so a reload (or a save that returns the stored copy) starts a
// fresh draft from the server's version.
export function useDraft(initial, save) {
    const [base, setBase] = useState(initial);
    const [draft, setDraftState] = useState(initial);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const dirty = draft !== base && JSON.stringify(draft) !== JSON.stringify(base);

    return {
        draft,
        dirty,
        saving,
        message,
        setDraft(next) {
            setDraftState(next);
            setMessage(null);
        },
        async save() {
            setSaving(true);
            setMessage(null);
            try {
                // save() returns the stored document (cleaned by the API), which
                // becomes the new baseline.
                const stored = await save(draft);
                setBase(stored);
                setDraftState(stored);
                setMessage({ ok: true, text: "Saved. The site updates within a few seconds." });
            } catch (err) {
                setMessage({ ok: false, text: err.message, details: err.errors?.map((e) => (typeof e === "string" ? e : e.message)) });
            } finally {
                setSaving(false);
            }
        },
        discard() {
            setDraftState(base);
            setMessage(null);
        },
    };
}
