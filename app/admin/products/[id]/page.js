"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import FieldEditor from "@/components/admin/FieldEditor";
import SaveBar, { SaveErrors } from "@/components/admin/SaveBar";
import { Button, Card, ErrorNote, PageHeader, Pagination, formatDate, inputClass } from "@/components/admin/ui";
import { useDraft } from "@/components/admin/useDraft";
import { useResource } from "@/components/admin/useResource";
import { adminFetch } from "@/lib/admin/api";
import { productSchema } from "@/lib/schema";

const NEW_PRODUCT = {
    name: "",
    nameBn: "",
    slug: "",
    netWeight: "",
    image: "",
    gallery: [],
    shortDescription: "",
    description: "",
    sortOrder: 0,
    isActive: true,
    variants: [{ options: [{ name: "প্যাক", value: "১ কৌটা" }], note: "", units: 1, price: 0, comparePrice: 0, freeShipping: false, isPopular: false }],
};

// Only the fields the API's PUT accepts. Stock is never sent from this form.
const toPayload = (p) => ({
    name: p.name,
    nameBn: p.nameBn,
    ...(p.slug?.trim() ? { slug: p.slug.trim().toLowerCase() } : {}),
    netWeight: p.netWeight || "",
    image: p.image || "",
    gallery: (p.gallery || []).filter(Boolean),
    shortDescription: p.shortDescription || "",
    description: p.description || "",
    sortOrder: Number(p.sortOrder) || 0,
    isActive: Boolean(p.isActive),
    variants: (p.variants || []).map((v) => ({
        options: (v.options || []).map((o) => ({ name: o.name || "প্যাক", value: (o.value || "").trim() })),
        note: v.note || "",
        units: Math.max(1, Number(v.units) || 1),
        price: Number(v.price) || 0,
        comparePrice: Number(v.comparePrice) || 0,
        freeShipping: Boolean(v.freeShipping),
        isPopular: Boolean(v.isPopular),
    })),
});

export default function ProductEditPage() {
    const { id } = useParams();
    const isNew = id === "new";
    const res = useResource(isNew ? null : `/api/admin/products/${id}`);

    if (isNew) return <ProductEditor initial={NEW_PRODUCT} isNew />;
    if (!res.data) {
        return (
            <>
                <BackLink />
                {res.error ? <ErrorNote error={res.error} onRetry={res.reload} /> : <p className="text-sm text-gray-500">Loading...</p>}
            </>
        );
    }
    const product = res.data.product;
    return (
        <>
            <ProductEditor key={product._id} initial={product} onSaved={(p) => res.setData({ product: p })} />
            <StockPanel product={product} onStock={(stock) => res.setData({ product: { ...product, stock } })} />
        </>
    );
}

function BackLink() {
    return (
        <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft aria-hidden className="h-4 w-4" /> All products
        </Link>
    );
}

function ProductEditor({ initial, isNew = false, onSaved }) {
    const router = useRouter();
    const [openingStock, setOpeningStock] = useState(0);
    const [hideState, setHideState] = useState({ confirm: false, busy: false, error: null });

    const draft = useDraft(initial, async (value) => {
        if (isNew) {
            const res = await adminFetch("/api/admin/products", { method: "POST", body: { ...toPayload(value), stock: openingStock } });
            router.replace(`/admin/products/${res.product._id}`);
            return res.product;
        }
        const res = await adminFetch(`/api/admin/products/${initial._id}`, { method: "PUT", body: toPayload(value) });
        onSaved?.(res.product);
        return res.product;
    });

    const hide = async () => {
        setHideState({ confirm: true, busy: true, error: null });
        try {
            await adminFetch(`/api/admin/products/${initial._id}`, { method: "DELETE" });
            router.push("/admin/products");
        } catch (error) {
            setHideState({ confirm: false, busy: false, error });
        }
    };

    return (
        <>
            <BackLink />
            <PageHeader
                title={isNew ? "New product" : initial.nameBn || initial.name}
                description={isNew ? "Fill in the details and the packs, then save." : `Web address: /products/${initial.slug}`}
            >
                <SaveBar draft={draft} />
            </PageHeader>
            <SaveErrors draft={draft} />
            <ErrorNote error={hideState.error} />
            <Card>
                <FieldEditor schema={productSchema} value={draft.draft} onChange={draft.setDraft} />
                {isNew ? (
                    <label className="mt-5 block text-sm font-medium text-gray-700">
                        Opening stock (jars in hand now)
                        <input
                            type="number"
                            min={0}
                            step={1}
                            value={openingStock}
                            onChange={(e) => setOpeningStock(Math.max(0, Math.trunc(Number(e.target.value) || 0)))}
                            className={`${inputClass} mt-1.5 max-w-48`}
                        />
                    </label>
                ) : null}
            </Card>
            {!isNew && initial.isActive ? (
                <div className="mt-4">
                    {hideState.confirm ? (
                        <Button variant="danger" disabled={hideState.busy} onClick={hide}>
                            Yes, hide this product from the site
                        </Button>
                    ) : (
                        <Button variant="danger" onClick={() => setHideState({ confirm: true, busy: false, error: null })}>
                            Hide product
                        </Button>
                    )}
                    <p className="mt-1.5 text-xs text-gray-500">Hidden products keep their orders and history. Tick “Available for order” to bring one back.</p>
                </div>
            ) : null}
        </>
    );
}

