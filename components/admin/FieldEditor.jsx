"use client";

import { useId, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2, Upload } from "lucide-react";
import { getIn, setIn } from "@/lib/path";
import { Button, inputClass } from "./ui";

// Renders a form from a schema (lib/schema.js) against a plain object.
// `value` is the whole object, `onChange` receives the next whole object.
export default function FieldEditor({ schema, value, onChange }) {
    return (
        <div className="space-y-5">
            {schema.map((field) => (
                <Field
                    key={field.key}
                    field={field}
                    value={getIn(value, field.key)}
                    onChange={(next) => onChange(setIn(value, field.key, next))}
                />
            ))}
        </div>
    );
}

function Field({ field, value, onChange }) {
    const id = useId();

    if (field.type === "boolean") {
        return (
            <label className="flex items-center gap-2.5 text-sm text-gray-800">
                <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                />
                {field.label}
            </label>
        );
    }

    if (field.type === "list") return <ListField field={field} value={value || []} onChange={onChange} />;
    if (field.type === "strings") return <StringsField field={field} value={value || []} onChange={onChange} />;

    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
                {field.label}
            </label>
            {field.type === "textarea" ? (
                <textarea
                    id={id}
                    rows={field.rows || 3}
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputClass}
                />
            ) : field.type === "number" ? (
                <input
                    id={id}
                    type="number"
                    min={0}
                    value={value ?? 0}
                    onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
                    className={`${inputClass} max-w-48`}
                />
            ) : field.type === "select" ? (
                <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${inputClass} max-w-48`}>
                    {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            ) : field.type === "image" ? (
                <ImageInput id={id} value={value ?? ""} onChange={onChange} />
            ) : (
                <input id={id} type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass} />
            )}
            {field.help ? <p className="mt-1.5 text-xs text-gray-500">{field.help}</p> : null}
        </div>
    );
}

// Downscale in the browser before storing: the static phase keeps uploads as
// data URLs in localStorage, which has a ~5 MB budget for everything.
function fileToDataUrl(file, maxSide = 1400) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            // WebP keeps transparency, which the hero jar image needs.
            resolve(canvas.toDataURL("image/webp", 0.82));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Could not read this image"));
        };
        img.src = url;
    });
}

function ImageInput({ id, value, onChange }) {
    const [error, setError] = useState("");
    const isData = value.startsWith("data:");

    const onFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Choose an image file (JPG, PNG or WebP).");
            return;
        }
        try {
            onChange(await fileToDataUrl(file));
            setError("");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-start gap-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
                <input
                    id={id}
                    type="text"
                    placeholder="Image URL, or upload a file"
                    value={isData ? "" : value}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputClass}
                />
                <div className="flex items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 has-focus-visible:ring-2 has-focus-visible:ring-gray-400">
                        <Upload aria-hidden className="h-4 w-4" />
                        Upload
                        <input type="file" accept="image/*" onChange={onFile} className="sr-only" />
                    </label>
                    {isData ? <span className="text-xs text-gray-500">Uploaded file in use</span> : null}
                </div>
                {error ? <p className="text-xs text-red-700">{error}</p> : null}
            </div>
        </div>
    );
}

const move = (list, from, to) => {
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
};

function RowActions({ index, count, onMove, onRemove, label }) {
    return (
        <div className="flex shrink-0 items-center">
            <button
                type="button"
                aria-label={`Move ${label} up`}
                disabled={index === 0}
                onClick={() => onMove(index, index - 1)}
                className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
                <ArrowUp className="h-4 w-4" />
            </button>
            <button
                type="button"
                aria-label={`Move ${label} down`}
                disabled={index === count - 1}
                onClick={() => onMove(index, index + 1)}
                className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
                <ArrowDown className="h-4 w-4" />
            </button>
            {onRemove ? (
                <button
                    type="button"
                    aria-label={`Remove ${label}`}
                    onClick={() => onRemove(index)}
                    className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-700"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            ) : null}
        </div>
    );
}

function ListField({ field, value, onChange }) {
    const [open, setOpen] = useState(null);

    const onMove = (from, to) => {
        onChange(move(value, from, to));
        setOpen(open === from ? to : open === to ? from : open);
    };
    const onRemove = (index) => {
        onChange(value.filter((_, i) => i !== index));
        setOpen(null);
    };

    return (
        <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700">{field.label}</p>
            {field.help ? <p className="mb-2 text-xs text-gray-500">{field.help}</p> : null}
            <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
                {value.length === 0 ? <li className="px-3 py-4 text-sm text-gray-500">Nothing here yet. Add the first one.</li> : null}
                {value.map((item, i) => {
                    const title = field.itemTitle?.(item) || `Item ${i + 1}`;
                    const isOpen = open === i;
                    return (
                        <li key={i}>
                            <div className="flex items-center gap-1 px-2 py-1.5">
                                <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    onClick={() => setOpen(isOpen ? null : i)}
                                    className="flex min-w-0 flex-1 items-center gap-2 rounded px-1.5 py-1.5 text-left text-sm text-gray-900 hover:bg-gray-50"
                                >
                                    <ChevronDown
                                        aria-hidden
                                        className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                                    />
                                    <span className="truncate">{title}</span>
                                </button>
                                <RowActions
                                    index={i}
                                    count={value.length}
                                    onMove={onMove}
                                    onRemove={field.fixed ? null : onRemove}
                                    label={title}
                                />
                            </div>
                            {isOpen ? (
                                <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
                                    <FieldEditor
                                        schema={field.fields}
                                        value={item}
                                        onChange={(next) => onChange(value.map((v, j) => (j === i ? next : v)))}
                                    />
                                </div>
                            ) : null}
                        </li>
                    );
                })}
            </ul>
            {field.fixed ? null : (
                <Button
                    className="mt-2"
                    onClick={() => {
                        onChange([...value, structuredClone(field.newItem)]);
                        setOpen(value.length);
                    }}
                >
                    <Plus aria-hidden className="h-4 w-4" /> Add
                </Button>
            )}
        </div>
    );
}

function StringsField({ field, value, onChange }) {
    const full = field.max && value.length >= field.max;
    return (
        <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700">{field.label}</p>
            <ul className="space-y-2">
                {value.map((item, i) => (
                    <li key={i} className="flex items-center gap-1">
                        <input
                            type="text"
                            aria-label={`${field.label} ${i + 1}`}
                            value={item}
                            onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
                            className={inputClass}
                        />
                        <RowActions
                            index={i}
                            count={value.length}
                            onMove={(from, to) => onChange(move(value, from, to))}
                            onRemove={(index) => onChange(value.filter((_, j) => j !== index))}
                            label={`line ${i + 1}`}
                        />
                    </li>
                ))}
            </ul>
            <Button className="mt-2" disabled={full} onClick={() => onChange([...value, ""])}>
                <Plus aria-hidden className="h-4 w-4" /> Add
            </Button>
        </div>
    );
}
