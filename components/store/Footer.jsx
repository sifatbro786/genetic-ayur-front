import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { telHref, whatsappHref } from "@/lib/format";

export default function Footer({ site }) {
    return (
        <footer className="bg-kosh pb-24 text-kagoj/80 sm:pb-0">
            <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_1fr]">
                <div>
                    {/* The logo is drawn for light backgrounds, so it sits on
                        a paper plate instead of being inverted. */}
                    <span className="inline-block rounded-xl bg-kagoj px-4 py-2">
                        <img src={site.logo} alt={site.storeName} className="h-16 w-auto" />
                    </span>
                    <p className="mt-5 max-w-md">{site.footer.about}</p>
                    <nav aria-label="নীতিমালা" className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
                        <Link href="/privacy" className="underline-offset-4 hover:text-kagoj hover:underline">
                            গোপনীয়তা নীতি
                        </Link>
                        <Link href="/terms" className="underline-offset-4 hover:text-kagoj hover:underline">
                            শর্তাবলি
                        </Link>
                    </nav>
                </div>
                <address className="space-y-3 not-italic">
                    <p className="font-display text-xl font-semibold text-sona-light">যোগাযোগ</p>
                    <a href={telHref(site.phone)} className="flex items-center gap-3 hover:text-kagoj">
                        <Phone aria-hidden className="h-4 w-4 text-sona" />
                        <span className="tabular-nums">{site.phone}</span>
                    </a>
                    <a href={whatsappHref(site.whatsapp)} className="flex items-center gap-3 hover:text-kagoj">
                        <span aria-hidden className="w-4 text-center text-xs font-bold text-sona">
                            WA
                        </span>
                        WhatsApp: <span className="tabular-nums">{site.whatsapp}</span>
                    </a>
                    <a href={`mailto:${site.email}`} className="flex items-center gap-3 hover:text-kagoj">
                        <Mail aria-hidden className="h-4 w-4 text-sona" />
                        {site.email}
                    </a>
                    <p className="flex gap-3">
                        <MapPin aria-hidden className="mt-1.5 h-4 w-4 shrink-0 text-sona" />
                        {site.address}
                    </p>
                </address>
            </div>
            <div className="border-t border-kagoj/15">
                <div className="mx-auto max-w-6xl space-y-4 px-5 py-6 text-sm text-kagoj/60">
                    <p className="max-w-3xl">{site.footer.disclaimer}</p>
                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                        <span>{site.footer.copyright}</span>
                        <span className="flex items-center gap-5">
                            <span>
                                Designed and developed by{" "}
                                <a
                                    href="https://strsltd.com"
                                    target="_blank"
                                    rel="noopener"
                                    className="font-medium text-sona-light underline-offset-4 hover:underline"
                                >
                                    STR Solutions LTD
                                </a>
                            </span>
                            <Link href="/admin" className="hover:text-kagoj">
                                Admin
                            </Link>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
