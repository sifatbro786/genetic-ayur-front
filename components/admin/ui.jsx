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
