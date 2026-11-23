"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/api";

// GET a dashboard resource and keep it in state. `path` null = do not load.
// State is only set from the async callback, keyed by path, so a slow answer
// for an old filter never overwrites the current one.
export function useResource(path) {
    const [state, setState] = useState({ path: null, data: null, error: null });
    const [nonce, setNonce] = useState(0);

    useEffect(() => {
        if (!path) return undefined;
        const ctrl = new AbortController();
        adminFetch(path, { signal: ctrl.signal })
            .then((data) => setState({ path, data, error: null }))
            .catch((error) => {
                if (error?.name !== "AbortError") setState((s) => ({ path, data: s.path === path ? s.data : null, error }));
            });
        return () => ctrl.abort();
    }, [path, nonce]);

    const reload = useCallback(() => setNonce((n) => n + 1), []);
    // Replace the data after a write that returned the fresh document.
    const setData = useCallback((data) => setState({ path, data, error: null }), [path]);

    const current = state.path === path;
    return {
        data: current ? state.data : null,
        error: current ? state.error : null,
        loading: Boolean(path) && (!current || (!state.data && !state.error)),
        reload,
        setData,
    };
}
