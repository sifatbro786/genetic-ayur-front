const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export const toBn = (value) => String(value).replace(/\d/g, (d) => BN_DIGITS[d]);

export const toEnDigits = (value) =>
    String(value).replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

// Grouping is done by hand (not toLocaleString) so server and browser output
// are byte-identical; a locale mismatch here would be a hydration error.
const group = (n) => {
    const s = String(Math.round(Number(n) || 0));
    if (s.length <= 3) return s;
    // Bangladeshi grouping: last three digits, then pairs (12,50,000).
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return `${rest},${last3}`;
};

export const taka = (n) => `৳${toBn(group(n))}`;
export const takaEn = (n) => `৳${group(n)}`;

export const variantLabel = (variant) =>
    (variant?.options || []).map((o) => o.value).join(" / ");

// "২ কৌটা × ৩" style line for an order item; quantity 1 shows the pack only.
export const itemLabel = (item) =>
    item.quantity > 1 ? `${variantLabel(item.variant)} × ${item.quantity}` : variantLabel(item.variant);

// Accepts 01XXXXXXXXX with optional +88 / 88 prefix, spaces, hyphens and
// Bangla digits. Returns the 11-digit form or null.
export const normalizePhone = (input) => {
    const digits = toEnDigits(input || "").replace(/[^\d]/g, "");
    const local = digits.startsWith("880") ? digits.slice(2) : digits;
    return /^01[3-9]\d{8}$/.test(local) ? local : null;
};

export const telHref = (phone) => `tel:+88${toEnDigits(phone).replace(/[^\d]/g, "")}`;

export const whatsappHref = (phone, text) => {
    const n = `88${toEnDigits(phone).replace(/[^\d]/g, "")}`;
    return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
};
