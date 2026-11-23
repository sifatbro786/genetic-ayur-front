"use client";

import { useState } from "react";
import FieldEditor from "@/components/admin/FieldEditor";
import SaveBar, { SaveErrors } from "@/components/admin/SaveBar";
import { Button, Card, ErrorNote, PageHeader, inputClass } from "@/components/admin/ui";
import { useDraft } from "@/components/admin/useDraft";
import { useResource } from "@/components/admin/useResource";
import { adminFetch } from "@/lib/admin/api";
import { siteSchemas } from "@/lib/schema";
import { adminSession } from "@/lib/storage";

// The settings the API's PUT /api/admin/site accepts. Everything else in the
// document (_id, key, timestamps) is never sent back.
const SITE_FIELDS = ["storeName", "storeNameBn", "logo", "phone", "whatsapp", "email", "address", "facebook", "announcement", "shipping", "payment", "footer", "legal", "seo"];
const pickSite = (site) => Object.fromEntries(SITE_FIELDS.map((k) => [k, site[k]]));

export default function SettingsPage() {
    const res = useResource("/api/admin/site");
    if (!res.data) {
        return (
            <>
                <PageHeader title="Settings" />
                {res.error ? <ErrorNote error={res.error} onRetry={res.reload} /> : <p className="text-sm text-gray-500">Loading...</p>}
            </>
        );
    }
    return <SettingsEditor data={res.data} onSaved={res.setData} />;
}

function SettingsEditor({ data, onSaved }) {
    const [status, setStatus] = useState({ gateways: data.gateways, warnings: data.warnings });
    const draft = useDraft(pickSite(data.site), async (value) => {
        const res = await adminFetch("/api/admin/site", { method: "PUT", body: value });
        setStatus({ gateways: res.gateways, warnings: res.warnings });
        onSaved(res);
        return pickSite(res.site);
    });
    const editor = (schema) => <FieldEditor schema={schema} value={draft.draft} onChange={draft.setDraft} />;
    const g = status.gateways || {};

    return (
        <>
            <PageHeader title="Settings" description="Store contact details, payments, delivery charges and footer text.">
                <SaveBar draft={draft} />
            </PageHeader>
            <SaveErrors draft={draft} />
            {status.warnings?.length ? (
                <ul role="alert" className="mb-5 list-disc space-y-1 rounded-md border border-amber-200 bg-amber-50 py-3 pl-8 pr-4 text-sm text-amber-900">
                    {status.warnings.map((w) => (
                        <li key={w}>{w}</li>
                    ))}
                </ul>
            ) : null}

            <div className="space-y-5">
                <Card title="Store details">{editor(siteSchemas.store)}</Card>
                <Card title="Announcement bar">{editor(siteSchemas.announcement)}</Card>

                <Card
                    title="Payments"
                    description="What customers can choose in the order form. bKash and Nagad numbers are shown to customers, who send money and type the TrxID; you verify it under Orders."
                >
                    <div className="space-y-6">
                        {editor(siteSchemas.cod)}
                        <fieldset className="space-y-5 border-t border-gray-200 pt-5">
                            <legend className="sr-only">bKash</legend>
                            {editor(siteSchemas.bkash)}
                            <p className="text-xs text-gray-500">
                                bKash gateway keys in the API .env: <strong>{g.bkash ? "set" : "not set"}</strong>. Without them only manual mode works.
                            </p>
                        </fieldset>
                        <fieldset className="space-y-5 border-t border-gray-200 pt-5">
                            <legend className="sr-only">Nagad</legend>
                            {editor(siteSchemas.nagad)}
                        </fieldset>
                        <fieldset className="space-y-5 border-t border-gray-200 pt-5">
                            <legend className="sr-only">Online payment</legend>
                            {editor(siteSchemas.online)}
                            <p className="text-xs text-gray-500">
                                SSLCommerz keys in the API .env: <strong>{g.sslcommerz ? "set" : "not set"}</strong>. Online payment stays hidden from customers until they are.
                            </p>
                        </fieldset>
                        <div className="border-t border-gray-200 pt-5">{editor(siteSchemas.advance)}</div>
                    </div>
                </Card>

                <Card title="Delivery charges" description="Shown in the order form. A pack with free delivery makes the whole parcel free.">
                    {editor(siteSchemas.shipping)}
                </Card>
                <Card title="Search and sharing" description="How the site looks in Google and when the link is shared on Facebook or WhatsApp.">
                    {editor(siteSchemas.seo)}
                </Card>
                <Card title="Footer">{editor(siteSchemas.footer)}</Card>
                <Card title="Privacy policy page" description="Shown at /privacy.">
                    {editor(siteSchemas.privacy)}
                </Card>
                <Card title="Terms page" description="Shown at /terms.">
                    {editor(siteSchemas.terms)}
                </Card>
                <PasswordCard />
            </div>
        </>
    );
}

// Changing the password signs out every other session (the API bumps the
// token version) and returns a new token for this one.
function PasswordCard() {
    const [form, setForm] = useState({ current: "", next: "", again: "" });
    const [state, setState] = useState({ busy: false, message: null });

    const submit = async (e) => {
        e.preventDefault();
        if (form.next.length < 10) return setState({ busy: false, message: { ok: false, text: "Use at least 10 characters." } });
        if (form.next !== form.again) return setState({ busy: false, message: { ok: false, text: "The two new passwords do not match." } });
        setState({ busy: true, message: null });
        try {
            const res = await adminFetch("/api/admin/auth/password", {
                method: "PATCH",
                body: { currentPassword: form.current, newPassword: form.next },
            });
            adminSession.set(res.token);
            setForm({ current: "", next: "", again: "" });
            setState({ busy: false, message: { ok: true, text: "Password changed. Other devices are signed out." } });
        } catch (err) {
            setState({ busy: false, message: { ok: false, text: err.message } });
        }
    };

    return (
        <Card title="Change password" description="10 to 72 characters. Other devices are signed out.">
            <form onSubmit={submit} className="grid max-w-md gap-3">
                {[
                    ["current", "Current password", "current-password"],
                    ["next", "New password", "new-password"],
                    ["again", "New password again", "new-password"],
                ].map(([key, label, ac]) => (
                    <label key={key} className="text-sm font-medium text-gray-700">
                        {label}
                        <input
                            type="password"
                            autoComplete={ac}
                            maxLength={72}
                            value={form[key]}
                            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                            className={`${inputClass} mt-1`}
                        />
                    </label>
                ))}
                {state.message ? <p className={`text-sm ${state.message.ok ? "text-green-700" : "text-red-700"}`}>{state.message.text}</p> : null}
                <Button type="submit" variant="primary" disabled={state.busy || !form.current || !form.next}>
                    {state.busy ? "Saving..." : "Change password"}
                </Button>
            </form>
        </Card>
    );
}
