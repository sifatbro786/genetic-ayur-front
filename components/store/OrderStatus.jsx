"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { CircleAlert, CircleCheck, Clock, RefreshCw } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { itemLabel, normalizePhone, taka, telHref, toBn } from "@/lib/format";
import { ORDER_STATUS_BN, PAYMENT_STATUS_BN, methodLabel } from "@/lib/payments";
import { getOrderToken } from "@/lib/storage";

// The ?payment= value the API adds when a gateway sends the shopper back. It
// is only a hint for the banner; the status shown below comes from the API.
const RETURN_BANNERS = {
    success: { tone: "ok", text: "পেমেন্ট সম্পন্ন হয়েছে। ধন্যবাদ!" },
    review: { tone: "wait", text: "পেমেন্টটি যাচাই করা হচ্ছে। নিশ্চিত হলে আমরা জানাব।" },
    failed: { tone: "bad", text: "পেমেন্ট সম্পন্ন হয়নি। নিচের বোতাম থেকে আবার চেষ্টা করতে পারেন।" },
    cancelled: { tone: "bad", text: "পেমেন্ট বাতিল করা হয়েছে। চাইলে আবার চেষ্টা করুন।" },
};

const TIMELINE = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];
const TRX_RE = /^[A-Za-z0-9]{6,20}$/;

// Dates are formatted only after the order arrives (client side), so server
// and browser output never have to match.
const formatDate = (iso) =>
    new Date(iso).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });

