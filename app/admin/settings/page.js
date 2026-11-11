"use client";

import { useState } from "react";
import FieldEditor from "@/components/admin/FieldEditor";
import SaveBar from "@/components/admin/SaveBar";
import { Button, Card, PageHeader } from "@/components/admin/ui";
import { useDraft } from "@/components/admin/useDraft";
import { siteSchemas } from "@/lib/schema";
import { landingStore, ordersStore, productStore, siteStore } from "@/lib/stores";

export default function SettingsPage() {
    const draft = useDraft(siteStore);
    const [confirmReset, setConfirmReset] = useState(false);
    const editor = (schema) => <FieldEditor schema={schema} value={draft.draft} onChange={draft.setDraft} />;

    return (
        <>
            <PageHeader title="Settings" description="Store contact details, delivery charges and footer text.">
                <SaveBar draft={draft} />
            </PageHeader>
            <div className="space-y-5">
                <Card title="Store details">{editor(siteSchemas.store)}</Card>
                <Card title="Announcement bar">{editor(siteSchemas.announcement)}</Card>
                <Card title="Delivery charges" description="Shown in the order form. A pack with free delivery ignores these.">
                    {editor(siteSchemas.shipping)}
                </Card>
                <Card title="Footer">{editor(siteSchemas.footer)}</Card>
                <Card title="Privacy policy page" description="Shown at /privacy.">
                    {editor(siteSchemas.privacy)}
                </Card>
                <Card title="Terms page" description="Shown at /terms.">
                    {editor(siteSchemas.terms)}
                </Card>
                <Card title="Demo data" description="Removes every change saved in this browser: content, product, settings and orders.">
                    {confirmReset ? (
                        <Button
                            variant="danger"
                            onClick={() => {
                                [landingStore, productStore, ordersStore].forEach((s) => s.reset());
                                draft.resetToDefault();
                                setConfirmReset(false);
                            }}
                        >
                            Yes, reset everything
                        </Button>
                    ) : (
                        <Button variant="danger" onClick={() => setConfirmReset(true)}>
                            Reset demo data
                        </Button>
                    )}
                </Card>
            </div>
        </>
    );
}
