"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LayoutDashboard, LayoutTemplate, LogOut, Package, Settings, ShoppingCart } from "lucide-react";
import { sessionStore, useHydrated, useOrders, useSession } from "@/lib/stores";
import { Button, inputClass } from "./ui";

const NAV = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/product", label: "Product", icon: Package },
    { href: "/admin/content", label: "Landing page", icon: LayoutTemplate },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

// Demo credentials, shown on the login screen. This is a UI demo, not access
// control: everything here runs in the visitor's own browser. Real auth (JWT
// from the Footpath backend) replaces this component's check in phase 2.
const DEMO_EMAIL = "admin@geneticayur.com";
const DEMO_PASSWORD = "demo1234";

export default function AdminShell({ children }) {
    const hydrated = useHydrated();
    const session = useSession();
    const pathname = usePathname();
    const orders = useOrders();

    // Render nothing until localStorage is readable, so edit forms never seed
    // themselves from the server defaults by mistake.
    if (!hydrated) return <div className="min-h-screen bg-gray-100" />;
    if (!session) return <Login />;

    const pending = orders.filter((o) => o.orderStatus === "Pending").length;

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
                                {href === "/admin/orders" && pending > 0 ? (
                                    <span className={`ml-auto rounded-full px-1.5 text-xs ${active ? "bg-white text-gray-900" : "bg-amber-100 text-amber-800"}`}>
                                        {pending}
                                    </span>
                                ) : null}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <div className="min-w-0">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-5 py-3">
                    <p className="rounded bg-amber-50 px-2.5 py-1 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
                        Demo mode: changes are saved in this browser only
                    </p>
                    <div className="flex items-center gap-2">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                        >
                            <ExternalLink aria-hidden className="h-4 w-4" /> View site
                        </a>
                        <Button onClick={() => sessionStore.reset()}>
                            <LogOut aria-hidden className="h-4 w-4" /> Log out
                        </Button>
                    </div>
                </header>
                <main className="mx-auto max-w-5xl px-5 py-7">{children}</main>
            </div>
        </div>
    );
}

function Login() {
    const [email, setEmail] = useState(DEMO_EMAIL);
    const [password, setPassword] = useState(DEMO_PASSWORD);
    const [error, setError] = useState("");

    const onSubmit = (e) => {
        e.preventDefault();
        if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
            setError("Email or password does not match the demo login shown below.");
            return;
        }
        sessionStore.set({ email: DEMO_EMAIL });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 font-sans text-gray-900">
            <form onSubmit={onSubmit} className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6">
                <h1 className="text-lg font-semibold">Genetic Ayur dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">Log in to manage orders, product and landing page content.</p>
                <label htmlFor="admin-email" className="mt-5 block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} mt-1.5`}
                />
                {error ? (
                    <p role="alert" className="mt-3 text-sm text-red-700">
                        {error}
                    </p>
                ) : null}
                <Button type="submit" variant="primary" className="mt-5 w-full">
                    Log in
                </Button>
                <p className="mt-4 rounded bg-gray-50 px-3 py-2 text-xs text-gray-600">
                    Demo login: {DEMO_EMAIL} / {DEMO_PASSWORD}
                </p>
            </form>
        </div>
    );
}
