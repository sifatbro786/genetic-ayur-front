import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/store/Footer";
import Header from "@/components/store/Header";
import MobileBar from "@/components/store/MobileBar";
import OrderSection from "@/components/store/OrderSection";
import Photo from "@/components/store/Photo";
import { getStorefront } from "@/lib/api/storefront";
import { taka } from "@/lib/format";

// Product pages for multi-product stores. Data comes from the same cached
// /api/storefront call as the landing page (one product list, 15 to 20
// items), so a dashboard save refreshes these pages with the same tag.
// Known slugs are prerendered; a product added later is rendered on its first
// visit and cached (Cache Components ISR).
// No try/catch on purpose: an unreachable API must fail the build loudly
// instead of producing a build with no product pages.
export async function generateStaticParams() {
    const { products } = await getStorefront();
    // Cache Components needs at least one entry; the placeholder 404s.
    return products.length ? products.map((p) => ({ slug: p.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const { site, products } = await getStorefront();
    const product = products.find((p) => p.slug === slug);
    if (!product) return { title: `পণ্যটি পাওয়া যায়নি | ${site.storeNameBn}` };
    return {
        title: `${product.nameBn} | ${site.storeNameBn}`,
        description: product.shortDescription || site.seo?.description,
        openGraph: { images: product.image ? [product.image] : undefined },
    };
}

export default async function ProductPage({ params }) {
    const { site } = await getStorefront();
    return (
        <>
            <Header site={site} />
            <main>
                <Suspense fallback={<div className="paper-grain min-h-[70vh]" />}>
                    <ProductView params={params} />
                </Suspense>
            </main>
            <Footer site={site} />
            <MobileBar site={site} />
        </>
    );
}

async function ProductView({ params }) {
    const { slug } = await params;
    const { site, landing, products } = await getStorefront();
    const product = products.find((p) => p.slug === slug);
    if (!product) notFound();

    const images = [product.image, ...(product.gallery || [])].filter(Boolean);
    const lowest = product.variants.reduce((min, v) => (v.price < min.price ? v : min), product.variants[0]);

    return (
        <>
            <section className="paper-grain overflow-hidden">
                <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-14 lg:pb-24 lg:pt-12">
                    <div>
                        <div className="relative mx-auto aspect-[4/5] w-[78%] max-w-[26rem] rounded-arch bg-[radial-gradient(ellipse_at_50%_38%,#1f7a2a_0%,#0a4d14_45%,#06300c_100%)] shadow-[0_30px_60px_-30px_rgb(6_48_12/0.8)]">
                            <div aria-hidden className="absolute inset-3 rounded-arch border border-sona/45" />
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    fetchPriority="high"
                                    className="absolute bottom-[6%] left-1/2 w-[60%] -translate-x-1/2 drop-shadow-[0_18px_22px_rgb(0_0_0/0.45)]"
                                />
                            ) : null}
                        </div>
                        {images.length > 1 ? (
                            <ul className="mt-8 grid grid-cols-4 gap-3">
                                {images.slice(1).map((src) => (
                                    <li key={src}>
                                        <Photo src={src} alt="" className="aspect-square rounded-xl" />
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>

                    <div>
                        <Link href="/" className="font-hand text-xl text-dalchini">
                            {site.storeNameBn}
                        </Link>
                        <h1 className="mt-2 font-display text-[2.1rem] font-bold leading-[1.32] text-bon sm:text-5xl sm:leading-[1.3]">{product.nameBn}</h1>
                        <p className="mt-2 text-kali-soft">
                            {product.name}
                            {product.netWeight ? `, ${product.netWeight}` : ""}
                        </p>
                        {lowest ? (
                            <p className="mt-6 flex flex-wrap items-baseline gap-x-3">
                                <span className="font-display text-4xl font-bold text-kali">{taka(lowest.price)}</span>
                                {lowest.comparePrice > lowest.price ? (
                                    <span className="text-xl text-kali-soft line-through decoration-dalchini/70">{taka(lowest.comparePrice)}</span>
                                ) : null}
                                {!product.inStock ? <span className="font-hand text-xl text-dalchini">এখন স্টকে নেই</span> : null}
                            </p>
                        ) : null}
                        {product.shortDescription ? <p className="mt-6 text-lg text-kali">{product.shortDescription}</p> : null}
                        {product.description ? (
                            <div className="mt-6 whitespace-pre-line text-[17px] leading-[1.85] text-kali-soft">{product.description}</div>
                        ) : null}
                        <a
                            href="#order"
                            className="mt-8 inline-block rounded-full bg-bon px-8 py-4 text-lg font-semibold text-kagoj shadow-[0_10px_24px_-10px_rgb(10_77_20/0.7)] transition-transform hover:-translate-y-0.5"
                        >
                            অর্ডার করুন
                        </a>
                    </div>
                </div>
            </section>
            <OrderSection data={landing.sections.order} products={products} initialSlug={product.slug} site={site} />
        </>
    );
}
