"use client";

import { Fragment, useState } from "react";
import { Button, Card, PageHeader, StatusBadge, inputClass } from "@/components/admin/ui";
import { takaEn, telHref, variantLabel } from "@/lib/format";
import { ORDER_STATUSES, addSampleOrders, deleteOrder, updateOrderStatus } from "@/lib/orders";
import { ordersStore, useOrders, useProduct, useSite } from "@/lib/stores";

// Runs only after hydration (AdminShell gates on it), so the browser's locale
// and time zone are safe to use here.
const formatDate = (iso) =>
    new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default function OrdersPage() {
    const orders = useOrders();
    const product = useProduct();
    const site = useSite();
    const [status, setStatus] = useState("All");
    const [query, setQuery] = useState("");
    const [openId, setOpenId] = useState(null);
    const [confirmClear, setConfirmClear] = useState(false);

    const q = query.trim().toLowerCase();
    const visible = orders.filter(
        (o) =>
            (status === "All" || o.orderStatus === status) &&
            (!q ||
                o.orderNumber.toLowerCase().includes(q) ||
                o.shippingAddress.name.toLowerCase().includes(q) ||
                o.shippingAddress.phone.includes(q)),
    );

    return (
        <>
            <PageHeader title="Orders" description="Orders placed from the landing page form.">
                <Button onClick={() => addSampleOrders(product, site)}>Add sample orders</Button>
                {orders.length > 0 ? (
                    confirmClear ? (
                        <Button
                            variant="danger"
                            onClick={() => {
                                ordersStore.reset();
                                setConfirmClear(false);
                            }}
                        >
                            Yes, delete all {orders.length}
                        </Button>
                    ) : (
                        <Button variant="danger" onClick={() => setConfirmClear(true)}>
                            Clear all
                        </Button>
                    )
                ) : null}
            </PageHeader>

            <div className="mb-4 flex flex-wrap gap-3">
                <input
                    type="search"
                    aria-label="Search orders"
                    placeholder="Search by order number, name or phone"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={`${inputClass} max-w-xs`}
                />
                <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} max-w-44`}>
                    <option>All</option>
                    {ORDER_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                    ))}
                </select>
            </div>

            <Card className="[&>div]:p-0">
                {visible.length === 0 ? (
                    <p className="p-5 text-sm text-gray-500">
                        {orders.length === 0
                            ? "No orders yet. Place a test order from the site to see it here."
                            : "No orders match this search or filter."}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[46rem] text-left text-sm">
                            <thead className="border-b border-gray-200 text-xs text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Order</th>
                                    <th className="px-4 py-3 font-medium">Placed</th>
                                    <th className="px-4 py-3 font-medium">Customer</th>
                                    <th className="px-4 py-3 font-medium">Pack</th>
                                    <th className="px-4 py-3 text-right font-medium">Total</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {visible.map((order) => {
                                    const open = openId === order.orderNumber;
                                    return (
                                        <Fragment key={order.orderNumber}>
                                            <tr>
                                                <td className="px-4 py-3 font-medium tabular-nums">
                                                    {order.orderNumber}
                                                    {order.isSample ? <span className="ml-1.5 text-xs font-normal text-gray-400">sample</span> : null}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{formatDate(order.createdAt)}</td>
                                                <td className="px-4 py-3">
                                                    {order.shippingAddress.name}
                                                    <a href={telHref(order.shippingAddress.phone)} className="block text-xs tabular-nums text-gray-500 hover:underline">
                                                        {order.shippingAddress.phone}
                                                    </a>
                                                </td>
                                                <td className="px-4 py-3">{variantLabel(order.orderItems[0].variant)}</td>
                                                <td className="px-4 py-3 text-right tabular-nums">{takaEn(order.totalPrice)}</td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        aria-label={`Status of ${order.orderNumber}`}
                                                        value={order.orderStatus}
                                                        onChange={(e) => updateOrderStatus(order.orderNumber, e.target.value)}
                                                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                                                    >
                                                        {ORDER_STATUSES.map((s) => (
                                                            <option key={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        aria-expanded={open}
                                                        onClick={() => setOpenId(open ? null : order.orderNumber)}
                                                        className="text-sm font-medium text-gray-700 underline underline-offset-2"
                                                    >
                                                        {open ? "Hide" : "Details"}
                                                    </button>
                                                </td>
                                            </tr>
                                            {open ? (
                                                <tr className="bg-gray-50">
                                                    <td colSpan={7} className="px-4 py-4">
                                                        <div className="grid gap-5 sm:grid-cols-3">
                                                            <div>
                                                                <p className="text-xs text-gray-500">Delivery address</p>
                                                                <p className="mt-1">{order.shippingAddress.addressLine1}</p>
                                                                <p className="text-gray-600">{order.shippingAddress.locationLabel}</p>
                                                                {order.customerNote ? <p className="mt-2 text-gray-600">Note: {order.customerNote}</p> : null}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Payment (cash on delivery)</p>
                                                                <p className="mt-1 tabular-nums">Items {takaEn(order.itemsPrice)}</p>
                                                                <p className="tabular-nums">Delivery {takaEn(order.shippingPrice)}</p>
                                                                <p className="font-medium tabular-nums">To collect {takaEn(order.totalPrice)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">History</p>
                                                                <ul className="mt-1 space-y-1">
                                                                    {order.statusHistory.map((h, i) => (
                                                                        <li key={i} className="flex items-center gap-2">
                                                                            <StatusBadge status={h.status} />
                                                                            <span className="text-xs text-gray-500">{formatDate(h.updatedAt)}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                        <Button variant="danger" className="mt-4" onClick={() => deleteOrder(order.orderNumber)}>
                                                            Delete this order
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ) : null}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </>
    );
}
