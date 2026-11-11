"use client";

import { useEffect } from "react";
import StatusPage from "@/components/store/StatusPage";
import { defaultProduct, defaultSite } from "@/lib/defaults";
import { telHref } from "@/lib/format";

export default function Error({ error, retry }) {
    useEffect(() => {
        // Stand-in until a logging service is wired up in the backend phase.
        console.error(error);
    }, [error]);

    // Server errors carry a digest that matches the server log; show it so a
    // customer can read it out on the phone. Client errors have none.
    const digest = error instanceof Error ? error.digest : undefined;

    return (
        <StatusPage
            art={
                <img
                    src={defaultProduct.image}
                    alt=""
                    className="h-44 w-auto -rotate-[78deg] drop-shadow-[0_18px_22px_rgb(0_0_0/0.5)] sm:h-56"
                />
            }
            kicker="একটু থামুন"
            title="কিছু একটা ঠিকমতো লোড হয়নি"
            text="সমস্যাটি আমাদের দিকে। আবার চেষ্টা করুন, অথবা সরাসরি ফোন করে অর্ডার দিন।"
            actions={[
                { label: "আবার চেষ্টা করুন", onClick: () => retry() },
                { label: `ফোন করুন ${defaultSite.phone}`, href: telHref(defaultSite.phone), external: true },
            ]}
            note={digest ? `ত্রুটির কোড: ${digest}` : null}
        />
    );
}
