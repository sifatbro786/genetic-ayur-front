"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import FieldEditor from "@/components/admin/FieldEditor";
import SaveBar, { SaveErrors } from "@/components/admin/SaveBar";
import { Card, ErrorNote, PageHeader, inputClass } from "@/components/admin/ui";
import { useDraft } from "@/components/admin/useDraft";
import { useResource } from "@/components/admin/useResource";
import { adminFetch } from "@/lib/admin/api";
import { setIn } from "@/lib/path";
import { sectionLabels, sectionSchemas } from "@/lib/schema";

// Every section the API knows is listed, including ones not on the page yet
// (the products grid): they are appended hidden so they can be switched on.
const normalize = ({ landing, sectionKeys }) => {
    const keys = sectionKeys.filter((k) => sectionSchemas[k]);
    const order = [...landing.order.filter((k) => keys.includes(k)), ...keys.filter((k) => !landing.order.includes(k))];
    const sections = {};
    for (const k of keys) sections[k] = landing.sections?.[k] || { enabled: false };
    return { order, sections, productSlug: landing.productSlug || "" };
};

export default function ContentPage() {
    const res = useResource("/api/admin/landing");
    const products = useResource("/api/admin/products?status=active&limit=100");

    if (!res.data) {
        return (
            <>
                <PageHeader title="Landing page" />
                {res.error ? <ErrorNote error={res.error} onRetry={res.reload} /> : <p className="text-sm text-gray-500">Loading...</p>}
            </>
        );
    }
    return <ContentEditor initial={normalize(res.data)} products={products.data?.products || []} />;
}

function ContentEditor({ initial, products }) {
    const draft = useDraft(initial, async (value) => {
        // The API cleans each section (unknown keys dropped, lengths capped)
        // and answers with the stored copy, which becomes the new baseline.
        const res = await adminFetch("/api/admin/landing", {
            method: "PUT",
            body: { order: value.order, sections: value.sections, ...(value.productSlug ? { productSlug: value.productSlug } : {}) },
        });
        return normalize(res);
    });
    const landing = draft.draft;
    const [selected, setSelected] = useState(landing.order[0]);

    const moveSection = (index, to) => {
        const order = [...landing.order];
        const [key] = order.splice(index, 1);
        order.splice(to, 0, key);
        draft.setDraft({ ...landing, order });
    };

    const toggle = (key) => draft.setDraft(setIn(landing, ["sections", key, "enabled"], landing.sections[key].enabled === false));

    return (
        <>
            <PageHeader title="Landing page" description="Edit the text and images of each section, hide a section, or change the order.">
                <SaveBar draft={draft} />
            </PageHeader>
            <SaveErrors draft={draft} />

            <Card title="Product on the landing page" description="The hero and the order form sell this product." className="mb-5">
                <select
                    aria-label="Landing page product"
                    value={landing.productSlug}
                    onChange={(e) => draft.setDraft({ ...landing, productSlug: e.target.value })}
                    className={`${inputClass} max-w-md`}
                >
                    {products.some((p) => p.slug === landing.productSlug) ? null : <option value={landing.productSlug}>{landing.productSlug || "Choose a product"}</option>}
                    {products.map((p) => (
                        <option key={p._id} value={p.slug}>
                            {p.nameBn || p.name} ({p.slug})
                        </option>
                    ))}
                </select>
            </Card>

            <div className="grid gap-5 lg:grid-cols-[17rem_1fr]">
                <Card title="Sections" description="Top to bottom, as on the page" className="self-start [&>div]:p-2">
                    <ul>
                        {landing.order.map((key, i) => {
                            const enabled = landing.sections[key].enabled !== false;
                            const active = key === selected;
                            return (
                                <li key={key} className={`flex items-center rounded-md ${active ? "bg-gray-100" : ""}`}>
                                    <button
                                        type="button"
                                        aria-current={active ? "true" : undefined}
                                        onClick={() => setSelected(key)}
                                        className={`min-w-0 flex-1 truncate px-3 py-2 text-left text-sm ${enabled ? "font-medium text-gray-900" : "text-gray-400 line-through"}`}
                                    >
                                        {sectionLabels[key] || key}
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={`${enabled ? "Hide" : "Show"} ${sectionLabels[key]}`}
                                        aria-pressed={enabled}
                                        onClick={() => toggle(key)}
                                        className="rounded p-1.5 text-gray-500 hover:bg-gray-200"
                                    >
                                        {enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={`Move ${sectionLabels[key]} up`}
                                        disabled={i === 0}
                                        onClick={() => moveSection(i, i - 1)}
                                        className="rounded p-1.5 text-gray-500 hover:bg-gray-200 disabled:opacity-30"
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={`Move ${sectionLabels[key]} down`}
                                        disabled={i === landing.order.length - 1}
                                        onClick={() => moveSection(i, i + 1)}
                                        className="rounded p-1.5 text-gray-500 hover:bg-gray-200 disabled:opacity-30"
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </Card>

                <Card title={sectionLabels[selected] || selected}>
                    {/* key resets open list rows when switching section */}
                    <FieldEditor
                        key={selected}
                        schema={sectionSchemas[selected]}
                        value={landing.sections[selected]}
                        onChange={(next) => draft.setDraft(setIn(landing, ["sections", selected], next))}
                    />
                </Card>
            </div>
        </>
    );
}
