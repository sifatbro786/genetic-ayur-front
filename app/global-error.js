"use client";

// Replaces the root layout when the layout itself fails, so it cannot rely on
// the store hooks or the shared header. Kept deliberately small.
import "./globals.css";
import { defaultSite } from "@/lib/defaults";
import { telHref } from "@/lib/format";

export default function GlobalError({ retry }) {
    return (
        <html lang="bn">
            <body className="paper-grain flex min-h-screen items-center justify-center bg-kagoj px-5 text-kali">
                <title>সমস্যা হয়েছে | জেনেটিক আয়ুর</title>
                <div className="max-w-md text-center">
                    <img src={defaultSite.logo} alt={defaultSite.storeName} className="mx-auto h-24 w-auto" />
                    <h1 className="mt-6 font-display text-3xl font-bold leading-[1.4] text-bon">সাইটটি এই মুহূর্তে খুলছে না</h1>
                    <p className="mt-3 text-lg text-kali-soft">একটু পরে আবার চেষ্টা করুন, অথবা ফোন করে অর্ডার দিন।</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => retry()}
                            className="rounded-full bg-bon px-6 py-3 text-lg font-semibold text-kagoj hover:bg-bon-deep"
                        >
                            আবার চেষ্টা করুন
                        </button>
                        <a
                            href={telHref(defaultSite.phone)}
                            className="rounded-full border-2 border-bon/25 px-6 py-3 text-lg font-semibold text-bon hover:border-bon"
                        >
                            {defaultSite.phone}
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}
