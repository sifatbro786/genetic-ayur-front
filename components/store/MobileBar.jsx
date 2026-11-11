"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { telHref, whatsappHref } from "@/lib/format";

// Thumb-reach actions for phone visitors (most traffic comes from Facebook
// ads on mobile). Hidden while the order form itself is on screen.
export default function MobileBar({ site }) {
    const [formVisible, setFormVisible] = useState(false);

    useEffect(() => {
        const target = document.getElementById("order");
        if (!target) return;
        const observer = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting), {
            threshold: 0.15,
        });
        observer.observe(target);
        return () => observer.disconnect();
    }, []);

    return (
        <nav
            aria-label="দ্রুত যোগাযোগ"
            className={`fixed inset-x-0 bottom-0 z-40 grid grid-cols-[1fr_1fr_1.5fr] border-t border-bon/15 bg-kagoj text-[15px] font-semibold transition-transform sm:hidden ${
                formVisible ? "translate-y-full" : ""
            }`}
        >
            <a href={telHref(site.phone)} className="flex items-center justify-center gap-2 py-3.5 text-bon">
                <Phone aria-hidden className="h-4 w-4" /> কল
            </a>
            <a
                href={whatsappHref(site.whatsapp)}
                className="flex items-center justify-center gap-2 border-x border-bon/15 py-3.5 text-bon"
            >
                <MessageCircle aria-hidden className="h-4 w-4" /> WhatsApp
            </a>
            <a href="#order" className="flex items-center justify-center bg-bon py-3.5 text-kagoj">
                অর্ডার করুন
            </a>
        </nav>
    );
}
