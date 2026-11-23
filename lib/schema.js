// Form definitions for the dashboard. One schema per editable document or
// landing section; FieldEditor renders them. Adding a landing section field
// means: one line here, the same field in the API's services/landingSchema.js
// (it drops unknown keys), then read it in the section component.

const text = (key, label, extra = {}) => ({ key, label, type: "text", ...extra });
const area = (key, label, extra = {}) => ({ key, label, type: "textarea", ...extra });
const num = (key, label, extra = {}) => ({ key, label, type: "number", ...extra });
const bool = (key, label, extra = {}) => ({ key, label, type: "boolean", ...extra });
// kind decides the size the API re-encodes an upload to (content 1600 px,
// product 1400 px, logo 600 px).
const image = (key, label, extra = {}) => ({ key, label, type: "image", kind: "content", ...extra });
const select = (key, label, options, extra = {}) => ({ key, label, type: "select", options, ...extra });

export const sectionLabels = {
    hero: "Hero",
    trust: "Trust strip",
    benefits: "Benefits",
    ingredients: "Ingredients",
    usage: "How to use",
    reviews: "Customer reviews",
    order: "Order form",
    faq: "FAQ",
    products: "All products grid",
};

export const sectionSchemas = {
    hero: [
        text("kicker", "Handwritten line above the title"),
        area("title", "Title", { rows: 2 }),
        area("text", "Intro paragraph"),
        text("primaryCta", "Order button text"),
        text("secondaryCta", "Call button text"),
        { key: "notes", label: "Stickers around the jar (max 3)", type: "strings", max: 3 },
    ],
    trust: [
        {
            key: "items",
            label: "Items",
            type: "list",
            itemTitle: (item) => item.title,
            newItem: { icon: "leaf", title: "", text: "" },
            fields: [
                {
                    key: "icon",
                    label: "Icon",
                    type: "select",
                    options: ["cash", "truck", "phone", "leaf", "shield"],
                },
                text("title", "Title"),
                text("text", "Text"),
            ],
        },
    ],
    benefits: [
        text("title", "Title"),
        area("text", "Intro paragraph"),
        image("image", "Photo"),
        text("handNote", "Handwritten sticker on the photo"),
        {
            key: "items",
            label: "Benefits",
            type: "list",
            itemTitle: (item) => item.title,
            newItem: { title: "", text: "" },
            fields: [text("title", "Title"), area("text", "Text")],
        },
    ],
    ingredients: [
        text("title", "Title"),
        area("text", "Intro paragraph"),
        {
            key: "items",
            label: "Ingredients",
            type: "list",
            itemTitle: (item) => item.name,
            newItem: { name: "", latin: "", text: "", image: "", featured: false },
            fields: [
                text("name", "Name"),
                bool("featured", "Show as a large photo (up to 4)"),
                text("latin", "Scientific name"),
                area("text", "Text"),
                image("image", "Photo"),
            ],
        },
    ],
    usage: [
        text("title", "Title"),
        area("text", "Intro paragraph"),
        text("slipTitle", "Slip heading"),
        { key: "steps", label: "Steps (in order)", type: "strings" },
        text("signature", "Signature on the slip"),
        area("caution", "Caution note"),
    ],
    reviews: [
        text("title", "Title"),
        text("text", "Intro line"),
        {
            key: "items",
            label: "Reviews",
            type: "list",
            help: "Only add feedback from real customers. Items marked as sample show a visible tag on the site.",
            itemTitle: (item) => item.name,
            newItem: { name: "", location: "", text: "", isSample: false },
            fields: [
                text("name", "Customer name"),
                text("location", "Location"),
                area("text", "Review"),
                bool("isSample", "Sample placeholder (shows a tag on the site)"),
            ],
        },
    ],
    order: [
        text("title", "Title"),
        area("text", "Intro paragraph"),
        text("submitLabel", "Submit button text"),
        text("successTitle", "Success title"),
        area("successText", "Success message"),
    ],
    faq: [
        text("title", "Title"),
        text("text", "Intro line"),
        {
            key: "items",
            label: "Questions",
            type: "list",
            itemTitle: (item) => item.q,
            newItem: { q: "", a: "" },
            fields: [text("q", "Question"), area("a", "Answer")],
        },
    ],
    products: [
        { type: "note", key: "_note", text: "Shows every active product with a link to its own page. Stays hidden on the site while the shop has only one product." },
        text("title", "Title"),
        area("text", "Intro paragraph"),
    ],
};

