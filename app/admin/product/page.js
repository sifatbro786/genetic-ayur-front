"use client";

import FieldEditor from "@/components/admin/FieldEditor";
import SaveBar from "@/components/admin/SaveBar";
import { Card, PageHeader } from "@/components/admin/ui";
import { useDraft } from "@/components/admin/useDraft";
import { productSchema } from "@/lib/schema";
import { productStore } from "@/lib/stores";

export default function ProductPage() {
    const draft = useDraft(productStore);
    return (
        <>
            <PageHeader title="Product" description="Name, image, stock and pack prices shown on the landing page.">
                <SaveBar draft={draft} />
            </PageHeader>
            <Card>
                <FieldEditor schema={productSchema} value={draft.draft} onChange={draft.setDraft} />
            </Card>
        </>
    );
}
