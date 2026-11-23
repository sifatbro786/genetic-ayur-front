"use client";

import { useState } from "react";
import { adminFetch, STATUS_FLOW } from "@/lib/admin/api";
import { itemLabel, takaEn, telHref } from "@/lib/format";
import { Button, PaymentBadge, StatusBadge, formatDate, inputClass } from "./ui";
import { useResource } from "./useResource";

const PAID = ["Paid", "Advance Paid"];

// Expanded view of one order: everything the person calling the customer
// needs, and every action the API allows from the current state. The API
// checks each transition again; the buttons only reflect STATUS_FLOW.
export default function OrderDetail({ orderNumber, onChanged }) {
    const detail = useResource(`/api/admin/orders/${orderNumber}`);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState(null);

    const act = async (path, method, body, done) => {
        setBusy(true);
        setNotice(null);
        try {
            const res = await adminFetch(`/api/admin/orders/${orderNumber}${path}`, { method, body });
            if (res.order) detail.setData({ ...detail.data, order: res.order });
            if (res.warning) setNotice({ ok: true, text: res.warning });
            else if (res.outcome) setNotice({ ok: true, text: `Gateway says: ${res.gatewayStatus || res.outcome}` });
            done?.();
            onChanged?.();
        } catch (err) {
            setNotice({ ok: false, text: err.message });
        } finally {
            setBusy(false);
        }
    };

    if (!detail.data) {
        return <p className="text-sm text-gray-500">{detail.error ? detail.error.message : "Loading order..."}</p>;
    }
    const { order, customer } = detail.data;
    const a = order.shippingAddress;

    return (
        <div className="space-y-5 text-sm">
            {notice ? (
                <p role="status" className={`rounded-md px-3 py-2 ${notice.ok ? "bg-amber-50 text-amber-900" : "bg-red-50 text-red-800"}`}>
                    {notice.text}
                </p>
            ) : null}

            <div className="grid gap-5 lg:grid-cols-3">
                <section>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Customer</h3>
                    <p className="mt-1.5 font-medium">{a.name}</p>
                    <a href={telHref(a.phone)} className="tabular-nums text-gray-700 hover:underline">
                        {a.phone}
                    </a>
                    <p className="mt-1 text-gray-700">{a.addressLine1}</p>
                    <p className="text-gray-500">{a.locationLabel}</p>
                    {order.customerNote ? <p className="mt-2 rounded bg-gray-100 px-2 py-1 text-gray-700">Note: {order.customerNote}</p> : null}
                    {customer ? (
                        <p className={`mt-2 text-xs ${customer.cancelledCount > 0 ? "text-red-700" : "text-gray-500"}`}>
                            This phone: {customer.orderCount} orders, {customer.deliveredCount} delivered, {customer.cancelledCount} cancelled
                        </p>
                    ) : null}
                </section>

                <section>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Items</h3>
                    <ul className="mt-1.5 space-y-1">
                        {order.orderItems.map((item, i) => (
                            <li key={i} className="flex justify-between gap-3">
                                <span>
                                    {item.nameBn || item.name}
                                    <span className="text-gray-500"> ({itemLabel(item)})</span>
                                </span>
                                <span className="tabular-nums">{takaEn(item.lineTotal)}</span>
                            </li>
                        ))}
                    </ul>
                    <dl className="mt-3 space-y-0.5 border-t border-gray-200 pt-2 tabular-nums">
                        <Line label="Items" value={takaEn(order.itemsPrice)} />
                        <Line label="Delivery" value={takaEn(order.shippingPrice)} />
                        <Line label="Total" value={takaEn(order.totalPrice)} strong />
                        {order.payNow > 0 ? <Line label={`Pay first (${order.payNowVia?.method || "-"})`} value={takaEn(order.payNow)} /> : null}
                        <Line label="Received" value={takaEn(order.amountPaid || 0)} />
                        <Line label="Courier collects" value={takaEn(order.payOnDelivery)} strong />
                    </dl>
                </section>

                <section>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Payment</h3>
                    <p className="mt-1.5 flex items-center gap-2">
                        {order.paymentMethod}
                        <PaymentBadge status={order.paymentStatus} />
                    </p>
                    <PaymentPanel order={order} busy={busy} act={act} />
                </section>
            </div>

            <StatusPanel order={order} busy={busy} act={act} />

            <div className="grid gap-5 lg:grid-cols-2">
                <section>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">History</h3>
                    <ul className="mt-1.5 space-y-1.5">
                        {order.statusHistory.map((h, i) => (
                            <li key={i} className="flex flex-wrap items-center gap-2">
                                <StatusBadge status={h.status} />
                                <span className="text-xs text-gray-500">
                                    {formatDate(h.updatedAt)}
                                    {h.updatedBy?.name ? `, ${h.updatedBy.name}` : ""}
                                </span>
                                {h.note ? <span className="w-full text-xs text-gray-600">{h.note}</span> : null}
                            </li>
                        ))}
                    </ul>
                </section>
                <Notes order={order} busy={busy} act={act} />
            </div>
        </div>
    );
}

