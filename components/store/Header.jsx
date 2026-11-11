import { Phone } from "lucide-react";
import { telHref } from "@/lib/format";

export default function Header({ site }) {
    return (
        <>
            {site.announcement?.enabled && site.announcement.text ? (
                <p className="bg-bon-deep px-4 py-2 text-center text-sm text-kagoj">{site.announcement.text}</p>
            ) : null}
            <header className="sticky top-0 z-40 border-b border-bon/10 bg-kagoj">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2">
                    <a href="#top" className="shrink-0" aria-label={site.storeNameBn}>
                        <img src={site.logo} alt={site.storeName} className="h-12 w-auto sm:h-14" />
                    </a>
                    <div className="flex items-center gap-2 sm:gap-5">
                        <a
                            href={telHref(site.phone)}
                            className="hidden items-center gap-2 font-medium text-bon sm:flex"
                        >
                            <Phone aria-hidden className="h-4 w-4" />
                            <span className="tabular-nums">{site.phone}</span>
                        </a>
                        <a
                            href="#order"
                            className="rounded-full bg-bon px-5 py-2 text-[15px] font-semibold text-kagoj transition-colors hover:bg-bon-deep"
                        >
                            অর্ডার করুন
                        </a>
                    </div>
                </div>
            </header>
        </>
    );
}
