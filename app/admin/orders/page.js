"use client";

import { Fragment, Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import OrderDetail from "@/components/admin/OrderDetail";
import { Button, Card, ErrorNote, PageHeader, Pagination, PaymentBadge, StatusBadge, formatDate, inputClass } from "@/components/admin/ui";
import { useResource } from "@/components/admin/useResource";
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, adminFetch, qs } from "@/lib/admin/api";
import { itemLabel, takaEn, telHref } from "@/lib/format";

const FILTERS = ["status", "paymentStatus", "paymentMethod", "q", "from", "to", "page"];

export default function OrdersPage() {
    return (
        <Suspense fallback={null}>
            <Orders />
        </Suspense>
    );
}

// Filters live in the URL, so a filtered list can be bookmarked or opened
// from the overview cards, and the back button works.
function Orders() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();
    const filters = Object.fromEntries(FILTERS.map((k) => [k, params.get(k) || ""]));
    const page = Math.max(1, Number(filters.page) || 1);

    const list = useResource(`/api/admin/orders${qs({ ...filters, page, limit: 20 })}`);
    const [search, setSearch] = useState(filters.q);
    const [openId, setOpenId] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState(null);

    const setFilters = (next) => {
        const merged = { ...filters, page: "", ...next };
        router.replace(`${pathname}${qs(merged)}`, { scroll: false });
        setOpenId(null);
    };

    const exportCsv = async () => {
        setExporting(true);
        setExportError(null);
        try {
            const res = await adminFetch(`/api/admin/orders/export${qs({ ...filters, page: "" })}`, { raw: true });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            setExportError(err);
        } finally {
            setExporting(false);
        }
    };

    const data = list.data;
    const counts = data?.statusCounts || {};

    return (
        <>
            <PageHeader title="Orders" description="Confirm by phone, verify bKash/Nagad payments, and move orders through delivery.">
                <Button onClick={exportCsv} disabled={exporting}>
                    <Download aria-hidden className="h-4 w-4" /> {exporting ? "Exporting..." : "Export CSV"}
                </Button>
            </PageHeader>
            <ErrorNote error={list.error || exportError} onRetry={list.error ? list.reload : undefined} />

            <div className="mb-3 flex flex-wrap gap-1.5">
                {["", ...ORDER_STATUSES].map((s) => {
                    const active = filters.status === s;
                    return (
                        <button
                            key={s || "all"}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setFilters({ status: s })}
                            className={`rounded-full px-3 py-1 text-sm ${active ? "bg-gray-900 text-white" : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"}`}
                        >
                            {s || "All"}
                            {s && data ? <span className="ml-1 tabular-nums opacity-70">{counts[s] || 0}</span> : null}
                        </button>
                    );
                })}
                {data?.needsAttention?.paymentsToVerify ? (
                    <button
                        type="button"
                        onClick={() => setFilters({ paymentStatus: "Verifying", status: "" })}
                        className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900 hover:bg-amber-200"
                    >
                        {data.needsAttention.paymentsToVerify} payment(s) to verify
                    </button>
                ) : null}
            </div>

            <div className="mb-4 flex flex-wrap items-end gap-3">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setFilters({ q: search.trim() });
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="search"
                        aria-label="Search orders"
                        placeholder="Order number, phone, TrxID or name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${inputClass} w-72`}
                    />
                    <Button type="submit">Search</Button>
                </form>
                <select
                    aria-label="Payment status"
                    value={filters.paymentStatus}
                    onChange={(e) => setFilters({ paymentStatus: e.target.value })}
                    className={`${inputClass} w-40`}
                >
                    <option value="">Any payment</option>
                    {PAYMENT_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                    ))}
                </select>
                <select
                    aria-label="Payment method"
                    value={filters.paymentMethod}
                    onChange={(e) => setFilters({ paymentMethod: e.target.value })}
                    className={`${inputClass} w-36`}
                >
                    <option value="">Any method</option>
                    {PAYMENT_METHODS.map((s) => (
                        <option key={s}>{s}</option>
                    ))}
                </select>
                <label className="text-xs text-gray-500">
                    From
                    <input type="date" value={filters.from} onChange={(e) => setFilters({ from: e.target.value })} className={`${inputClass} mt-0.5 w-40`} />
                </label>
                <label className="text-xs text-gray-500">
                    To
                    <input type="date" value={filters.to} onChange={(e) => setFilters({ to: e.target.value })} className={`${inputClass} mt-0.5 w-40`} />
                </label>
                {FILTERS.some((k) => k !== "page" && filters[k]) ? (
                    <Button
                        onClick={() => {
                            setSearch("");
                            router.replace(pathname, { scroll: false });
                        }}
                    >
                        Clear filters
                    </Button>
                ) : null}
            </div>

            <Card className="[&>div]:p-0">
                {!data ? (
                    <p className="p-5 text-sm text-gray-500">{list.loading ? "Loading..." : ""}</p>
                ) : data.orders.length === 0 ? (
                    <p className="p-5 text-sm text-gray-500">No orders match these filters.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[54rem] text-left text-sm">
                            <thead className="border-b border-gray-200 text-xs text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Order</th>
                                    <th className="px-4 py-3 font-medium">Placed</th>
                                    <th className="px-4 py-3 font-medium">Customer</th>
                                    <th className="px-4 py-3 font-medium">Items</th>
                                    <th className="px-4 py-3 text-right font-medium">Total</th>
                                    <th className="px-4 py-3 font-medium">Payment</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.orders.map((order) => {
                                    const open = openId === order.orderNumber;
                                    return (
                                        <Fragment key={order.orderNumber}>
                                            <tr className={open ? "bg-gray-50" : ""}>
                                                <td className="px-4 py-3 font-medium tabular-nums">{order.orderNumber}</td>
                                                <td className="px-4 py-3 text-gray-600">{formatDate(order.createdAt)}</td>
                                                <td className="px-4 py-3">
                                                    {order.shippingAddress.name}
                                                    <a href={telHref(order.shippingAddress.phone)} className="block text-xs tabular-nums text-gray-500 hover:underline">
                                                        {order.shippingAddress.phone}
                                                    </a>
                                                </td>
                                                <td className="px-4 py-3">{order.orderItems.map(itemLabel).join(", ")}</td>
                                                <td className="px-4 py-3 text-right tabular-nums">{takaEn(order.totalPrice)}</td>
                                                <td className="px-4 py-3">
                                                    <span className="mr-1.5 text-gray-600">{order.paymentMethod}</span>
                                                    <PaymentBadge status={order.paymentStatus} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={order.orderStatus} />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        aria-expanded={open}
                                                        onClick={() => setOpenId(open ? null : order.orderNumber)}
                                                        className="text-sm font-medium text-gray-700 underline underline-offset-2"
                                                    >
                                                        {open ? "Hide" : "Open"}
                                                    </button>
                                                </td>
                                            </tr>
                                            {open ? (
                                                <tr className="bg-gray-50">
                                                    <td colSpan={8} className="px-4 pb-5 pt-1">
                                                        <OrderDetail orderNumber={order.orderNumber} onChanged={list.reload} />
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
                {data ? <Pagination page={data.currentPage} totalPages={data.totalPages} total={data.total} onPage={(p) => setFilters({ page: p })} /> : null}
            </Card>
        </>
    );
}
