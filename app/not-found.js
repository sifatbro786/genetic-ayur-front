import StatusPage from "@/components/store/StatusPage";
import { getStorefront, landingProduct } from "@/lib/api/storefront";
import { defaultProduct, defaultSite } from "@/lib/defaults";

export const metadata = { title: "পাতাটি পাওয়া যায়নি | জেনেটিক আয়ুর" };

export default async function NotFound() {
    // The 404 must render even when the API is down.
    let site = defaultSite;
    let image = defaultProduct.image;
    try {
        const data = await getStorefront();
        site = data.site;
        image = landingProduct(data.landing, data.products)?.image || image;
    } catch {
        // keep the built-in fallbacks
    }
    return (
        <StatusPage
            site={site}
            art={
                // ৪০৪ with the Kasturi jar, tipped over, standing in for the ০.
                <p
                    aria-label="৪০৪"
                    className="flex items-center justify-center font-display text-[7.5rem] font-bold leading-none text-sona-light sm:text-[11rem]"
                >
                    <span aria-hidden>৪</span>
                    <img
                        src={image}
                        alt=""
                        className="mx-1 h-[0.92em] w-auto rotate-[14deg] drop-shadow-[0_14px_18px_rgb(0_0_0/0.5)] sm:mx-3"
                    />
                    <span aria-hidden>৪</span>
                </p>
            }
            kicker="পথ হারিয়ে ফেলেছেন?"
            title="এই পাতাটি খুঁজে পাওয়া যায়নি"
            text="লিংকটি ভুল হতে পারে, অথবা পাতাটি সরিয়ে ফেলা হয়েছে। মূল পাতা থেকে কস্তুরী অ্যাকটিভ পাওয়ার অর্ডার করতে পারেন।"
            actions={[
                { label: "মূল পাতায় ফিরুন", href: "/" },
                { label: "অর্ডার করুন", href: "/#order" },
            ]}
        />
    );
}
