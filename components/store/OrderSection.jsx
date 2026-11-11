"use client";

import { useState } from "react";
import { CircleCheck, MessageCircle } from "lucide-react";
import { normalizePhone, taka, variantLabel, whatsappHref } from "@/lib/format";
import { placeOrder } from "@/lib/orders";
import { calculateOrder } from "@/lib/pricing";

const EMPTY = { name: "", phone: "", address: "", note: "" };

function validate(form) {
    const errors = {};
    if (form.name.trim().length < 2) errors.name = "আপনার নাম লিখুন";
    if (!normalizePhone(form.phone)) errors.phone = "১১ সংখ্যার সঠিক মোবাইল নম্বর লিখুন (যেমন 017XXXXXXXX)";
    if (form.address.trim().length < 10) errors.address = "বাসা, রোড, এলাকা ও জেলাসহ পুরো ঠিকানা লিখুন";
    return errors;
}

const fieldClass =
    "mt-1.5 w-full rounded-lg border border-bon/25 bg-white px-4 py-3 text-[17px] text-kali placeholder:text-kali-soft/60 focus:border-pata focus:outline-none focus:ring-2 focus:ring-pata/25 aria-[invalid=true]:border-red-600";

export default function OrderSection({ data, product, site }) {
    const zones = site.shipping.filter((z) => z.enabled);
    const popular = product.variants.findIndex((v) => v.isPopular);

    // null means "visitor has not chosen yet": fall back to the pack the
    // dashboard marks as popular, so a dashboard change shows up immediately.
    const [pickedVariant, setPickedVariant] = useState(null);
    const [pickedZone, setPickedZone] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [placed, setPlaced] = useState(null);

    const variantIndex = Math.min(pickedVariant ?? Math.max(popular, 0), product.variants.length - 1);
    const zoneKey = zones.some((z) => z.key === pickedZone) ? pickedZone : zones[0]?.key;
    const totals = calculateOrder({ product, variantIndex, zoneKey, site });
    const soldOut = !product.isActive || product.stock <= 0;

    const setField = (key) => (e) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const found = validate(form);
        setErrors(found);
        setSubmitError("");
        if (Object.keys(found).length) {
            document.getElementById(`order-${Object.keys(found)[0]}`)?.focus();
            return;
        }
        if (!totals.zone) {
            setSubmitError("ডেলিভারি এলাকা নির্বাচন করুন।");
            return;
        }
        const order = placeOrder({
            customer: {
                name: form.name.trim(),
                phone: normalizePhone(form.phone),
                address: form.address.trim(),
                note: form.note.trim(),
            },
            product,
            totals,
        });
        if (!order) {
            setSubmitError("অর্ডারটি সংরক্ষণ করা যায়নি। অনুগ্রহ করে ফোন বা WhatsApp-এ অর্ডার করুন।");
            return;
        }
        setPlaced(order);
        setForm(EMPTY);
    };

    return (
        <section id="order" className="bg-bon-deep">
            <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
                {placed ? (
                    <OrderPlaced order={placed} data={data} site={site} onAgain={() => setPlaced(null)} />
                ) : (
                    <>
                        <div className="max-w-2xl">
                            <h2 className="font-display text-4xl font-bold leading-[1.35] text-kagoj sm:text-5xl sm:leading-[1.3]">
                                {data.title}
                            </h2>
                            <p className="mt-4 text-lg text-kagoj/75">{data.text}</p>
                        </div>

                        <form onSubmit={onSubmit} noValidate className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
                            <div>
                                <fieldset>
                                    <legend className="font-display text-2xl font-semibold text-sona-light">প্যাক বেছে নিন</legend>
                                    <div className="mt-4 space-y-3">
                                        {product.variants.map((variant, i) => {
                                            const active = i === variantIndex;
                                            return (
                                                <label
                                                    key={i}
                                                    className={`relative flex cursor-pointer items-center gap-4 rounded-xl border-2 bg-kagoj px-4 py-4 transition-colors ${
                                                        active ? "border-sona" : "border-transparent hover:border-sona/50"
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="pack"
                                                        checked={active}
                                                        onChange={() => setPickedVariant(i)}
                                                        className="h-5 w-5 accent-bon"
                                                    />
                                                    <span className="flex-1 leading-snug">
                                                        <span className="block text-xl font-semibold text-kali">
                                                            {variantLabel(variant)}
                                                        </span>
                                                        {variant.note ? (
                                                            <span className="text-[15px] text-kali-soft">{variant.note}</span>
                                                        ) : null}
                                                    </span>
                                                    <span className="text-right leading-tight">
                                                        <span className="block font-display text-2xl font-bold text-bon">
                                                            {taka(variant.price)}
                                                        </span>
                                                        {variant.comparePrice > variant.price ? (
                                                            <span className="text-[15px] text-kali-soft line-through">
                                                                {taka(variant.comparePrice)}
                                                            </span>
                                                        ) : null}
                                                    </span>
                                                    {variant.isPopular ? (
                                                        <span className="absolute -top-3 right-4 rotate-2 rounded bg-sona-light px-2.5 py-0.5 font-hand text-base text-kosh shadow-sm">
                                                            বেশি বিক্রি হয়
                                                        </span>
                                                    ) : null}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </fieldset>

                                <fieldset className="mt-9">
                                    <legend className="font-display text-2xl font-semibold text-sona-light">ডেলিভারি এলাকা</legend>
                                    <div className="mt-4 flex flex-wrap gap-2.5">
                                        {zones.map((zone) => {
                                            const active = zone.key === zoneKey;
                                            return (
                                                <label
                                                    key={zone.key}
                                                    className={`cursor-pointer rounded-full border-2 px-4 py-2 text-[16px] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-kochi ${
                                                        active
                                                            ? "border-sona bg-sona text-kosh"
                                                            : "border-kagoj/30 text-kagoj hover:border-kagoj/70"
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="zone"
                                                        checked={active}
                                                        onChange={() => setPickedZone(zone.key)}
                                                        className="sr-only"
                                                    />
                                                    {zone.label} ({taka(zone.charge)})
                                                </label>
                                            );
                                        })}
                                    </div>
                                </fieldset>

                                <dl className="mt-9 space-y-2 border-t-2 border-sona/60 pt-5 text-[17px] text-kagoj">
                                    <div className="flex justify-between">
                                        <dt className="text-kagoj/70">পণ্যের মূল্য</dt>
                                        <dd className="font-medium">{taka(totals.itemsPrice)}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-kagoj/70">ডেলিভারি চার্জ</dt>
                                        <dd className="font-medium">
                                            {totals.shippingPrice === 0 ? "ফ্রি" : taka(totals.shippingPrice)}
                                        </dd>
                                    </div>
                                    <div className="flex items-baseline justify-between pt-2">
                                        <dt className="text-xl font-semibold">মোট (হাতে পেয়ে দেবেন)</dt>
                                        <dd className="font-display text-3xl font-bold text-sona-light">{taka(totals.totalPrice)}</dd>
                                    </div>
                                </dl>
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
                                    <Field id="order-note" label="কিছু জানাতে চাইলে (ঐচ্ছিক)">
                                        <input
                                            id="order-note"
                                            type="text"
                                            maxLength={200}
                                            value={form.note}
                                            onChange={setField("note")}
                                            className={fieldClass}
                                        />
                                    </Field>
                                </div>

                                {submitError ? (
                                    <p role="alert" className="mt-5 text-[15px] font-medium text-red-700">
                                        {submitError}
                                    </p>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={soldOut}
                                    className="mt-7 w-full rounded-full bg-bon px-6 py-4 text-xl font-semibold text-kagoj transition-colors hover:bg-bon-deep disabled:cursor-not-allowed disabled:bg-kali-soft/50"
                                >
                                    {soldOut ? "এই মুহূর্তে স্টকে নেই" : `${data.submitLabel} (${taka(totals.totalPrice)})`}
                                </button>
                                <p className="mt-3 text-center text-[15px] text-kali-soft">
                                    এখন কোনো টাকা দিতে হবে না। ক্যাশ অন ডেলিভারি।
                                </p>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </section>
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

function OrderPlaced({ order, data, site, onAgain }) {
    const item = order.orderItems[0];
    // Static phase: the order only lives in this browser, so the WhatsApp
    // button is how it actually reaches the shop. The customer taps it
    // themselves; nothing is sent automatically.
    const message = [
        `অর্ডার নম্বর: ${order.orderNumber}`,
        `পণ্য: ${item.name} (${variantLabel(item.variant)})`,
        `নাম: ${order.shippingAddress.name}`,
        `মোবাইল: ${order.shippingAddress.phone}`,
        `ঠিকানা: ${order.shippingAddress.addressLine1}`,
        `মোট: ${order.totalPrice} টাকা (ক্যাশ অন ডেলিভারি)`,
    ].join("\n");

    return (
        <div role="status" className="mx-auto max-w-xl rounded-2xl bg-kagoj p-8 text-center sm:p-12">
            <CircleCheck aria-hidden className="mx-auto h-14 w-14 text-pata" strokeWidth={1.5} />
            <h2 className="mt-5 font-display text-4xl font-bold leading-[1.35] text-bon">{data.successTitle}</h2>
            <p className="mt-3 text-lg text-kali-soft">{data.successText}</p>
            <dl className="mt-8 space-y-2 border-y border-bon/20 py-5 text-left text-[17px]">
                <div className="flex justify-between gap-4">
                    <dt className="text-kali-soft">অর্ডার নম্বর</dt>
                    <dd className="font-semibold tabular-nums">{order.orderNumber}</dd>
                </div>
                <div className="flex justify-between gap-4">
                    <dt className="text-kali-soft">পণ্য</dt>
                    <dd className="text-right font-medium">
                        {item.name}, {variantLabel(item.variant)}
                    </dd>
                </div>
                <div className="flex justify-between gap-4">
                    <dt className="text-kali-soft">মোট (ক্যাশ অন ডেলিভারি)</dt>
                    <dd className="font-display text-2xl font-bold text-bon">{taka(order.totalPrice)}</dd>
                </div>
            </dl>
            <a
                href={whatsappHref(site.whatsapp, message)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-bon px-6 py-3.5 text-lg font-semibold text-kagoj hover:bg-bon-deep"
            >
                <MessageCircle aria-hidden className="h-5 w-5" />
                WhatsApp-এ অর্ডারটি পাঠান
            </a>
            <p className="mt-5">
                <button type="button" onClick={onAgain} className="text-[16px] font-medium text-bon underline underline-offset-4">
                    আরেকটি অর্ডার করুন
                </button>
            </p>
        </div>
    );
}
