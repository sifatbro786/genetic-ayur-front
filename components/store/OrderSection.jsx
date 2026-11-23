"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleCheck, Copy, MessageCircle, Minus, Plus } from "lucide-react";
import { apiFetch, newRequestId } from "@/lib/api/client";
import { itemLabel, normalizePhone, taka, toBn, variantLabel, whatsappHref } from "@/lib/format";
import { methodHint, methodLabel, walletAction, walletFor } from "@/lib/payments";
import { saveOrderToken } from "@/lib/storage";

const EMPTY = { name: "", phone: "", address: "", note: "", trxId: "", senderNumber: "" };
const TRX_RE = /^[A-Za-z0-9]{6,20}$/;
// Answers that mean the form's picture of the product is out of date; the
// form asks for a fresh quote so the shopper sees the current state.
const REQUOTE_CODES = ["OUT_OF_STOCK", "QUANTITY_LIMIT", "PRODUCT_UNAVAILABLE", "PACK_NOT_FOUND", "ZONE_UNAVAILABLE", "PAYMENT_UNAVAILABLE", "ADVANCE_METHOD_UNAVAILABLE"];
// Fallback copy for a product page when the landing page's order section is
// hidden (the API does not send hidden sections).
const DEFAULT_COPY = {
    title: "অর্ডার করুন",
    text: "নিচের ফর্মটি পূরণ করুন। আমরা ফোন করে অর্ডার নিশ্চিত করব।",
    submitLabel: "অর্ডার নিশ্চিত করুন",
    successTitle: "ধন্যবাদ, অর্ডার পেয়েছি",
    successText: "আমাদের প্রতিনিধি শীঘ্রই ফোন করে অর্ডারটি নিশ্চিত করবেন।",
};

function validate(form, needsTrx) {
    const errors = {};
    if (form.name.trim().length < 2) errors.name = "আপনার নাম লিখুন";
    if (!normalizePhone(form.phone)) errors.phone = "১১ সংখ্যার সঠিক মোবাইল নম্বর লিখুন (যেমন 017XXXXXXXX)";
    if (form.address.trim().length < 10) errors.address = "বাসা, রোড, এলাকা ও জেলাসহ পুরো ঠিকানা লিখুন";
    if (needsTrx) {
        if (!TRX_RE.test(form.trxId.trim())) errors.trxId = "পেমেন্টের পর পাওয়া TrxID লিখুন";
        if (!normalizePhone(form.senderNumber)) errors.senderNumber = "যে নম্বর থেকে টাকা পাঠিয়েছেন সেটি লিখুন";
    }
    return errors;
}

// Gateway URLs come from our own API, but a redirect is still only followed
// to an http(s) address.
const isWebUrl = (url) => {
    try {
        return ["https:", "http:"].includes(new URL(url).protocol);
    } catch {
        return false;
    }
};

const fieldClass =
    "mt-1.5 w-full rounded-lg border border-bon/25 bg-white px-4 py-3 text-[17px] text-kali placeholder:text-kali-soft/60 focus:border-pata focus:outline-none focus:ring-2 focus:ring-pata/25 aria-[invalid=true]:border-red-600";

