"use client";

import Link from "next/link";
import { Card, ErrorNote, PageHeader, PaymentBadge, StatusBadge, formatDate } from "@/components/admin/ui";
import { useResource } from "@/components/admin/useResource";
import { itemLabel, takaEn } from "@/lib/format";

const LOW_STOCK = 10;

export default function OverviewPage() {
    const orders = useResource("/api/admin/orders?limit=8");
    const products = useResource("/api/admin/products?status=active&limit=100");

    const counts = orders.data?.statusCounts || {};
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const verify = orders.data?.needsAttention?.paymentsToVerify || 0;
    const low = (products.data?.products || []).filter((p) => p.stock <= LOW_STOCK);
    const stats = [
        { label: "Total orders", value: total, href: "/admin/orders" },
        { label: "Waiting for confirmation", value: counts.Pending || 0, href: "/admin/orders?status=Pending" },
        { label: "Payments to verify", value: verify, href: "/admin/orders?paymentStatus=Verifying" },
        { label: "Shipped, not delivered", value: counts.Shipped || 0, href: "/admin/orders?status=Shipped" },
    ];

    return (
        <>
            <PageHeader title="Overview" description="What needs attention today." />
            <ErrorNote error={orders.error || products.error} onRetry={() => (orders.reload(), products.reload())} />
            <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Link key={stat.label} href={stat.href} className="rounded-lg border border-gray-200 bg-white px-5 py-4 hover:border-gray-400">
                        <dt className="text-xs text-gray-500">{stat.label}</dt>
                        <dd className="mt-1 text-2xl font-semibold tabular-nums">{orders.data ? stat.value : "..."}</dd>
                    </Link>
                ))}
            </dl>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <Card title="Recent orders" className="[&>div]:p-0">
                    {!orders.data ? (
                        <p className="p-5 text-sm text-gray-500">{orders.loading ? "Loading..." : ""}</p>
                    ) : orders.data.orders.length === 0 ? (
                        <p className="p-5 text-sm text-gray-500">No orders yet. Orders placed on the site appear here.</p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {orders.data.orders.map((order) => (
                                <li key={order.orderNumber}>
                                    <Link
                                        href={`/admin/orders?q=${order.orderNumber}`}
                                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3 text-sm hover:bg-gray-50"
                                    >
                                        <span className="font-medium tabular-nums">{order.orderNumber}</span>
                                        <span className="text-gray-600">{order.shippingAddress.name}</span>
                                        <span className="text-gray-600">{order.orderItems.map(itemLabel).join(", ")}</span>
                                        <span className="tabular-nums">{takaEn(order.totalPrice)}</span>
                                        <span className="flex gap-1.5">
                                            <StatusBadge status={order.orderStatus} />
                                            <PaymentBadge status={order.paymentStatus} />
                                        </span>
                                        <span className="w-full text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card title="Stock" description={`Jars in stock per product. ${LOW_STOCK} or fewer is marked low.`}>
                    {!products.data ? (
                        <p className="text-sm text-gray-500">{products.loading ? "Loading..." : ""}</p>
                    ) : (
                        <ul className="space-y-2 text-sm">
                            {products.data.products.map((p) => (
                                <li key={p._id} className="flex items-center justify-between gap-3">
                                    <Link href={`/admin/products/${p._id}`} className="truncate hover:underline">
                                        {p.nameBn || p.name}
                                    </Link>
                                    <span className={`tabular-nums font-medium ${p.stock <= LOW_STOCK ? "text-red-700" : ""}`}>{p.stock}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {low.length ? <p className="mt-4 text-xs text-red-700">{low.length} product(s) running low. Add stock on the product page.</p> : null}
                </Card>
            </div>
        </>
    );
}
