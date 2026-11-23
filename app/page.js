import IntroLoader from "@/components/store/IntroLoader";
import Storefront from "@/components/store/Storefront";
import { getStorefront } from "@/lib/api/storefront";

export default async function HomePage() {
    const { site, landing, products } = await getStorefront();
    return (
        <>
            <IntroLoader logo={site.logo} />
            <Storefront site={site} landing={landing} products={products} />
        </>
    );
}