const REASONS = [
    { value: "restock", label: "New stock arrived (+)" },
    { value: "damaged", label: "Damaged or expired (-)" },
    { value: "correction", label: "Count correction (+ or -)" },
];
const REASON_LABEL = {
    initial: "Opening stock",
    restock: "Restock",
    damaged: "Damaged",
    correction: "Correction",
    order: "Order confirmed",
    order_cancelled: "Order cancelled",
};

// Stock changes go through POST /stock and land in the ledger with the
// balance after them; the product form never sends a stock number.
function StockPanel({ product, onStock }) {
    const [page, setPage] = useState(1);
    const movements = useResource(`/api/admin/products/${product._id}/stock-movements?page=${page}&limit=15`);
    const [form, setForm] = useState({ amount: "", reason: "restock", note: "" });
    const [state, setState] = useState({ busy: false, error: null });

    const submit = async (e) => {
        e.preventDefault();
        const amount = Math.trunc(Number(form.amount) || 0);
        // Restock adds, damaged removes, a correction takes the sign typed.
        const change = form.reason === "restock" ? Math.abs(amount) : form.reason === "damaged" ? -Math.abs(amount) : amount;
        if (!change) return setState({ busy: false, error: new Error("Enter how many jars.") });
        setState({ busy: true, error: null });
        try {
            const res = await adminFetch(`/api/admin/products/${product._id}/stock`, {
                method: "POST",
                body: { change, reason: form.reason, ...(form.note.trim() ? { note: form.note.trim() } : {}) },
            });
            onStock(res.stock);
            setForm({ amount: "", reason: form.reason, note: "" });
            setState({ busy: false, error: null });
            setPage(1);
            movements.reload();
        } catch (error) {
            setState({ busy: false, error });
        }
    };

    const data = movements.data;
    return (
        <Card title="Stock" description="Counted in single jars. Confirmed orders take stock; cancelled orders put it back." className="mt-6">
            <p className="text-sm">
                In stock now: <span className="text-2xl font-semibold tabular-nums">{product.stock}</span> jars
            </p>
            <form onSubmit={submit} className="mt-4 flex flex-wrap items-end gap-3">
                <label className="text-xs font-medium text-gray-700">
                    Reason
                    <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className={`${inputClass} mt-1 w-56`}>
                        {REASONS.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-medium text-gray-700">
                    Jars
                    <input
                        type="number"
                        step={1}
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        placeholder={form.reason === "correction" ? "-3 or 5" : "24"}
                        className={`${inputClass} mt-1 w-28`}
                    />
                </label>
                <label className="min-w-48 flex-1 text-xs font-medium text-gray-700">
                    Note (optional)
                    <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={300} className={`${inputClass} mt-1`} />
                </label>
                <Button type="submit" variant="primary" disabled={state.busy}>
                    {state.busy ? "Saving..." : "Update stock"}
                </Button>
            </form>
            {state.error ? <p className="mt-2 text-sm text-red-700">{state.error.message}</p> : null}

            <h3 className="mt-6 text-xs font-medium uppercase tracking-wide text-gray-500">History</h3>
            {!data ? (
                <p className="mt-2 text-sm text-gray-500">{movements.error ? movements.error.message : "Loading..."}</p>
            ) : data.movements.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">No stock changes yet.</p>
            ) : (
                <div className="mt-2 overflow-x-auto rounded-md border border-gray-200">
                    <table className="w-full min-w-[36rem] text-left text-sm">
                        <thead className="border-b border-gray-200 text-xs text-gray-500">
                            <tr>
                                <th className="px-3 py-2 font-medium">When</th>
                                <th className="px-3 py-2 font-medium">What</th>
                                <th className="px-3 py-2 text-right font-medium">Change</th>
                                <th className="px-3 py-2 text-right font-medium">Balance</th>
                                <th className="px-3 py-2 font-medium">By / note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.movements.map((m) => (
                                <tr key={m._id}>
                                    <td className="px-3 py-2 text-gray-600">{formatDate(m.createdAt)}</td>
                                    <td className="px-3 py-2">
                                        {REASON_LABEL[m.reason] || m.reason}
                                        {m.orderNumber ? (
                                            <Link href={`/admin/orders?q=${m.orderNumber}`} className="ml-1.5 text-xs text-gray-500 underline">
                                                {m.orderNumber}
                                            </Link>
                                        ) : null}
                                    </td>
                                    <td className={`px-3 py-2 text-right tabular-nums ${m.change < 0 ? "text-red-700" : "text-green-700"}`}>
                                        {m.change > 0 ? `+${m.change}` : m.change}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">{m.balanceAfter}</td>
                                    <td className="px-3 py-2 text-xs text-gray-600">{[m.by?.name, m.note].filter(Boolean).join(": ")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination page={data.currentPage} totalPages={data.totalPages} total={data.total} onPage={setPage} />
                </div>
            )}
        </Card>
    );
}
