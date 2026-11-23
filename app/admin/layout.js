import { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
    title: "Dashboard | Genetic Ayur",
    robots: { index: false, follow: false },
};

// The dashboard reads the URL (active nav, filters, product id) and
// localStorage, all of which exist only at request time in the browser, so
// the whole shell streams in behind one boundary; the static part is a blank
// grey page.
export default function AdminLayout({ children }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-100" />}>
            <AdminShell>{children}</AdminShell>
        </Suspense>
    );
}
