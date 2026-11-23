export const inputClass =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200";

export function Button({ variant = "secondary", className = "", ...props }) {
    const styles = {
        primary: "bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-300",
        secondary: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 disabled:text-gray-300",
        danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
    };
    return (
        <button
            type="button"
            className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${styles[variant]} ${className}`}
            {...props}
        />
    );
}

export function Card({ title, description, children, className = "" }) {
    return (
        <section className={`rounded-lg border border-gray-200 bg-white ${className}`}>
            {title ? (
                <header className="border-b border-gray-200 px-5 py-3.5">
                    <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                    {description ? <p className="mt-0.5 text-xs text-gray-500">{description}</p> : null}
                </header>
            ) : null}
            <div className="p-5">{children}</div>
        </section>
    );
}

export function PageHeader({ title, description, children }) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">{children}</div>
        </div>
    );
}

const STATUS_STYLES = {
    Pending: "bg-amber-50 text-amber-800 ring-amber-200",
    Confirmed: "bg-blue-50 text-blue-800 ring-blue-200",
    Processing: "bg-indigo-50 text-indigo-800 ring-indigo-200",
    Shipped: "bg-violet-50 text-violet-800 ring-violet-200",
    Delivered: "bg-green-50 text-green-800 ring-green-200",
    Cancelled: "bg-gray-100 text-gray-600 ring-gray-200",
};

export function StatusBadge({ status }) {
    return (
        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status] || STATUS_STYLES.Cancelled}`}>
            {status}
        </span>
    );
}

const PAYMENT_STYLES = {
    Pending: "bg-gray-50 text-gray-700 ring-gray-200",
    Verifying: "bg-amber-50 text-amber-800 ring-amber-200",
    "Advance Paid": "bg-teal-50 text-teal-800 ring-teal-200",
    Paid: "bg-green-50 text-green-800 ring-green-200",
    Failed: "bg-red-50 text-red-700 ring-red-200",
    Refunded: "bg-gray-100 text-gray-600 ring-gray-200",
};

export function PaymentBadge({ status }) {
    return (
        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${PAYMENT_STYLES[status] || PAYMENT_STYLES.Pending}`}>
            {status}
        </span>
    );
}

export function Pagination({ page, totalPages, total, onPage }) {
    if (!totalPages || totalPages <= 1) return total ? <p className="px-4 py-3 text-xs text-gray-500">{total} in total</p> : null;
    return (
        <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 text-sm">
            <span className="text-xs text-gray-500">
                Page {page} of {totalPages} ({total} in total)
            </span>
            <div className="flex gap-2">
                <Button disabled={page <= 1} onClick={() => onPage(page - 1)}>
                    Previous
                </Button>
                <Button disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
                    Next
                </Button>
            </div>
        </div>
    );
}

export function ErrorNote({ error, onRetry }) {
    if (!error) return null;
    return (
        <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <span>{error.message}</span>
            {onRetry ? <Button onClick={onRetry}>Try again</Button> : null}
        </div>
    );
}

// Dashboard pages render only in the browser (AdminShell waits for
// hydration), so the browser's time zone is safe here. Bangladesh time is
// forced anyway so every staff device shows the same clock.
export const formatDate = (iso) =>
    iso
        ? new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
        : "";
