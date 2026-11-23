import { Button } from "./ui";

export default function SaveBar({ draft }) {
    return (
        <>
            {draft.message ? (
                <span role="status" className={`max-w-md text-sm ${draft.message.ok ? "text-green-700" : "text-red-700"}`}>
                    {draft.message.text}
                </span>
            ) : draft.dirty ? (
                <span className="text-sm text-amber-700">Unsaved changes</span>
            ) : null}
            <Button disabled={!draft.dirty || draft.saving} onClick={draft.discard}>
                Discard
            </Button>
            <Button variant="primary" disabled={!draft.dirty || draft.saving} onClick={draft.save}>
                {draft.saving ? "Saving..." : "Save changes"}
            </Button>
        </>
    );
}

// Field level problems the API returned (landing section cleaning, model
// validation), listed under the page header.
export function SaveErrors({ draft }) {
    const details = draft.message && !draft.message.ok ? draft.message.details : null;
    if (!details?.length || (details.length === 1 && details[0] === draft.message.text)) return null;
    return (
        <ul role="alert" className="mb-5 list-disc space-y-1 rounded-md border border-red-200 bg-red-50 py-3 pl-8 pr-4 text-sm text-red-800">
            {details.map((d, i) => (
                <li key={i}>{d}</li>
            ))}
        </ul>
    );
}
