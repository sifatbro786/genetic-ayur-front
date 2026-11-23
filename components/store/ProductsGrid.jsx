import Link from "next/link";
import { taka } from "@/lib/format";

// Every active product, for when the shop sells more than one. Each card
// repeats the hero's arch at a small scale and links to the product's own
// page. With a single product the section stays empty even if it is switched
// on: the hero and the order form already sell it.
export default function ProductsGrid({ data, products }) {
    if (!products || products.length < 2) return null;

    return (
        <section id="products" className="paper-grain border-t border-bon/10">
            <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
                <div className="max-w-2xl">
                    <h2 className="font-display text-4xl font-bold leading-[1.35] text-bon sm:text-5xl sm:leading-[1.3]">
                        {data.title || "আমাদের সব পণ্য"}
                    </h2>
                    {data.text ? <p className="mt-4 whitespace-pre-line text-lg text-kali-soft">{data.text}</p> : null}
                </div>

                <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => {
                        const lowest = product.variants.reduce((min, v) => (v.price < min.price ? v : min), product.variants[0]);
                        return (
                            <li key={product.slug}>
                                <Link
                                    href={`/products/${product.slug}`}
                                    prefetch
                                    className="group block rounded-[1.5rem] bg-kagoj-deep/70 p-5 transition-colors hover:bg-kagoj-deep"
                                >
                                    <div className="relative mx-auto aspect-[4/5] w-[72%] rounded-arch bg-[radial-gradient(ellipse_at_50%_38%,#1f7a2a_0%,#0a4d14_45%,#06300c_100%)]">
                                        <div aria-hidden className="absolute inset-2 rounded-arch border border-sona/40" />
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt=""
                                                loading="lazy"
                                                decoding="async"
                                                className="absolute bottom-[6%] left-1/2 w-[62%] -translate-x-1/2 drop-shadow-[0_14px_18px_rgb(0_0_0/0.45)] transition-transform duration-300 group-hover:-translate-y-1.5"
                                            />
                                        ) : null}
                                        {!product.inStock ? (
                                            <span className="absolute left-1/2 top-[14%] -translate-x-1/2 -rotate-3 rounded bg-kagoj px-2.5 py-0.5 font-hand text-base text-dalchini">
                                                স্টকে নেই
                                            </span>
                                        ) : null}
                                    </div>
                                    <h3 className="mt-5 font-display text-2xl font-semibold leading-snug text-kali">{product.nameBn}</h3>
                                    {product.shortDescription ? (
                                        <p className="mt-1.5 line-clamp-2 text-[15px] text-kali-soft">{product.shortDescription}</p>
                                    ) : null}
                                    <p className="mt-3 flex items-baseline justify-between gap-3">
                                        <span className="font-display text-2xl font-bold text-bon">
                                            {product.variants.length > 1 ? <span className="text-base font-medium text-kali-soft">শুরু </span> : null}
                                            {lowest ? taka(lowest.price) : null}
                                        </span>
                                        <span className="text-[15px] font-semibold text-pata underline-offset-4 group-hover:underline">
                                            বিস্তারিত দেখুন
                                        </span>
                                    </p>
                                    {product.netWeight ? <p className="text-sm text-kali-soft">{product.netWeight}</p> : null}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
