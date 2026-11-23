import { landingProduct } from "@/lib/api/storefront";
import Benefits from "./Benefits";
import Faq from "./Faq";
import Footer from "./Footer";
import Header from "./Header";
import Hero from "./Hero";
import Ingredients from "./Ingredients";
import MobileBar from "./MobileBar";
import OrderSection from "./OrderSection";
import ProductsGrid from "./ProductsGrid";
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
    products: ProductsGrid,
};

// Server component: the page is rendered from the API's /api/storefront data
// (lib/api/storefront.js) and cached, so crawlers and first paint get the
// owner's real content. Only the order form and the mobile bar hydrate.
// Hidden sections never arrive here; the API strips them.
export default function Storefront({ site, landing, products }) {
    const product = landingProduct(landing, products);

    return (
        <>
            <Header site={site} />
            <main>
                {landing.order.map((key) => {
                    const Section = SECTIONS[key];
                    const data = landing.sections[key];
                    if (!Section || !data) return null;
                    // Nothing to sell (every product hidden): no order form.
                    if (key === "order" && !product) return null;
                    return (
                        <Section
                            key={key}
                            data={data}
                            product={product}
                            products={products}
                            initialSlug={product?.slug}
                            site={site}
                        />
                    );
                })}
            </main>
            <Footer site={site} />
            <MobileBar site={site} />
        </>
    );
}
