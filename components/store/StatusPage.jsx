"use client";

import Link from "next/link";
import { useSite } from "@/lib/stores";
import Footer from "./Footer";
import Header from "./Header";

const btnPrimary =
    "inline-flex items-center justify-center gap-2 rounded-full bg-sona px-7 py-3.5 text-lg font-semibold text-kosh transition-colors hover:bg-sona-light";
const btnSecondary =
    "inline-flex items-center justify-center gap-2 rounded-full border-2 border-kagoj/30 px-7 py-3.5 text-lg font-semibold text-kagoj transition-colors hover:border-kagoj";

// One action: a Link (href), a plain link such as tel: (external), or a button.
function Action({ action, primary }) {
    const className = primary ? btnPrimary : btnSecondary;
    if (action.onClick)
        return (
            <button type="button" onClick={action.onClick} className={className}>
                {action.label}
            </button>
        );
    if (action.external)
        return (
            <a href={action.href} className={className}>
                {action.label}
            </a>
        );
    return (
        <Link href={action.href} className={className}>
            {action.label}
        </Link>
    );
}

// Shared shell for the 404 and error pages: the storefront header and footer
// around a dark green panel. `art` is the large centrepiece.
export default function StatusPage({ art, kicker, title, text, actions, note }) {
    const site = useSite();
    return (
        <>
            <Header site={site} />
            <main className="paper-grain bg-bon-deep text-kagoj">
                <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 py-20 text-center">
                    {art}
                    {kicker ? <p className="mt-8 -rotate-2 font-hand text-2xl text-sona-light sm:text-3xl">{kicker}</p> : null}
                    <h1 className="mt-3 font-display text-3xl font-bold leading-[1.35] sm:text-5xl sm:leading-[1.3]">{title}</h1>
                    <p className="mt-4 max-w-xl text-lg text-kagoj/75">{text}</p>
                    <div className="mt-9 flex flex-wrap justify-center gap-3">
                        {actions.map((action, i) => (
                            <Action key={action.label} action={action} primary={i === 0} />
                        ))}
                    </div>
                    {note ? <p className="mt-8 text-sm text-kagoj/50">{note}</p> : null}
                </div>
            </main>
            <Footer site={site} />
        </>
    );
}
