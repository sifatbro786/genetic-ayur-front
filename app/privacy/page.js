import LegalPage from "@/components/store/LegalPage";
import { getStorefront } from "@/lib/api/storefront";

export async function generateMetadata() {
    const { site } = await getStorefront();
    return { title: `${site.legal?.privacy?.title || "গোপনীয়তা নীতি"} | ${site.storeNameBn}` };
}

export default async function Page() {
    const { site } = await getStorefront();
    return <LegalPage kind="privacy" site={site} />;
}
