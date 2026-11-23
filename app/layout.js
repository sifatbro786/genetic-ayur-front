import "./globals.css";
import { getStorefront } from "@/lib/api/storefront";
import { defaultSite } from "@/lib/defaults";

// VERCEL_PROJECT_PRODUCTION_URL is set by Vercel at build time; set
// NEXT_PUBLIC_SITE_URL yourself once the client's own domain is attached.
const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000");

// SEO title and description are edited in Dashboard > Settings. The built-in
// copy is only used when the API cannot be reached (error pages).
export async function generateMetadata() {
    let seo = defaultSite.seo;
    try {
        const { site } = await getStorefront();
        seo = { title: site.seo?.title || defaultSite.seo.title, description: site.seo?.description || defaultSite.seo.description };
    } catch {
        // fall back to the built-in copy
    }
    return {
        metadataBase: new URL(siteUrl),
        title: seo.title,
        description: seo.description,
        openGraph: {
            title: seo.title,
            description: seo.description,
            images: ["/images/og.jpg"],
            locale: "bn_BD",
            type: "website",
        },
    };
}

export const viewport = {
    themeColor: "#06300c",
};

export default function RootLayout({ children }) {
    return (
        <html lang="bn">
            <head>
                {/* Only the two faces used above the fold are preloaded. */}
                <link
                    rel="preload"
                    href="/fonts/noto-serif-bengali-bengali-700-normal.woff2"
                    as="font"
                    type="font/woff2"
                    crossOrigin="anonymous"
                />
                <link
                    rel="preload"
                    href="/fonts/anek-bangla-bengali-wght-normal.woff2"
                    as="font"
                    type="font/woff2"
                    crossOrigin="anonymous"
                />
            </head>
            <body className="min-h-screen antialiased" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
