"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LayoutDashboard, LayoutTemplate, LogOut, Package, Settings, ShoppingCart } from "lucide-react";
import { adminFetch } from "@/lib/admin/api";
import { apiFetch } from "@/lib/api/client";
import { adminSession } from "@/lib/storage";
import { Button, inputClass } from "./ui";

const NAV = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/content", label: "Landing page", icon: LayoutTemplate },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

const noop = () => () => {};
const useHydrated = () =>
    useSyncExternalStore(
        noop,
        () => true,
        () => false,
    );

// The dashboard is client-only: the token lives in localStorage, and every
// page loads its data from the admin API with it. The API is the access
// control (every /api/admin route checks the JWT); this shell only decides
// whether to show the login form.
export default function AdminShell({ children }) {
    const hydrated = useHydrated();
    const token = useSyncExternalStore(adminSession.subscribe, adminSession.get, adminSession.getServer);
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [badges, setBadges] = useState({ pending: 0, verify: 0 });

    // Confirms the stored token still works (expired, password changed on
    // another device) and loads the name for the header. A 401 here logs out.
    useEffect(() => {
        if (!token) return undefined;
        const ctrl = new AbortController();
        adminFetch("/api/admin/auth/me", { signal: ctrl.signal })
            .then((res) => setUser(res.user))
            .catch(() => {});
        return () => ctrl.abort();
    }, [token]);

    // Sidebar counts, refreshed on navigation and every minute.
    useEffect(() => {
        if (!token) return undefined;
        const ctrl = new AbortController();
        const load = () =>
            adminFetch("/api/admin/orders?limit=1", { signal: ctrl.signal })
                .then((res) => setBadges({ pending: res.statusCounts?.Pending || 0, verify: res.needsAttention?.paymentsToVerify || 0 }))
                .catch(() => {});
        load();
        const timer = setInterval(load, 60_000);
        return () => {
            clearInterval(timer);
            ctrl.abort();
        };
    }, [token, pathname]);

    if (!hydrated) return <div className="min-h-screen bg-gray-100" />;
    if (!token) return <Login />;

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900 lg:grid lg:grid-cols-[15rem_1fr]">
            <aside className="border-b border-gray-200 bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
                <div className="flex items-center justify-between px-5 py-4 lg:block">
                    <p className="text-sm font-semibold">Genetic Ayur</p>
                    <p className="text-xs text-gray-500">Store dashboard</p>
                </div>
                <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-0.5">
                    {NAV.map(({ href, label, icon: Icon }) => {
                        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                        const count = href === "/admin/orders" ? badges.pending + badges.verify : 0;
                        return (
                            <Link
                                key={href}
                                href={href}
                                aria-current={active ? "page" : undefined}
                                className={`flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium ${
                                    active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                <Icon aria-hidden className="h-4 w-4" />
                                {label}
                                {count > 0 ? (
                                    <span
                                        title={`${badges.pending} pending, ${badges.verify} payments to verify`}
                                        className={`ml-auto rounded-full px-1.5 text-xs ${active ? "bg-white text-gray-900" : "bg-amber-100 text-amber-800"}`}
                                    >
                                        {count}
                                    </span>
                                ) : null}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <div className="min-w-0">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-5 py-3">
                    <p className="text-sm text-gray-600">{user ? `Signed in as ${user.name || user.email}` : ""}</p>
                    <div className="flex items-center gap-2">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                        >
                            <ExternalLink aria-hidden className="h-4 w-4" /> View site
                        </a>
                        <Button onClick={() => adminSession.set(null)}>
                            <LogOut aria-hidden className="h-4 w-4" /> Log out
                        </Button>
                    </div>
                </header>
                <main className="mx-auto max-w-6xl px-5 py-7">{children}</main>
            </div>
        </div>
    );
}

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            const res = await apiFetch("/api/admin/auth/login", {
                method: "POST",
                body: { email: email.trim(), password },
                networkMessage: "Cannot reach the API. Check that it is running and NEXT_PUBLIC_API_URL is right.",
            });
            adminSession.set(res.token);
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 font-sans text-gray-900">
            <form onSubmit={onSubmit} className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6">
                <h1 className="text-lg font-semibold">Genetic Ayur dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">Log in to manage orders, products and landing page content.</p>
                <label htmlFor="admin-email" className="mt-5 block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputClass} mt-1.5`}
                />
                <label htmlFor="admin-password" className="mt-4 block text-sm font-medium text-gray-700">
                    Password
                </label>
                <input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} mt-1.5`}
                />
                {error ? (
                    <p role="alert" className="mt-3 text-sm text-red-700">
                        {error}
                    </p>
                ) : null}
                <Button type="submit" variant="primary" className="mt-5 w-full" disabled={busy}>
                    {busy ? "Logging in..." : "Log in"}
                </Button>
            </form>
        </div>
    );
}