function Line({ label, value, strong }) {
    return (
        <div className={`flex justify-between gap-3 ${strong ? "font-medium" : "text-gray-600"}`}>
            <dt>{label}</dt>
            <dd>{value}</dd>
        </div>
    );
}

function PaymentPanel({ order, busy, act }) {
    const [reason, setReason] = useState("");
    const [mode, setMode] = useState(null); // "reject" | "refunded"
    const m = order.manualPayment;
    const g = order.gatewayPayment;

    return (
        <div className="mt-2 space-y-2">
            {m ? (
                <dl className="space-y-0.5 rounded-md bg-gray-50 px-3 py-2">
                    <Line label={`${m.method} TrxID`} value={<span className="font-mono">{m.trxId}</span>} />
                    <Line label="Sent from" value={m.senderNumber} />
                    <Line label="Amount due" value={takaEn(m.amount)} />
                    <Line label="Submitted" value={formatDate(m.submittedAt)} />
                    {m.verifiedAt ? <Line label="Verified" value={`${formatDate(m.verifiedAt)}${m.verifiedBy?.name ? `, ${m.verifiedBy.name}` : ""}`} /> : null}
                    {m.rejectReason ? <Line label="Rejected" value={m.rejectReason} /> : null}
                    {m.previous?.length ? (
                        <p className="pt-1 text-xs text-gray-500">Earlier TrxIDs: {m.previous.map((p) => `${p.trxId} (${p.rejectReason || "rejected"})`).join(", ")}</p>
                    ) : null}
                </dl>
            ) : null}
            {g ? (
                <dl className="space-y-0.5 rounded-md bg-gray-50 px-3 py-2">
                    <Line label="Gateway" value={g.provider} />
                    {g.trxId ? <Line label="Transaction" value={<span className="font-mono">{g.trxId}</span>} /> : null}
                    {g.amount ? <Line label="Amount" value={takaEn(g.amount)} /> : null}
                    {g.cardType ? <Line label="Paid with" value={g.cardType} /> : null}
                    {g.paidAt ? <Line label="Paid at" value={formatDate(g.paidAt)} /> : null}
                    <Line label="Attempts" value={g.attempts || 0} />
                    {g.lastError ? <p className="pt-1 text-xs text-red-700">Last error: {g.lastError}</p> : null}
                </dl>
            ) : null}

            {order.paymentStatus === "Verifying" ? (
                <div className="space-y-2">
                    <p className="text-xs text-gray-600">
                        {m
                            ? `Open the ${m.method} app and check that ${takaEn(m.amount)} arrived from ${m.senderNumber} with TrxID ${m.trxId}.`
                            : "The gateway flagged this payment for a manual check. Look it up in the gateway panel."}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="primary" disabled={busy} onClick={() => act("/payment", "PATCH", { action: "verify" })}>
                            Payment received
                        </Button>
                        {m ? (
                            <Button variant="danger" disabled={busy} onClick={() => setMode("reject")}>
                                Not received
                            </Button>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {g && ["Pending", "Verifying", "Failed"].includes(order.paymentStatus) && order.orderStatus !== "Cancelled" ? (
                <Button disabled={busy} onClick={() => act("/payment/recheck", "POST")}>
                    Ask {g.provider === "bkash" ? "bKash" : "SSLCommerz"} again
                </Button>
            ) : null}

            {PAID.includes(order.paymentStatus) && mode !== "refunded" ? (
                <Button disabled={busy} onClick={() => setMode("refunded")}>
                    Mark as refunded
                </Button>
            ) : null}

            {mode ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        act("/payment", "PATCH", { action: mode, reason: reason.trim() }, () => {
                            setMode(null);
                            setReason("");
                        });
                    }}
                    className="space-y-2 rounded-md border border-gray-200 p-3"
                >
                    <label className="block text-xs font-medium text-gray-700">
                        {mode === "reject" ? "Reason (the customer sees it on their order page)" : "Refund reference or reason"}
                        <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} required className={`${inputClass} mt-1`} />
                    </label>
                    {mode === "refunded" ? <p className="text-xs text-gray-500">Send the money back in the wallet app or gateway panel first; this only records it.</p> : null}
                    <div className="flex gap-2">
                        <Button type="submit" variant={mode === "reject" ? "danger" : "primary"} disabled={busy || !reason.trim()}>
                            {mode === "reject" ? "Reject payment" : "Record refund"}
                        </Button>
                        <Button onClick={() => setMode(null)}>Cancel</Button>
                    </div>
                </form>
            ) : null}
        </div>
    );
}

