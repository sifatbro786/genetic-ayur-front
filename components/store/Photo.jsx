"use client";

import { useState } from "react";
import { Leaf } from "lucide-react";

// Plain <img> on purpose: sources are a mix of local files, remote demo
// photos and data URLs uploaded from the dashboard, which next/image cannot
// optimise without a loader. Revisit once images live on the backend/CDN.
export default function Photo({ src, alt, className = "", imgClassName = "" }) {
    const [failedSrc, setFailedSrc] = useState(null);
    const failed = !src || failedSrc === src;

    return (
        <div className={`overflow-hidden bg-bon/15 ${className}`}>
            {failed ? (
                <div className="flex h-full w-full items-center justify-center text-bon/40">
                    <Leaf aria-hidden className="h-10 w-10" strokeWidth={1.25} />
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    onError={() => setFailedSrc(src)}
                    className={`h-full w-full object-cover ${imgClassName}`}
                />
            )}
        </div>
    );
}
