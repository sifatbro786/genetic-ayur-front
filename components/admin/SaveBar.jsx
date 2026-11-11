import { Button } from "./ui";

export default function SaveBar({ draft }) {
    return (
        <>
            {draft.message ? (
                <span role="status" className={`text-sm ${draft.message.ok ? "text-green-700" : "text-red-700"}`}>
                    {draft.message.text}
                </span>
            ) : draft.dirty ? (
                <span className="text-sm text-amber-700">Unsaved changes</span>
            ) : null}
            <Button disabled={!draft.dirty} onClick={draft.discard}>
                Discard
            </Button>
            <Button variant="primary" disabled={!draft.dirty} onClick={draft.save}>
                Save changes
            </Button>
        </>
    );
}