function StatusPanel({ order, busy, act }) {
    const [note, setNote] = useState("");
    const [confirmCancel, setConfirmCancel] = useState(false);
    const next = STATUS_FLOW[order.orderStatus] || [];
    if (!next.length) {
        return (
            <p className="flex items-center gap-2 text-gray-600">
                Status <StatusBadge status={order.orderStatus} /> (final)
            </p>
        );
    }

    const change = (status) =>
        act("/status", "PATCH", { status, ...(note.trim() ? { note: note.trim() } : {}) }, () => {
            setNote("");
            setConfirmCancel(false);
        });

    return (
        <section className="rounded-md border border-gray-200 bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-gray-600">Status</span>
                <StatusBadge status={order.orderStatus} />
                <span className="text-gray-400">→</span>
                {next
                    .filter((s) => s !== "Cancelled")
                    .map((s) => (
                        <Button key={s} variant="primary" disabled={busy} onClick={() => change(s)}>
                            {s}
                        </Button>
                    ))}
                {next.includes("Cancelled") ? (
                    confirmCancel ? (
                        <Button variant="danger" disabled={busy} onClick={() => change("Cancelled")}>
                            Yes, cancel order
                        </Button>
                    ) : (
                        <Button variant="danger" disabled={busy} onClick={() => setConfirmCancel(true)}>
                            Cancel order
                        </Button>
                    )
                ) : null}
            </div>
            <input
                aria-label="Note for this status change (optional)"
                placeholder="Note for this change (optional, e.g. courier tracking number)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={300}
                className={`${inputClass} mt-2`}
            />
            {order.orderStatus === "Pending" && order.payNow > 0 && !PAID.includes(order.paymentStatus) ? (
                <p className="mt-2 text-xs text-amber-800">This order must be paid ({takaEn(order.payNow)}) before it can be confirmed.</p>
            ) : null}
        </section>
    );
}

function Notes({ order, busy, act }) {
    const [note, setNote] = useState("");
    return (
        <section>
            <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Internal notes</h3>
            <ul className="mt-1.5 space-y-1.5">
                {(order.adminNotes || []).map((n, i) => (
                    <li key={i} className="rounded bg-gray-50 px-2 py-1">
                        <p className="whitespace-pre-line">{n.note}</p>
                        <p className="text-xs text-gray-500">
                            {formatDate(n.addedAt)}
                            {n.addedBy?.name ? `, ${n.addedBy.name}` : ""}
                        </p>
                    </li>
                ))}
            </ul>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (note.trim()) act("/notes", "POST", { note: note.trim() }, () => setNote(""));
                }}
                className="mt-2 flex gap-2"
            >
                <input
                    aria-label="Add a note"
                    placeholder="Add a note (only staff see it)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={1000}
                    className={inputClass}
                />
                <Button type="submit" disabled={busy || !note.trim()}>
                    Add
                </Button>
            </form>
        </section>
    );
}