// Every amount on this form comes from POST /api/checkout/calculate. The form
// sends what the shopper picked (product, pack, quantity, zone, payment
// method) and shows the totals the API answers with; POST /api/orders
// recomputes the same numbers on the server.
export default function OrderSection({ data, products, initialSlug, site }) {
    const copy = { ...DEFAULT_COPY, ...(data || {}) };
    const router = useRouter();
    const zones = site.shipping.filter((z) => z.enabled);
    const methods = site.payment?.methods || [];

    // null = "the shopper has not picked yet": the defaults below follow the
    // dashboard (landing product, popular pack, first zone and method).
    const [pickedSlug, setPickedSlug] = useState(null);
    const [pickedVariant, setPickedVariant] = useState(null);
    const [pickedZone, setPickedZone] = useState(null);
    const [pickedMethod, setPickedMethod] = useState(null);
    const [pickedAdvance, setPickedAdvance] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [form, setForm] = useState(EMPTY);
    const [website, setWebsite] = useState(""); // honeypot
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [placed, setPlaced] = useState(null);
    const [quote, setQuote] = useState({ key: "", totals: null, error: null, last: null });
    const [quoteNonce, setQuoteNonce] = useState(0);
    // One id per order attempt: a double tap or a retry after a dropped
    // connection returns the first order instead of creating a second one.
    const requestId = useRef(null);

    const product =
        products.find((p) => p.slug === pickedSlug) ||
        products.find((p) => p.slug === initialSlug) ||
        products.find((p) => p.inStock) ||
        products[0];
    const variants = product?.variants || [];
    const fallbackVariant = Math.max(
        variants.findIndex((v) => v.isPopular && v.inStock),
        variants.findIndex((v) => v.inStock),
        0,
    );
    const variantIndex = pickedVariant !== null && variants[pickedVariant] ? pickedVariant : fallbackVariant;
    const variant = variants[variantIndex];
    const maxQty = variant?.maxQuantity || 0;
    const qty = Math.max(1, Math.min(quantity, maxQty || 1));
    const soldOut = !product?.inStock || !variant?.inStock;
    const zoneKey = zones.some((z) => z.key === pickedZone) ? pickedZone : zones[0]?.key;
    const method = methods.some((m) => m.method === pickedMethod) ? pickedMethod : methods[0]?.method;

    const quoteBody =
        product && variant && !soldOut && zoneKey && method
            ? {
                  items: [{ slug: product.slug, options: variant.options, quantity: qty }],
                  zone: zoneKey,
                  paymentMethod: method,
                  ...(method === "COD" && pickedAdvance ? { advanceMethod: pickedAdvance } : {}),
              }
            : null;
    const quoteKey = quoteBody ? JSON.stringify(quoteBody) : "";

    useEffect(() => {
        if (!quoteKey) return undefined;
        const ctrl = new AbortController();
        // Short debounce: the quantity stepper can fire several times a second.
        const timer = setTimeout(() => {
            apiFetch("/api/checkout/calculate", { method: "POST", body: JSON.parse(quoteKey), signal: ctrl.signal })
                .then((res) => setQuote({ key: quoteKey, totals: res.totals, error: null, last: res.totals }))
                .catch((err) => {
                    if (err?.name === "AbortError") return;
                    setQuote((q) => ({ key: quoteKey, totals: null, error: err, last: q.last }));
                });
        }, 200);
        return () => {
            clearTimeout(timer);
            ctrl.abort();
        };
    }, [quoteKey, quoteNonce]);

    const fresh = Boolean(quoteKey) && quote.key === quoteKey;
    const totals = fresh ? quote.totals : null;
    // While a new quote loads, the last one stays on screen (dimmed) so the
    // numbers do not jump to blank on every tap.
    const shown = totals || (fresh ? null : quote.last);
    const quoteError = fresh ? quote.error : null;
    const needsTrx = Boolean(totals?.requiresTrxId);
    const advanceMethods = totals?.advanceMethods || [];
    const payVia = totals?.payNowVia;
    const wallet = needsTrx ? walletFor(site, payVia?.method) : null;

    const setField = (key) => (e) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const pickProduct = (slug) => {
        setPickedSlug(slug);
        setPickedVariant(null);
        setQuantity(1);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        const found = validate(form, needsTrx);
        setErrors(found);
        setSubmitError("");
        if (Object.keys(found).length) {
            document.getElementById(`order-${Object.keys(found)[0]}`)?.focus();
            return;
        }
        if (!totals) {
            setSubmitError(quoteError ? quoteError.message : "দাম হিসাব হচ্ছে, এক মুহূর্ত পরে আবার চাপুন।");
            return;
        }

        requestId.current ||= newRequestId();
        setSubmitting(true);
        try {
            const res = await apiFetch("/api/orders", {
                method: "POST",
                body: {
                    ...quoteBody,
                    name: form.name.trim(),
                    phone: normalizePhone(form.phone),
                    address: form.address.trim(),
                    note: form.note.trim(),
                    ...(needsTrx ? { trxId: form.trxId.trim().toUpperCase(), senderNumber: normalizePhone(form.senderNumber) } : {}),
                    clientRequestId: requestId.current,
                    website,
                },
            });
            requestId.current = null;
            // Saved before any redirect: the token is shown only once, and the
            // order page needs it to show this order after the gateway.
            const saved = saveOrderToken(res.orderNumber, res.guestAccessToken);
            const next = res.nextAction;
            if (next?.type === "redirect" && isWebUrl(next.url)) {
                window.location.assign(next.url);
                return; // keep the button disabled while the browser leaves
            }
            if (next?.type === "retry_payment") {
                router.push(`/order/${res.orderNumber}`);
                return;
            }
            setPlaced({ order: res.order, saved });
            setForm(EMPTY);
            setQuantity(1);
            setSubmitting(false);
        } catch (err) {
            setSubmitting(false);
            const fieldErrors = {};
            for (const fe of err.errors || []) {
                if (fe.field in EMPTY && !fieldErrors[fe.field]) fieldErrors[fe.field] = fe.message;
            }
            if (Object.keys(fieldErrors).length) {
                setErrors(fieldErrors);
                document.getElementById(`order-${Object.keys(fieldErrors)[0]}`)?.focus();
            } else {
                setSubmitError(err.message);
            }
            if (REQUOTE_CODES.includes(err.code)) setQuoteNonce((n) => n + 1);
        }
    };

    if (!product) return null;

    return (
        <section id="order" className="bg-bon-deep">
            <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
                {placed ? (
                    <OrderPlaced placed={placed} copy={copy} site={site} onAgain={() => setPlaced(null)} />
                ) : (
                    <>
                        <div className="max-w-2xl">
                            <h2 className="font-display text-4xl font-bold leading-[1.35] text-kagoj sm:text-5xl sm:leading-[1.3]">
                                {copy.title}
                            </h2>
                            <p className="mt-4 text-lg text-kagoj/75">{copy.text}</p>
                        </div>

                        <form onSubmit={onSubmit} noValidate className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
                            <div>
                                {products.length > 1 ? (
                                    <fieldset className="mb-9">
                                        <legend className="font-display text-2xl font-semibold text-sona-light">পণ্য বেছে নিন</legend>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            {products.map((p) => {
                                                const active = p.slug === product.slug;
                                                return (
                                                    <label
                                                        key={p.slug}
                                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 bg-kagoj px-3 py-3 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-kochi ${
                                                            active ? "border-sona" : "border-transparent hover:border-sona/50"
                                                        } ${p.inStock ? "" : "opacity-60"}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="product"
                                                            checked={active}
                                                            onChange={() => pickProduct(p.slug)}
                                                            className="sr-only"
                                                        />
                                                        {p.image ? <img src={p.image} alt="" className="h-12 w-12 shrink-0 object-contain" /> : null}
                                                        <span className="min-w-0 leading-snug">
                                                            <span className="block font-semibold text-kali">{p.nameBn}</span>
                                                            <span className="text-sm text-kali-soft">{p.inStock ? p.netWeight : "স্টকে নেই"}</span>
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </fieldset>
                                ) : null}

                                <PackPicker
                                    product={product}
                                    variantIndex={variantIndex}
                                    onPick={(i) => {
                                        setPickedVariant(i);
                                        setQuantity(1);
                                    }}
                                />

                                <div className="mt-6 flex items-center justify-between gap-4">
                                    <span id="qty-label" className="text-lg font-medium text-kagoj">
                                        পরিমাণ
                                    </span>
                                    <div role="group" aria-labelledby="qty-label" className="flex items-center rounded-full border-2 border-kagoj/30">
                                        <button
                                            type="button"
                                            aria-label="এক প্যাক কমান"
                                            disabled={qty <= 1 || soldOut}
                                            onClick={() => setQuantity(qty - 1)}
                                            className="flex h-11 w-11 items-center justify-center rounded-full text-kagoj hover:bg-kagoj/10 disabled:opacity-35"
                                        >
                                            <Minus aria-hidden className="h-5 w-5" />
                                        </button>
                                        <output aria-live="polite" className="w-10 text-center font-display text-2xl font-bold text-sona-light">
                                            {toBn(qty)}
                                        </output>
                                        <button
                                            type="button"
                                            aria-label="এক প্যাক বাড়ান"
                                            disabled={qty >= maxQty || soldOut}
                                            onClick={() => setQuantity(qty + 1)}
                                            className="flex h-11 w-11 items-center justify-center rounded-full text-kagoj hover:bg-kagoj/10 disabled:opacity-35"
                                        >
                                            <Plus aria-hidden className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <fieldset className="mt-9">
                                    <legend className="font-display text-2xl font-semibold text-sona-light">ডেলিভারি এলাকা</legend>
                                    <div className="mt-4 flex flex-wrap gap-2.5">
                                        {zones.map((zone) => {
                                            const active = zone.key === zoneKey;
                                            return (
                                                <label
                                                    key={zone.key}
                                                    className={`cursor-pointer rounded-full border-2 px-4 py-2 text-[16px] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-kochi ${
                                                        active ? "border-sona bg-sona text-kosh" : "border-kagoj/30 text-kagoj hover:border-kagoj/70"
                                                    }`}
                                                >
                                                    <input type="radio" name="zone" checked={active} onChange={() => setPickedZone(zone.key)} className="sr-only" />
                                                    {zone.label} ({taka(zone.charge)})
                                                </label>
                                            );
                                        })}
                                    </div>
                                </fieldset>

                                {methods.length > 1 || (methods.length === 1 && methods[0].method !== "COD") ? (
                                    <fieldset className="mt-9">
                                        <legend className="font-display text-2xl font-semibold text-sona-light">পেমেন্ট পদ্ধতি</legend>
                                        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                                            {methods.map((m) => {
                                                const active = m.method === method;
                                                return (
                                                    <label
                                                        key={m.method}
                                                        className={`cursor-pointer rounded-xl border-2 px-4 py-3 leading-snug transition-colors has-focus-visible:ring-2 has-focus-visible:ring-kochi ${
                                                            active ? "border-sona bg-sona text-kosh" : "border-kagoj/30 text-kagoj hover:border-kagoj/70"
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="payment"
                                                            checked={active}
                                                            onChange={() => setPickedMethod(m.method)}
                                                            className="sr-only"
                                                        />
                                                        <span className="block text-[17px] font-semibold">{methodLabel(m.method, site)}</span>
                                                        <span className={`text-sm ${active ? "text-kosh/75" : "text-kagoj/60"}`}>{methodHint(m)}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </fieldset>
                                ) : null}

                                {advanceMethods.length ? (
                                    <fieldset className="mt-7 rounded-xl border border-sona/50 px-4 py-4 text-kagoj">
                                        <legend className="px-1 text-lg font-semibold text-sona-light">ডেলিভারি চার্জ অগ্রিম দিন</legend>
                                        <p className="text-[15px] text-kagoj/75">
                                            ভুয়া অর্ডার ঠেকাতে শুধু ডেলিভারি চার্জ {taka(totals.payNow)} আগে নেওয়া হয়। পণ্যের দাম হাতে পেয়ে দেবেন।
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-2.5">
                                            {advanceMethods.map((am) => {
                                                const active = payVia?.method === am;
                                                return (
                                                    <label
                                                        key={am}
                                                        className={`cursor-pointer rounded-full border-2 px-4 py-1.5 text-[16px] has-focus-visible:ring-2 has-focus-visible:ring-kochi ${
                                                            active ? "border-sona bg-sona text-kosh" : "border-kagoj/30 hover:border-kagoj/70"
                                                        }`}
                                                    >
                                                        <input type="radio" name="advance" checked={active} onChange={() => setPickedAdvance(am)} className="sr-only" />
                                                        {methodLabel(am, site)}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </fieldset>
                                ) : null}

                                <Summary shown={shown} loading={!totals && !quoteError && !soldOut} quoteError={quoteError} onRetry={() => setQuoteNonce((n) => n + 1)} />
                            </div>

                            <div className="rounded-2xl bg-kagoj p-6 sm:p-8">
                                <p className="font-display text-2xl font-semibold text-kali">আপনার ঠিকানা</p>
                                <div className="mt-5 space-y-5">
                                    <Field id="order-name" label="আপনার নাম" error={errors.name}>
                                        <input
                                            id="order-name"
                                            type="text"
                                            autoComplete="name"
                                            maxLength={80}
                                            value={form.name}
                                            onChange={setField("name")}
                                            aria-invalid={Boolean(errors.name)}
                                            aria-describedby={errors.name ? "order-name-error" : undefined}
                                            className={fieldClass}
                                        />
                                    </Field>
                                    <Field id="order-phone" label="মোবাইল নম্বর" error={errors.phone}>
                                        <input
                                            id="order-phone"
                                            type="tel"
                                            inputMode="numeric"
                                            autoComplete="tel"
                                            maxLength={20}
                                            placeholder="01XXXXXXXXX"
                                            value={form.phone}
                                            onChange={setField("phone")}
                                            aria-invalid={Boolean(errors.phone)}
                                            aria-describedby={errors.phone ? "order-phone-error" : undefined}
                                            className={fieldClass}
                                        />
                                    </Field>
                                    <Field id="order-address" label="পুরো ঠিকানা" error={errors.address}>
                                        <textarea
                                            id="order-address"
                                            rows={3}
                                            autoComplete="street-address"
                                            maxLength={300}
                                            placeholder="বাসা, রোড, এলাকা, থানা, জেলা"
                                            value={form.address}
                                            onChange={setField("address")}
                                            aria-invalid={Boolean(errors.address)}
                                            aria-describedby={errors.address ? "order-address-error" : undefined}
                                            className={fieldClass}
                                        />
                                    </Field>
                                    <Field id="order-note" label="কিছু জানাতে চাইলে (ঐচ্ছিক)" error={errors.note}>
                                        <input id="order-note" type="text" maxLength={200} value={form.note} onChange={setField("note")} className={fieldClass} />
                                    </Field>

                                    {needsTrx ? (
                                        <WalletBox
                                            wallet={wallet}
                                            method={payVia.method}
                                            amount={totals.payNow}
                                            site={site}
                                            form={form}
                                            errors={errors}
                                            setField={setField}
                                        />
                                    ) : null}

                                    {/* Honeypot: hidden from people and screen readers; bots fill it. */}
                                    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                                        <label htmlFor="order-website">Website</label>
                                        <input
                                            id="order-website"
                                            type="text"
                                            tabIndex={-1}
                                            autoComplete="off"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {submitError ? (
                                    <p role="alert" className="mt-5 text-[15px] font-medium text-red-700">
                                        {submitError}
                                    </p>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={soldOut || submitting}
                                    className="mt-7 w-full rounded-full bg-bon px-6 py-4 text-xl font-semibold text-kagoj transition-colors hover:bg-bon-deep disabled:cursor-not-allowed disabled:bg-kali-soft/50"
                                >
                                    {soldOut
                                        ? "এই মুহূর্তে স্টকে নেই"
                                        : submitting
                                          ? "অর্ডার পাঠানো হচ্ছে..."
                                          : shown
                                            ? `${copy.submitLabel} (${taka(shown.payNow > 0 ? shown.payNow : shown.totalPrice)})`
                                            : copy.submitLabel}
                                </button>
                                <p className="mt-3 text-center text-[15px] text-kali-soft">
                                    {!shown || shown.payNow === 0
                                        ? "এখন কোনো টাকা দিতে হবে না। ক্যাশ অন ডেলিভারি।"
                                        : shown.redirectsToGateway
                                          ? "অর্ডার করলে আপনাকে নিরাপদ পেমেন্ট পেজে নেওয়া হবে।"
                                          : "টাকা পাঠানোর পর TrxID দিয়ে অর্ডার করুন। আমরা যাচাই করে নিশ্চিত করব।"}
                                </p>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </section>
    );
}

function PackPicker({ product, variantIndex, onPick }) {
    const singlePack = product.variants.length === 1;
    return (
        <fieldset>
            <legend className="font-display text-2xl font-semibold text-sona-light">{singlePack ? "আপনার পণ্য" : "প্যাক বেছে নিন"}</legend>
            <div className="mt-4 space-y-3">
                {product.variants.map((variant, i) => {
                    const active = i === variantIndex;
                    const out = !variant.inStock;
                    return (
                        <label
                            key={variantLabel(variant) || i}
                            className={`relative flex items-center gap-4 rounded-xl border-2 bg-kagoj px-4 py-4 transition-colors ${
                                singlePack
                                    ? "border-transparent"
                                    : out
                                      ? "cursor-not-allowed border-transparent opacity-60"
                                      : active
                                        ? "cursor-pointer border-sona"
                                        : "cursor-pointer border-transparent hover:border-sona/50"
                            }`}
                        >
                            {singlePack ? (
                                product.image ? (
                                    <img src={product.image} alt="" className="h-14 w-auto" />
                                ) : null
                            ) : (
                                <input
                                    type="radio"
                                    name="pack"
                                    checked={active}
                                    disabled={out}
                                    onChange={() => onPick(i)}
                                    className="h-5 w-5 accent-bon"
                                />
                            )}
                            <span className="flex-1 leading-snug">
                                <span className="block text-xl font-semibold text-kali">{singlePack ? product.nameBn : variantLabel(variant)}</span>
                                {out ? (
                                    <span className="text-[15px] font-medium text-dalchini">স্টকে নেই</span>
                                ) : variant.note ? (
                                    <span className="text-[15px] text-kali-soft">{variant.note}</span>
                                ) : null}
                            </span>
                            <span className="text-right leading-tight">
                                <span className="block font-display text-2xl font-bold text-bon">{taka(variant.price)}</span>
                                {variant.comparePrice > variant.price ? (
                                    <span className="text-[15px] text-kali-soft line-through">{taka(variant.comparePrice)}</span>
                                ) : null}
                            </span>
                            {variant.isPopular && !singlePack ? (
                                <span className="absolute -top-3 right-4 rotate-2 rounded bg-sona-light px-2.5 py-0.5 font-hand text-base text-kosh shadow-sm">
                                    বেশি বিক্রি হয়
                                </span>
                            ) : null}
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}

function Summary({ shown, loading, quoteError, onRetry }) {
    if (quoteError) {
        return (
            <div role="alert" className="mt-9 rounded-xl border-2 border-sona/60 px-4 py-4 text-kagoj">
                <p>{quoteError.message}</p>
                {quoteError.code === "NETWORK" || !quoteError.status || quoteError.status >= 500 ? (
                    <button type="button" onClick={onRetry} className="mt-2 font-semibold text-sona-light underline underline-offset-4">
                        আবার চেষ্টা করুন
                    </button>
                ) : null}
            </div>
        );
    }
    if (!shown) {
        return <p className="mt-9 border-t-2 border-sona/60 pt-5 text-[17px] text-kagoj/70">{loading ? "দাম হিসাব হচ্ছে..." : ""}</p>;
    }
    const line = shown.items[0];
    return (
        <dl
            aria-busy={loading}
            className={`mt-9 space-y-2 border-t-2 border-sona/60 pt-5 text-[17px] text-kagoj transition-opacity ${loading ? "opacity-60" : ""}`}
        >
            <div className="flex justify-between">
                <dt className="text-kagoj/70">
                    পণ্যের মূল্য{line && line.quantity > 1 ? ` (${taka(line.unitPrice)} × ${toBn(line.quantity)})` : ""}
                </dt>
                <dd className="font-medium">{taka(shown.itemsPrice)}</dd>
            </div>
            <div className="flex justify-between">
                <dt className="text-kagoj/70">ডেলিভারি চার্জ</dt>
                <dd className="font-medium">{shown.shippingPrice === 0 ? "ফ্রি" : taka(shown.shippingPrice)}</dd>
            </div>
            {shown.savings > 0 ? (
                <div className="flex justify-between text-kochi">
                    <dt>আপনার সাশ্রয়</dt>
                    <dd className="font-medium">{taka(shown.savings)}</dd>
                </div>
            ) : null}
            <div className="flex items-baseline justify-between pt-2">
                <dt className="text-xl font-semibold">মোট</dt>
                <dd className="font-display text-3xl font-bold text-sona-light">{taka(shown.totalPrice)}</dd>
            </div>
            {shown.payNow > 0 ? (
                <>
                    <div className="flex justify-between border-t border-kagoj/15 pt-2">
                        <dt className="text-kagoj/70">এখন দিতে হবে</dt>
                        <dd className="font-semibold">{taka(shown.payNow)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-kagoj/70">হাতে পেয়ে দেবেন</dt>
                        <dd className="font-semibold">{shown.payOnDelivery === 0 ? "কিছু না" : taka(shown.payOnDelivery)}</dd>
                    </div>
                </>
            ) : (
                <p className="text-right text-[15px] text-kagoj/70">পুরো টাকা হাতে পেয়ে দেবেন</p>
            )}
        </dl>
    );
}

function WalletBox({ wallet, method, amount, site, form, errors, setField }) {
    const [copied, setCopied] = useState(false);
    const copyNumber = async () => {
        try {
            await navigator.clipboard.writeText(wallet.number);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard blocked: the number is on screen to type by hand.
        }
    };

    return (
        <div className="rounded-xl border-2 border-pata/35 bg-white px-4 py-4">
            <p className="text-[17px] font-semibold text-kali">{methodLabel(method, site)} দিয়ে পেমেন্ট</p>
            <p className="mt-1.5 text-[16px] leading-relaxed text-kali-soft">
                {methodLabel(method, site)} অ্যাপ থেকে নিচের নম্বরে <strong className="text-kali">{taka(amount)}</strong> {walletAction(wallet?.accountType)}{" "}
                করুন। তারপর TrxID ও যে নম্বর থেকে টাকা পাঠিয়েছেন তা লিখুন।
            </p>
            {wallet?.number ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-kagoj px-4 py-2.5">
                    <span className="font-display text-2xl font-bold tabular-nums tracking-wide text-bon">{wallet.number}</span>
                    <button
                        type="button"
                        onClick={copyNumber}
                        className="inline-flex items-center gap-1.5 rounded-full border border-bon/30 px-3 py-1 text-sm font-medium text-bon hover:border-bon"
                    >
                        <Copy aria-hidden className="h-4 w-4" />
                        {copied ? "কপি হয়েছে" : "কপি"}
                    </button>
                </div>
            ) : null}
            {wallet?.instructions ? <p className="mt-3 whitespace-pre-line text-[15px] text-kali-soft">{wallet.instructions}</p> : null}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field id="order-trxId" label="TrxID" error={errors.trxId}>
                    <input
                        id="order-trxId"
                        type="text"
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        maxLength={20}
                        placeholder="যেমন 9BC7XYZ123"
                        value={form.trxId}
                        onChange={setField("trxId")}
                        aria-invalid={Boolean(errors.trxId)}
                        aria-describedby={errors.trxId ? "order-trxId-error" : undefined}
                        className={fieldClass}
                    />
                </Field>
                <Field id="order-senderNumber" label="যে নম্বর থেকে পাঠিয়েছেন" error={errors.senderNumber}>
                    <input
                        id="order-senderNumber"
                        type="tel"
                        inputMode="numeric"
                        maxLength={20}
                        placeholder="01XXXXXXXXX"
                        value={form.senderNumber}
                        onChange={setField("senderNumber")}
                        aria-invalid={Boolean(errors.senderNumber)}
                        aria-describedby={errors.senderNumber ? "order-senderNumber-error" : undefined}
                        className={fieldClass}
                    />
                </Field>
            </div>
        </div>
    );
}

function Field({ id, label, error, children }) {
    return (
        <div>
            <label htmlFor={id} className="text-[16px] font-medium text-kali">
                {label}
            </label>
            {children}
            {error ? (
                <p id={`${id}-error`} className="mt-1.5 text-[15px] text-red-700">
                    {error}
                </p>
            ) : null}
        </div>
    );
}

function OrderPlaced({ placed, copy, site, onAgain }) {
    const { order, saved } = placed;
    const item = order.items[0];
    const verifying = order.paymentStatus === "Verifying";

    return (
        <div role="status" className="mx-auto max-w-xl rounded-2xl bg-kagoj p-8 text-center sm:p-12">
            <CircleCheck aria-hidden className="mx-auto h-14 w-14 text-pata" strokeWidth={1.5} />
            <h2 className="mt-5 font-display text-4xl font-bold leading-[1.35] text-bon">{copy.successTitle}</h2>
            <p className="mt-3 text-lg text-kali-soft">{copy.successText}</p>
            {verifying ? (
                <p className="mt-3 rounded-lg bg-sona-light/50 px-4 py-2.5 text-[16px] text-kali">
                    আপনার TrxID পেয়েছি। পেমেন্ট যাচাই করে অর্ডারটি নিশ্চিত করা হবে।
                </p>
            ) : null}
            <dl className="mt-8 space-y-2 border-y border-bon/20 py-5 text-left text-[17px]">
                <div className="flex justify-between gap-4">
                    <dt className="text-kali-soft">অর্ডার নম্বর</dt>
                    <dd className="font-semibold tabular-nums">{order.orderNumber}</dd>
                </div>
                {item ? (
                    <div className="flex justify-between gap-4">
                        <dt className="text-kali-soft">পণ্য</dt>
                        <dd className="text-right font-medium">
                            {item.nameBn || item.name}, {toBn(itemLabel(item))}
                        </dd>
                    </div>
                ) : null}
                <div className="flex justify-between gap-4">
                    <dt className="text-kali-soft">মোট</dt>
                    <dd className="font-display text-2xl font-bold text-bon">{taka(order.totalPrice)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                    <dt className="text-kali-soft">হাতে পেয়ে দেবেন</dt>
                    <dd className="font-semibold">{order.payOnDelivery === 0 ? "কিছু না" : taka(order.payOnDelivery)}</dd>
                </div>
            </dl>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
                {saved ? (
                    <Link
                        href={`/order/${order.orderNumber}`}
                        className="inline-flex items-center rounded-full bg-bon px-6 py-3.5 text-lg font-semibold text-kagoj hover:bg-bon-deep"
                    >
                        অর্ডারের অবস্থা দেখুন
                    </Link>
                ) : null}
                <a
                    href={whatsappHref(site.whatsapp, `আমার অর্ডার নম্বর ${order.orderNumber}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-bon/25 px-6 py-3.5 text-lg font-semibold text-bon hover:border-bon"
                >
                    <MessageCircle aria-hidden className="h-5 w-5" />
                    WhatsApp
                </a>
            </div>
            {!saved ? (
                <p className="mt-4 text-[15px] text-kali-soft">অর্ডার নম্বরটি লিখে রাখুন; কিছু জানতে চাইলে ফোনে এটি বলুন।</p>
            ) : null}
            <p className="mt-5">
                <button type="button" onClick={onAgain} className="text-[16px] font-medium text-bon underline underline-offset-4">
                    আরেকটি অর্ডার করুন
                </button>
            </p>
        </div>
    );
}
