import "./globals.css";
import { defaultSite } from "@/lib/defaults";

// VERCEL_PROJECT_PRODUCTION_URL is set by Vercel at build time; set
// NEXT_PUBLIC_SITE_URL yourself once the client's own domain is attached.
const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000");

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: defaultSite.seo.title,
    description: defaultSite.seo.description,
    openGraph: {
        title: defaultSite.seo.title,
        description: defaultSite.seo.description,
        images: ["/images/og.jpg"],
        locale: "bn_BD",
        type: "website",
    },
};

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
