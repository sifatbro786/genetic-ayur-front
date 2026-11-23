import { Suspense } from "react";
import Footer from "@/components/store/Footer";
import Header from "@/components/store/Header";
import OrderStatus from "@/components/store/OrderStatus";
import { getStorefront } from "@/lib/api/storefront";

export const metadata = {
    title: "অর্ডারের অবস্থা",
    // Order pages are private to the shopper's browser (guest token).
    robots: { index: false, follow: false },
};

// The shell (header, footer, contact) is cached with the storefront data; the
// order itself loads in the browser with the guest token from localStorage,
// sent as the X-Order-Token header and never put in the URL.
export default async function OrderPage() {
    const { site } = await getStorefront();
    return (
        <>
            <Header site={site} />
            <main className="paper-grain min-h-[70vh] px-5">
                <Suspense fallback={<p className="py-24 text-center text-lg text-kali-soft">অর্ডারের তথ্য আনা হচ্ছে...</p>}>
                    <OrderStatus site={site} />
                </Suspense>
            </main>
            <Footer site={site} />
        </>
    );
}
