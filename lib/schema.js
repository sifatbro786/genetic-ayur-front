// Form definitions for the dashboard. One schema per editable document or
// landing section; FieldEditor renders them. Adding a field to the storefront
// means: add it to lib/defaults.js, add one line here, read it in the section.

const text = (key, label, extra = {}) => ({ key, label, type: "text", ...extra });
const area = (key, label, extra = {}) => ({ key, label, type: "textarea", ...extra });
const num = (key, label, extra = {}) => ({ key, label, type: "number", ...extra });
const bool = (key, label, extra = {}) => ({ key, label, type: "boolean", ...extra });
const image = (key, label, extra = {}) => ({ key, label, type: "image", ...extra });

export const sectionLabels = {
    hero: "Hero",
    trust: "Trust strip",
    benefits: "Benefits",
    ingredients: "Ingredients",
    usage: "How to use",
    reviews: "Customer reviews",
    order: "Order form",
    faq: "FAQ",
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
            newItem: { name: "", latin: "", text: "", image: "" },
            fields: [
                text("name", "Name"),
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
};

export const productSchema = [
    text("nameBn", "Product name (Bangla)"),
    text("name", "Product name (English)"),
    text("netWeight", "Net weight"),
    image("image", "Product image", { help: "A cut-out image with a transparent background works best in the hero." }),
    num("stock", "Stock"),
    bool("isActive", "Available for order"),
    {
        key: "variants",
        label: "Packs and prices",
        type: "list",
        itemTitle: (item) => `${item.options?.[0]?.value || "Pack"} (৳${item.price})`,
        newItem: {
            options: [{ name: "প্যাক", value: "" }],
            note: "",
            price: 0,
            comparePrice: 0,
            freeShipping: false,
            isPopular: false,
        },
        fields: [
            text("options.0.value", "Pack name"),
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
        image("logo", "Logo"),
        text("phone", "Phone"),
        text("whatsapp", "WhatsApp number"),
        text("email", "Email"),
        area("address", "Address", { rows: 2 }),
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
    footer: [
        area("footer.about", "About line"),
        area("footer.disclaimer", "Disclaimer"),
        text("footer.copyright", "Copyright line"),
    ],
};
