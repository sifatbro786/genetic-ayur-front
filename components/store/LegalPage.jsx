"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { defaultSite } from "@/lib/defaults";
import { telHref } from "@/lib/format";
import { useSite } from "@/lib/stores";
import Footer from "./Footer";
import Header from "./Header";

// Turns the dashboard's plain-text body into blocks. Only text nodes are
// produced, so whatever is typed in the dashboard can never inject markup.
function parse(body = "") {
    return body
        .split(/\n\s*\n/)
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .flatMap((chunk) => {
            const lines = chunk.split("\n").map((l) => l.trim());
            const out = [];
            let list = null;
            let para = [];
            const flushPara = () => {
                if (para.length) out.push({ type: "p", text: para.join(" ") });
                para = [];
            };
            for (const line of lines) {
                if (line.startsWith("## ")) {
                    flushPara();
                    list = null;
                    out.push({ type: "h2", text: line.slice(3) });
                } else if (line.startsWith("- ")) {
                    flushPara();
                    if (!list) {
                        list = { type: "ul", items: [] };
                        out.push(list);
                    }
                    list.items.push(line.slice(2));
                } else {
                    list = null;
                    para.push(line);
                }
            }
            flushPara();
            return out;
        });
}

export default function LegalPage({ kind }) {
    const site = useSite();
    const page = site.legal?.[kind] || defaultSite.legal[kind];
    const blocks = parse(page.body);
    const other = kind === "privacy" ? { href: "/terms", label: "শর্তাবলি" } : { href: "/privacy", label: "গোপনীয়তা নীতি" };

    return (
        <>
            <Header site={site} />
            <main>
                <div className="bg-bon-deep text-kagoj">
                    <div className="mx-auto max-w-3xl px-5 pb-14 pt-14 sm:pt-20">
                        <p className="-rotate-1 font-hand text-2xl text-sona-light">{site.storeNameBn}</p>
                        <h1 className="mt-2 font-display text-4xl font-bold leading-[1.35] sm:text-5xl">{page.title}</h1>
                        {page.updated ? <p className="mt-3 text-kagoj/70">সর্বশেষ হালনাগাদ: {page.updated}</p> : null}
                    </div>
                </div>

                <div className="paper-grain">
                    <article className="mx-auto max-w-3xl px-5 py-14 sm:py-16">
                        {blocks.map((block, i) => {
                            if (block.type === "h2")
                                return (
                                    <h2 key={i} className="mt-10 font-display text-2xl font-semibold text-bon first:mt-0">
                                        {block.text}
                                    </h2>
                                );
                            if (block.type === "ul")
                                return (
                                    <ul key={i} className="mt-4 space-y-2 text-[17px] text-kali">
                                        {block.items.map((item, j) => (
                                            <li key={j} className="flex gap-3">
                                                <span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-pata" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                );
                            return (
                                <p key={i} className="mt-4 text-[17px] leading-[1.85] text-kali first:mt-0">
                                    {block.text}
                                </p>
                            );
                        })}

                        <div className="mt-14 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-kagoj-deep px-6 py-5">
                            <div>
                                <p className="font-display text-xl font-semibold text-bon">কোনো প্রশ্ন আছে?</p>
                                <p className="text-kali-soft">ফোন করুন অথবা লিখুন {site.email} ঠিকানায়।</p>
                            </div>
                            <a
                                href={telHref(site.phone)}
                                className="inline-flex items-center gap-2 rounded-full bg-bon px-5 py-3 font-semibold text-kagoj hover:bg-bon-deep"
                            >
                                <Phone aria-hidden className="h-4 w-4" />
                                <span className="tabular-nums">{site.phone}</span>
                            </a>
                        </div>
                        <p className="mt-8 text-[15px]">
                            <Link href={other.href} className="font-medium text-bon underline underline-offset-4">
                                {other.label} পড়ুন
                            </Link>
                        </p>
                    </article>
                </div>
            </main>
            <Footer site={site} />
        </>
    );
}
