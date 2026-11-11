"use client";

import Link from "next/link";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { itemLabel, takaEn } from "@/lib/format";
import { useOrders, useProduct } from "@/lib/stores";

export default function OverviewPage() {
    const orders = useOrders();
    const product = useProduct();

    const count = (status) => orders.filter((o) => o.orderStatus === status).length;
    const delivered = orders.filter((o) => o.orderStatus === "Delivered");
    const stats = [
        { label: "Total orders", value: orders.length },
        { label: "Pending confirmation", value: count("Pending") },
        { label: "Delivered sales", value: takaEn(delivered.reduce((sum, o) => sum + o.itemsPrice, 0)) },
        { label: "Stock left", value: product.stock },
    ];

    return (
        <>
            <PageHeader title="Overview" description="A quick look at orders and stock." />
            <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-gray-200 bg-white px-5 py-4">
                        <dt className="text-xs text-gray-500">{stat.label}</dt>
                        <dd className="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</dd>
                    </div>
                ))}
            </dl>

            <Card title="Recent orders" className="mt-6">
                {orders.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No orders yet. Place a test order from the site, or add sample orders on the{" "}
                        <Link href="/admin/orders" className="font-medium text-gray-900 underline">
                            Orders page
                        </Link>
                        .
                    </p>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {orders.slice(0, 6).map((order) => (
                            <li key={order.orderNumber} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                                <span className="font-medium tabular-nums">{order.orderNumber}</span>
                                <span className="text-gray-600">{order.shippingAddress.name}</span>
                                <span className="text-gray-600">{itemLabel(order.orderItems[0])}</span>
                                <span className="tabular-nums">{takaEn(order.totalPrice)}</span>
                                <StatusBadge status={order.orderStatus} />
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </>
    );
}
