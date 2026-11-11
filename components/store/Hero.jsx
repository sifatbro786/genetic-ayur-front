import { Phone } from "lucide-react";
import { taka, telHref } from "@/lib/format";

// Sticker positions around the arch. Kept here, not in content, because they
// are layout: the dashboard edits the words, not where they sit.
const STICKERS = [
    "left-0 top-[16%] [--tilt:-7deg]",
    "right-0 top-[44%] [--tilt:5deg]",
    "left-[2%] bottom-[9%] [--tilt:-3deg]",
];

export default function Hero({ data, product, site }) {
    const lowest = product.variants.reduce((min, v) => (v.price < min.price ? v : min), product.variants[0]);

    return (
        <section id="top" className="paper-grain overflow-hidden">
            <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-8 lg:pb-24 lg:pt-16">
                <div>
                    {data.kicker ? (
                        <p className="inline-block -rotate-1 font-hand text-xl text-dalchini sm:text-2xl">{data.kicker}</p>
                    ) : null}
                    <h1 className="mt-3 max-w-[20ch] whitespace-pre-line text-balance font-display text-[2.15rem] font-bold leading-[1.32] text-bon sm:text-5xl sm:leading-[1.3] lg:text-[3.25rem]">
                        {data.title}
                    </h1>
                    <p className="mt-6 max-w-[34rem] text-lg text-kali-soft">{data.text}</p>

                    {lowest ? (
                        <div className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-1">
                            <span className="relative font-display text-5xl font-bold leading-none text-kali">
                                {taka(lowest.price)}
                                {/* hand-drawn underline */}
                                <svg
                                    aria-hidden
                                    viewBox="0 0 200 14"
                                    preserveAspectRatio="none"
                                    className="absolute -bottom-3 left-0 h-3 w-full text-sona"
                                >
                                    <path
                                        d="M3 9c28-5 61-7 97-5 33 2 61 1 97-2"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>
                            {lowest.comparePrice > lowest.price ? (
                                <span className="text-xl text-kali-soft line-through decoration-dalchini/70">
                                    {taka(lowest.comparePrice)}
                                </span>
                            ) : null}
                            <span className="basis-full pt-4 text-[15px] text-kali-soft">
                                {product.nameBn}, {product.netWeight}
                            </span>
                        </div>
                    ) : null}

                    <div className="mt-7 flex flex-wrap gap-3">
                        <a
                            href="#order"
                            className="rounded-full bg-bon px-8 py-4 text-lg font-semibold text-kagoj shadow-[0_10px_24px_-10px_rgb(10_77_20/0.7)] transition-transform hover:-translate-y-0.5"
                        >
                            {data.primaryCta}
                        </a>
                        <a
                            href={telHref(site.phone)}
                            className="flex items-center gap-2 rounded-full border-2 border-bon/25 px-6 py-4 text-lg font-semibold text-bon transition-colors hover:border-bon"
                        >
                            <Phone aria-hidden className="h-5 w-5" />
                            {data.secondaryCta}
                        </a>
                    </div>
                </div>

                {/* The arch niche is the page's signature shape; ingredient
                    photos repeat it further down. */}
                <div className="relative mx-auto w-full max-w-[25rem] lg:max-w-[30rem]">
                    <div className="relative mx-auto aspect-[4/5] w-[84%] rounded-arch bg-[radial-gradient(ellipse_at_50%_38%,#1f7a2a_0%,#0a4d14_45%,#06300c_100%)] shadow-[0_30px_60px_-30px_rgb(6_48_12/0.8)]">
                        <div aria-hidden className="absolute inset-3 rounded-arch border border-sona/45" />
                        <div
                            aria-hidden
                            className="absolute bottom-[4%] left-1/2 h-[7%] w-[64%] -translate-x-1/2 rounded-[50%] bg-black/55 blur-md"
                        />
                        <img
                            src={product.image}
                            alt={`${product.name} কৌটা`}
                            fetchPriority="high"
                            className="absolute bottom-[5%] left-1/2 w-[60%] -translate-x-1/2 animate-rise drop-shadow-[0_18px_22px_rgb(0_0_0/0.45)]"
                        />
                    </div>
                    {data.notes?.slice(0, STICKERS.length).map((note, i) =>
                        note ? (
                            <span
                                key={i}
                                style={{ animationDelay: `${0.7 + i * 0.18}s` }}
                                className={`absolute ${STICKERS[i]} rotate-(--tilt) animate-scribble rounded-md bg-sona-light px-3.5 py-1.5 font-hand text-lg leading-snug text-kosh shadow-[0_6px_14px_-6px_rgb(0_0_0/0.45)] sm:text-xl`}
                            >
                                {note}
                            </span>
                        ) : null,
                    )}
                </div>
            </div>
        </section>
    );
}
