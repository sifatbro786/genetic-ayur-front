"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import FieldEditor from "@/components/admin/FieldEditor";
import SaveBar from "@/components/admin/SaveBar";
import { Button, Card, PageHeader } from "@/components/admin/ui";
import { useDraft } from "@/components/admin/useDraft";
import { setIn } from "@/lib/path";
import { sectionLabels, sectionSchemas } from "@/lib/schema";
import { landingStore } from "@/lib/stores";

export default function ContentPage() {
    const draft = useDraft(landingStore);
    const landing = draft.draft;
    const [selected, setSelected] = useState(landing.order[0]);
    const [confirmReset, setConfirmReset] = useState(false);

    const moveSection = (index, to) => {
        const order = [...landing.order];
        const [key] = order.splice(index, 1);
        order.splice(to, 0, key);
        draft.setDraft({ ...landing, order });
    };

    const toggle = (key) =>
        draft.setDraft(setIn(landing, ["sections", key, "enabled"], !landing.sections[key].enabled));

    return (
        <>
            <PageHeader title="Landing page" description="Edit the text and images of each section, hide a section, or change the order.">
                <SaveBar draft={draft} />
            </PageHeader>

            <div className="grid gap-5 lg:grid-cols-[17rem_1fr]">
                <div>
                    <Card title="Sections" description="Top to bottom, as on the page" className="[&>div]:p-2">
                        <ul>
                            {landing.order.map((key, i) => {
                                const enabled = landing.sections[key].enabled;
                                const active = key === selected;
                                return (
                                    <li key={key} className={`flex items-center rounded-md ${active ? "bg-gray-100" : ""}`}>
                                        <button
                                            type="button"
                                            aria-current={active ? "true" : undefined}
                                            onClick={() => setSelected(key)}
                                            className={`min-w-0 flex-1 truncate px-3 py-2 text-left text-sm ${
                                                enabled ? "font-medium text-gray-900" : "text-gray-400 line-through"
                                            }`}
                                        >
                                            {sectionLabels[key]}
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
                    <div className="mt-3">
                        {confirmReset ? (
                            <Button
                                variant="danger"
                                onClick={() => {
                                    draft.resetToDefault();
                                    setConfirmReset(false);
                                }}
                            >
                                Yes, restore original content
                            </Button>
                        ) : (
                            <Button onClick={() => setConfirmReset(true)}>Restore original content</Button>
                        )}
                    </div>
                </div>

                <Card title={sectionLabels[selected]}>
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