export default function OrderStatus({ site }) {
    const { orderNumber } = useParams();
    const payment = useSearchParams().get("payment");
    const [state, setState] = useState({ status: "loading", order: null, error: "" });
    const [nonce, setNonce] = useState(0);

    useEffect(() => {
        const token = getOrderToken(orderNumber);
        if (!token) {
            // Read in an effect: localStorage does not exist on the server.
            Promise.resolve().then(() => setState({ status: "no-token", order: null, error: "" }));
            return undefined;
        }
        const ctrl = new AbortController();
        apiFetch(`/api/orders/${encodeURIComponent(orderNumber)}`, { headers: { "X-Order-Token": token }, signal: ctrl.signal })
            .then((res) => setState({ status: "ready", order: res.order, error: "" }))
            .catch((err) => {
                if (err?.name === "AbortError") return;
                setState((s) => ({ status: err.status === 404 ? "not-found" : s.order ? "ready" : "error", order: s.order, error: err.message }));
            });
        return () => ctrl.abort();
    }, [orderNumber, nonce]);

    const reload = () => setNonce((n) => n + 1);
    const { status, order } = state;

    if (status === "loading") {
        return <p className="py-24 text-center text-lg text-kali-soft">অর্ডারের তথ্য আনা হচ্ছে...</p>;
    }
    if (status !== "ready") {
        const text =
            status === "no-token"
                ? "এই অর্ডারটি অন্য ফোন বা ব্রাউজার থেকে করা হয়েছে, তাই এখানে দেখানো যাচ্ছে না।"
                : status === "not-found"
                  ? "এই নম্বরে কোনো অর্ডার পাওয়া যায়নি।"
                  : state.error;
        return (
            <div className="mx-auto max-w-xl py-20 text-center">
                <CircleAlert aria-hidden className="mx-auto h-12 w-12 text-dalchini" strokeWidth={1.5} />
                <h1 className="mt-4 font-display text-3xl font-bold text-bon">অর্ডার {orderNumber}</h1>
                <p className="mt-3 text-lg text-kali-soft">{text}</p>
                <p className="mt-2 text-lg text-kali-soft">অর্ডারের খোঁজ নিতে অর্ডার নম্বরসহ আমাদের ফোন করুন।</p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <a href={telHref(site.phone)} className="rounded-full bg-bon px-6 py-3 text-lg font-semibold text-kagoj hover:bg-bon-deep">
                        ফোন করুন {site.phone}
                    </a>
                    {status === "error" ? (
                        <button type="button" onClick={reload} className="rounded-full border-2 border-bon/25 px-6 py-3 text-lg font-semibold text-bon hover:border-bon">
                            আবার চেষ্টা করুন
                        </button>
                    ) : null}
                </div>
            </div>
        );
    }

    const banner = RETURN_BANNERS[payment];
    const cancelled = order.orderStatus === "Cancelled";
    const step = TIMELINE.indexOf(order.orderStatus);

    return (
        <div className="mx-auto max-w-3xl py-14 sm:py-20">
            <p className="-rotate-1 font-hand text-2xl text-dalchini">ধন্যবাদ, {order.shippingAddress?.name}</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                <h1 className="font-display text-3xl font-bold leading-[1.35] text-bon sm:text-4xl">অর্ডার {order.orderNumber}</h1>
                <button
                    type="button"
                    onClick={reload}
                    className="inline-flex items-center gap-1.5 rounded-full border border-bon/25 px-4 py-1.5 text-[15px] font-medium text-bon hover:border-bon"
                >
                    <RefreshCw aria-hidden className="h-4 w-4" /> হালনাগাদ
                </button>
            </div>
            <p className="mt-1 text-kali-soft">{formatDate(order.createdAt)}</p>

            {banner ? (
                <p
                    role="status"
                    className={`mt-6 rounded-xl px-5 py-3.5 text-[17px] font-medium ${
                        banner.tone === "ok" ? "bg-pata/15 text-bon" : banner.tone === "wait" ? "bg-sona-light/60 text-kali" : "bg-dalchini/10 text-dalchini"
                    }`}
                >
                    {banner.text}
                </p>
            ) : null}

            <section aria-label="অর্ডারের অবস্থা" className="mt-8 rounded-2xl bg-kagoj-deep/70 px-5 py-6 sm:px-7">
                {cancelled ? (
                    <p className="text-xl font-semibold text-dalchini">{ORDER_STATUS_BN.Cancelled}</p>
                ) : (
                    <ol className="grid gap-3 sm:grid-cols-5 sm:gap-2">
                        {TIMELINE.map((s, i) => {
                            const done = i <= step;
                            return (
                                <li key={s} className="flex items-center gap-2.5 sm:flex-col sm:items-start sm:gap-2">
                                    <span
                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                            done ? "bg-bon text-kagoj" : "border-2 border-bon/25 text-bon/50"
                                        }`}
                                    >
                                        {done ? <CircleCheck aria-hidden className="h-4 w-4" /> : toBn(i + 1)}
                                    </span>
                                    <span className={`text-[15px] leading-snug ${done ? "font-semibold text-kali" : "text-kali-soft"}`}>
                                        {ORDER_STATUS_BN[s]}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                )}
                <p className="mt-5 flex items-center gap-2 border-t border-bon/15 pt-4 text-[16px] text-kali">
                    <Clock aria-hidden className="h-4 w-4 text-pata" />
                    {methodLabel(order.paymentMethod, site)}: {PAYMENT_STATUS_BN[order.paymentStatus] || order.paymentStatus}
                </p>
            </section>

            {order.canRetryPayment ? <RetryPayment order={order} /> : null}
            {order.canResubmitTrxId ? <ResubmitTrx order={order} site={site} onDone={(o) => setState({ status: "ready", order: o, error: "" })} /> : null}

            <section className="mt-8">
                <h2 className="font-display text-2xl font-semibold text-bon">অর্ডারের বিবরণ</h2>
                <ul className="mt-4 divide-y divide-bon/15 border-y border-bon/15">
                    {order.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-4 py-4">
                            {item.image ? <img src={item.image} alt="" className="h-14 w-14 shrink-0 object-contain" /> : null}
                            <div className="min-w-0 flex-1">
                                <p className="text-lg font-semibold text-kali">{item.nameBn || item.name}</p>
                                <p className="text-[15px] text-kali-soft">{toBn(itemLabel(item))}</p>
                            </div>
                            <p className="font-display text-xl font-bold text-bon">{taka(item.lineTotal)}</p>
                        </li>
                    ))}
                </ul>
                <dl className="mt-4 space-y-2 text-[17px]">
                    <Row label="পণ্যের মূল্য" value={taka(order.itemsPrice)} />
                    <Row label="ডেলিভারি চার্জ" value={order.shippingPrice === 0 ? "ফ্রি" : taka(order.shippingPrice)} />
                    <Row label="মোট" value={taka(order.totalPrice)} strong />
                    {order.amountPaid > 0 ? <Row label="পরিশোধ করেছেন" value={taka(order.amountPaid)} /> : null}
                    <Row label="হাতে পেয়ে দেবেন" value={order.payOnDelivery === 0 ? "কিছু না" : taka(order.payOnDelivery)} />
                </dl>
            </section>

            <section className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                    <h2 className="font-display text-xl font-semibold text-bon">ডেলিভারি ঠিকানা</h2>
                    <p className="mt-2 text-[17px] text-kali">{order.shippingAddress?.name}</p>
                    <p className="text-[17px] tabular-nums text-kali-soft">{order.shippingAddress?.phone}</p>
                    <p className="text-[17px] text-kali-soft">{order.shippingAddress?.addressLine1}</p>
                    <p className="text-[15px] text-kali-soft">{order.shippingAddress?.locationLabel}</p>
                </div>
                <div className="rounded-2xl bg-bon-deep px-5 py-5 text-kagoj">
                    <p className="font-display text-xl font-semibold text-sona-light">কিছু জানার আছে?</p>
                    <p className="mt-1 text-kagoj/75">অর্ডার নম্বরটি বলে আমাদের ফোন করুন।</p>
                    <a href={telHref(site.phone)} className="mt-3 inline-block font-display text-2xl font-bold tabular-nums text-kagoj">
                        {site.phone}
                    </a>
                </div>
            </section>

            <p className="mt-10">
                <Link href="/" className="font-medium text-bon underline underline-offset-4">
                    মূল পাতায় ফিরুন
                </Link>
            </p>
        </div>
    );
}

function Row({ label, value, strong }) {
    return (
        <div className={`flex justify-between gap-4 ${strong ? "border-t border-bon/15 pt-2 text-xl font-semibold" : ""}`}>
            <dt className={strong ? "text-kali" : "text-kali-soft"}>{label}</dt>
            <dd className={strong ? "font-display text-2xl font-bold text-bon" : "font-medium text-kali"}>{value}</dd>
        </div>
    );
}

function RetryPayment({ order }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const pay = async () => {
        setBusy(true);
        setError("");
        try {
            const res = await apiFetch(`/api/orders/${encodeURIComponent(order.orderNumber)}/pay`, {
                method: "POST",
                headers: { "X-Order-Token": getOrderToken(order.orderNumber) || "" },
            });
            const url = res.nextAction?.url;
            if (url && /^https?:\/\//.test(url)) {
                window.location.assign(url);
                return;
            }
            setError("পেমেন্ট পেজ খোলা যায়নি। একটু পরে আবার চেষ্টা করুন।");
        } catch (err) {
            setError(err.message);
        }
        setBusy(false);
    };

    return (
        <div className="mt-6 rounded-2xl border-2 border-sona/60 bg-sona-light/30 px-5 py-5">
            <p className="text-[17px] text-kali">
                এই অর্ডারের <strong>{taka(order.payNow)}</strong> পেমেন্ট এখনো বাকি।
            </p>
            {error ? (
                <p role="alert" className="mt-2 text-[15px] text-red-700">
                    {error}
                </p>
            ) : null}
            <button
                type="button"
                onClick={pay}
                disabled={busy}
                className="mt-3 rounded-full bg-bon px-6 py-3 text-lg font-semibold text-kagoj hover:bg-bon-deep disabled:bg-kali-soft/50"
            >
                {busy ? "পেমেন্ট পেজ খোলা হচ্ছে..." : `এখন পেমেন্ট করুন (${taka(order.payNow)})`}
            </button>
        </div>
    );
}

function ResubmitTrx({ order, site, onDone }) {
    const [trxId, setTrxId] = useState("");
    const [sender, setSender] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const method = order.manualPayment?.method;
    const wallet = method === "bKash" ? site.payment?.bkash : method === "Nagad" ? site.payment?.nagad : null;

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        if (!TRX_RE.test(trxId.trim())) return setError("সঠিক TrxID লিখুন");
        if (!normalizePhone(sender)) return setError("যে নম্বর থেকে টাকা পাঠিয়েছেন সেটি লিখুন");
        setBusy(true);
        try {
            const res = await apiFetch(`/api/orders/${encodeURIComponent(order.orderNumber)}/payment`, {
                method: "POST",
                headers: { "X-Order-Token": getOrderToken(order.orderNumber) || "" },
                body: { trxId: trxId.trim().toUpperCase(), senderNumber: normalizePhone(sender) },
            });
            onDone(res.order);
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };

    const input =
        "mt-1.5 w-full rounded-lg border border-bon/25 bg-white px-4 py-3 text-[17px] text-kali focus:border-pata focus:outline-none focus:ring-2 focus:ring-pata/25";

    return (
        <form onSubmit={submit} noValidate className="mt-6 rounded-2xl border-2 border-dalchini/40 bg-white px-5 py-5">
            <p className="text-[17px] font-semibold text-dalchini">আগের TrxID-টি মেলেনি</p>
            {order.manualPayment?.rejectReason ? <p className="mt-1 text-[16px] text-kali-soft">কারণ: {order.manualPayment.rejectReason}</p> : null}
            <p className="mt-2 text-[16px] text-kali-soft">
                {methodLabel(method, site)} নম্বর {wallet?.number ? <strong className="tabular-nums text-kali">{wallet.number}</strong> : null}-এ{" "}
                {taka(order.payNow)} পাঠিয়ে থাকলে সঠিক TrxID দিন।
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-[16px] font-medium text-kali">
                    TrxID
                    <input value={trxId} onChange={(e) => setTrxId(e.target.value)} maxLength={20} autoComplete="off" spellCheck={false} className={input} />
                </label>
                <label className="text-[16px] font-medium text-kali">
                    যে নম্বর থেকে পাঠিয়েছেন
                    <input value={sender} onChange={(e) => setSender(e.target.value)} type="tel" inputMode="numeric" maxLength={20} className={input} />
                </label>
            </div>
            {error ? (
                <p role="alert" className="mt-3 text-[15px] text-red-700">
                    {error}
                </p>
            ) : null}
            <button type="submit" disabled={busy} className="mt-4 rounded-full bg-bon px-6 py-3 text-lg font-semibold text-kagoj hover:bg-bon-deep disabled:bg-kali-soft/50">
                {busy ? "পাঠানো হচ্ছে..." : "TrxID পাঠান"}
            </button>
        </form>
    );
}