// Stock is not here on purpose: it changes only through the Stock panel (and
// orders), so a form left open cannot overwrite sales made meanwhile.
export const productSchema = [
    text("nameBn", "Product name (Bangla)"),
    text("name", "Product name (English)"),
    text("slug", "Web address (slug)", { help: "Lowercase English letters, digits and hyphens. Leave empty to make it from the English name. Changing it breaks old links." }),
    text("netWeight", "Net weight"),
    image("image", "Product image", { kind: "product", help: "A cut-out image with a transparent background works best in the hero." }),
    { key: "gallery", label: "More photos (up to 8, shown on the product page)", type: "images", max: 8, kind: "product" },
    area("shortDescription", "Short description (product cards, max 300)", { rows: 2 }),
    area("description", "Description (product page)", { rows: 6, help: "Plain text. A blank line starts a new paragraph." }),
    num("sortOrder", "Sort order (lower shows first)", { min: -1000 }),
    bool("isActive", "Available for order (unticked = hidden from the site)"),
    {
        key: "variants",
        label: "Packs and prices",
        type: "list",
        help: "A pack is identified by its name. Renaming a pack is fine; past orders keep the old name.",
        itemTitle: (item) => `${item.options?.[0]?.value || "Pack"} (৳${item.price})`,
        newItem: {
            options: [{ name: "প্যাক", value: "" }],
            note: "",
            units: 1,
            price: 0,
            comparePrice: 0,
            freeShipping: false,
            isPopular: false,
        },
        fields: [
            text("options.0.value", "Pack name"),
            num("units", "Jars in this pack (stock used per pack)", { min: 1 }),
            text("note", "Short note"),
            num("price", "Price (BDT)"),
            num("comparePrice", "Regular price (BDT), shown struck through"),
            bool("freeShipping", "Free delivery for this pack"),
            bool("isPopular", "Mark as popular (selected by default)"),
        ],
    },
];

export const siteSchemas = {
    store: [
        text("storeName", "Store name (English)"),
        text("storeNameBn", "Store name (Bangla)"),
        image("logo", "Logo", { kind: "logo" }),
        text("phone", "Phone"),
        text("whatsapp", "WhatsApp number"),
        text("email", "Email"),
        area("address", "Address", { rows: 2 }),
        text("facebook", "Facebook page link (https://...)"),
    ],
    announcement: [bool("announcement.enabled", "Show the top announcement bar"), text("announcement.text", "Text")],
    shipping: [
        {
            key: "shipping",
            label: "Delivery areas",
            type: "list",
            fixed: true,
            itemTitle: (item) => `${item.label} (৳${item.charge})`,
            fields: [text("label", "Label"), num("charge", "Charge (BDT)"), bool("enabled", "Enabled")],
        },
    ],
    privacy: [
        text("legal.privacy.title", "Page title"),
        text("legal.privacy.updated", "Last updated"),
        area("legal.privacy.body", "Text", {
            rows: 16,
            help: 'Blank line between paragraphs. Start a line with "## " for a heading or "- " for a list item.',
        }),
    ],
    terms: [
        text("legal.terms.title", "Page title"),
        text("legal.terms.updated", "Last updated"),
        area("legal.terms.body", "Text", {
            rows: 16,
            help: 'Blank line between paragraphs. Start a line with "## " for a heading or "- " for a list item.',
        }),
    ],
    seo: [
        text("seo.title", "Page title in Google and link previews (max 120)"),
        area("seo.description", "Description in Google and link previews (max 300)", { rows: 2 }),
    ],
    cod: [bool("payment.cod.enabled", "Cash on delivery")],
    bkash: [
        bool("payment.bkash.enabled", "Accept bKash"),
        select("payment.bkash.mode", "How bKash is paid", [
            { value: "manual", label: "Manual: customer sends money and types the TrxID" },
            { value: "gateway", label: "Gateway: bKash payment page (needs bKash keys in the API .env)" },
        ]),
        text("payment.bkash.number", "bKash number (manual mode)"),
        select("payment.bkash.accountType", "Account type", [
            { value: "personal", label: "Personal (customer uses Send Money)" },
            { value: "agent", label: "Agent (customer uses Cash Out)" },
            { value: "merchant", label: "Merchant (customer uses Payment)" },
        ]),
        area("payment.bkash.instructions", "Extra instructions for the customer (optional)", { rows: 2 }),
    ],
    nagad: [
        bool("payment.nagad.enabled", "Accept Nagad (manual: customer sends money and types the TrxID)"),
        text("payment.nagad.number", "Nagad number"),
        select("payment.nagad.accountType", "Account type", [
            { value: "personal", label: "Personal (customer uses Send Money)" },
            { value: "agent", label: "Agent (customer uses Cash Out)" },
            { value: "merchant", label: "Merchant (customer uses Payment)" },
        ]),
        area("payment.nagad.instructions", "Extra instructions for the customer (optional)", { rows: 2 }),
    ],
    online: [
        bool("payment.online.enabled", "Online payment by SSLCommerz (cards, bKash, Nagad, Rocket, banks)"),
        text("payment.online.label", "Name shown to customers"),
    ],
    advance: [
        select("payment.codAdvance", "Cash on delivery orders", [
            { value: "none", label: "Nothing in advance" },
            { value: "delivery", label: "Delivery charge in advance by bKash/Nagad/online (fewer fake orders)" },
        ]),
    ],
    footer: [
        area("footer.about", "About line"),
        area("footer.disclaimer", "Disclaimer"),
        text("footer.copyright", "Copyright line"),
    ],
};
