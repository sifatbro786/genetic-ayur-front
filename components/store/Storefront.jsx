"use client";

import { useLanding, useProduct, useSite } from "@/lib/stores";
import Benefits from "./Benefits";
import Faq from "./Faq";
import Footer from "./Footer";
import Header from "./Header";
import Hero from "./Hero";
import Ingredients from "./Ingredients";
import MobileBar from "./MobileBar";
import OrderSection from "./OrderSection";
import Reviews from "./Reviews";
import Trust from "./Trust";
import Usage from "./Usage";

const SECTIONS = {
    hero: Hero,
    trust: Trust,
    benefits: Benefits,
    ingredients: Ingredients,
    usage: Usage,
    reviews: Reviews,
    order: OrderSection,
    faq: Faq,
};

// A client component because, in the static phase, content can be overridden
// from localStorage by the dashboard. The server still renders the defaults,
// so crawlers and first paint get the full page.
export default function Storefront() {
    const site = useSite();
    const product = useProduct();
    const landing = useLanding();

    return (
        <>
            <Header site={site} />
            <main>
                {landing.order.map((key) => {
                    const Section = SECTIONS[key];
                    const data = landing.sections[key];
                    if (!Section || !data?.enabled) return null;
                    return <Section key={key} data={data} product={product} site={site} />;
                })}
            </main>
            <Footer site={site} />
            <MobileBar site={site} />
        </>
    );
}
