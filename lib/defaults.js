// Seed data for the static phase. Three documents, each of which becomes one
// API resource in the backend phase:
//   site    -> store settings + shipping rates   (GET /api/site-settings)
//   product -> the single product                (GET /api/products/:slug)
//   landing -> landing page sections             (GET /api/landing)
// Keep these shapes stable: the storefront and the dashboard both read them,
// and the backend seed will be generated from this file.

const unsplash = (id, w = 900) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

export const defaultSite = {
    storeName: "Genetic Ayur",
    storeNameBn: "জেনেটিক আয়ুর",
    logo: "/images/logo.webp",
    phone: "01903-041454",
    whatsapp: "01903-041454",
    email: "geneticayur@gmail.com",
    address: "বাড়ি #৯৫২, রোড #১৩/৪, বসুন্ধরা রিভারভিউ, দক্ষিণ কেরানীগঞ্জ, ঢাকা।",
    facebook: "",
    announcement: {
        enabled: true,
        text: "সারা দেশে ক্যাশ অন ডেলিভারি। পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।",
    },
    // locationType keys match Footpath's ShippingConfig rate enum.
    shipping: [
        { key: "dhaka_inside", label: "ঢাকা সিটির ভিতরে", charge: 70, enabled: true },
        { key: "dhaka_sub", label: "ঢাকার আশেপাশে", charge: 100, enabled: true },
        { key: "outside_dhaka", label: "ঢাকার বাইরে", charge: 130, enabled: true },
    ],
    footer: {
        about: "জেনেটিক আয়ুর বাছাই করা ভেষজ উপাদান দিয়ে আয়ুর্বেদিক পণ্য তৈরি ও বাজারজাত করে।",
        disclaimer:
            "এই পণ্য কোনো রোগ নির্ণয়, চিকিৎসা বা নিরাময়ের জন্য নয়। গুরুতর অসুস্থতা থাকলে বা নিয়মিত ওষুধ সেবন করলে ব্যবহারের আগে চিকিৎসকের পরামর্শ নিন।",
        copyright: "© ২০২৬ জেনেটিক আয়ুর। সর্বস্বত্ব সংরক্ষিত।",
    },
    seo: {
        title: "কস্তুরী অ্যাক্টিভ পাওয়ার | জেনেটিক আয়ুর",
        description:
            "বাছাই করা ভেষজ উপাদানে তৈরি কস্তুরী অ্যাক্টিভ পাওয়ার। সারা দেশে ক্যাশ অন ডেলিভারি।",
    },
};

export const defaultProduct = {
    name: "Kasturi Active Power",
    nameBn: "কস্তুরী অ্যাক্টিভ পাওয়ার",
    slug: "kasturi-active-power",
    image: "/images/kasturi-jar.webp",
    netWeight: "২০০ গ্রাম",
    stock: 120,
    isActive: true,
    // A variant has no id, same rule as the Footpath base: it is identified
    // only by its options array. Do not add ids here.
    variants: [
        {
            options: [{ name: "প্যাক", value: "১ কৌটা" }],
            note: "প্রায় ১ মাসের জন্য",
            price: 1250,
            comparePrice: 1500,
            freeShipping: false,
            isPopular: false,
        },
        {
            options: [{ name: "প্যাক", value: "২ কৌটা" }],
            note: "প্রায় ২ মাসের জন্য",
            price: 2300,
            comparePrice: 3000,
            freeShipping: false,
            isPopular: true,
        },
        {
            options: [{ name: "প্যাক", value: "৩ কৌটা" }],
            note: "পূর্ণ কোর্স, ডেলিভারি ফ্রি",
            price: 3300,
            comparePrice: 4500,
            freeShipping: true,
            isPopular: false,
        },
    ],
};

export const defaultLanding = {
    // Render order of the page body. Header, footer and the order form's
    // position in this list are all editable from the dashboard.
    order: ["hero", "trust", "benefits", "ingredients", "usage", "reviews", "order", "faq"],
    sections: {
        hero: {
            enabled: true,
            kicker: "জেনেটিক আয়ুরের আয়ুর্বেদিক প্রস্তুতি",
            title: "ভেষজের শক্তিতে ফিরুক প্রতিদিনের উদ্যম",
            text: "কস্তুরী অ্যাক্টিভ পাওয়ার তৈরি হয়েছে এমন সব ভেষজ উপাদানে, যা পুরুষের দৈনন্দিন শক্তি ও সজীবতা ধরে রাখতে আয়ুর্বেদে যুগ যুগ ধরে ব্যবহৃত হয়ে আসছে।",
            primaryCta: "এখনই অর্ডার করুন",
            secondaryCta: "কল করে জানুন",
            notes: ["বাছাই করা ভেষজ", "রাতে এক চামচ", "হাতে পেয়ে মূল্য"],
        },
        trust: {
            enabled: true,
            items: [
                { icon: "cash", title: "ক্যাশ অন ডেলিভারি", text: "পণ্য বুঝে নিয়ে টাকা দিন" },
                { icon: "truck", title: "২ থেকে ৪ দিনে ডেলিভারি", text: "সারা বাংলাদেশে কুরিয়ারে" },
                { icon: "phone", title: "ফোনে পরামর্শ", text: "সকাল ১০টা থেকে রাত ১০টা" },
            ],
        },
        benefits: {
            enabled: true,
            title: "কেন কস্তুরী অ্যাক্টিভ পাওয়ার",
            text: "ব্যস্ত দিন, অনিয়মিত ঘুম আর মানসিক চাপে শরীর ধীরে ধীরে ক্লান্ত হয়ে পড়ে। আয়ুর্বেদ এই ক্লান্তির যত্ন নেয় ভেতর থেকে, ধীরে এবং নিয়মিত।",
            image: unsplash("1759141936083-d10203b4d4f6"),
            handNote: "প্রকৃতি থেকে নেওয়া",
            items: [
                {
                    title: "দিনভর কাজের উদ্যম",
                    text: "অশ্বগন্ধার মতো ভেষজ শরীরের স্বাভাবিক কর্মশক্তি ধরে রাখতে ঐতিহ্যগতভাবে ব্যবহৃত হয়।",
                },
                {
                    title: "ক্লান্তি কাটিয়ে ওঠায় সহায়ক",
                    text: "নিয়মিত সেবনে সারাদিনের অবসাদ কাটিয়ে শরীর ঝরঝরে রাখতে সহায়তা করে।",
                },
                {
                    title: "শরীর ও মনের ভারসাম্য",
                    text: "আয়ুর্বেদিক ভেষজ মানসিক চাপের সময়ে শরীরকে শান্ত ও স্থির রাখতে সহায়ক বলে পরিচিত।",
                },
                {
                    title: "কৃত্রিম উপাদান ছাড়া",
                    text: "ভেষজ উপাদান বেছে, শুকিয়ে ও গুঁড়া করে যত্নের সাথে প্রস্তুত করা হয়।",
                },
            ],
        },
        ingredients: {
            enabled: true,
            title: "কী কী আছে এই কৌটায়",
            text: "প্রতিটি উপাদান আলাদাভাবে বাছাই করা। কোনটি কেন আছে, জেনে নিন।",
            items: [
                {
                    name: "অশ্বগন্ধা",
                    latin: "Withania somnifera",
                    text: "শক্তি ও সহনশীলতার জন্য আয়ুর্বেদের সবচেয়ে পরিচিত মূল।",
                    image: unsplash("1681695752635-d871f185e57a", 600),
                },
                {
                    name: "শিলাজিৎ",
                    latin: "Asphaltum",
                    text: "পাহাড়ি শিলা থেকে পাওয়া খনিজসমৃদ্ধ প্রাকৃতিক উপাদান।",
                    image: unsplash("1764022402353-1c5266df8952", 600),
                },
                {
                    name: "জাফরান",
                    latin: "Crocus sativus",
                    text: "সজীবতা ও মন ভালো রাখতে প্রাচীনকাল থেকে সমাদৃত।",
                    image: unsplash("1656568866961-03e9dcc0fbc6", 600),
                },
                {
                    name: "আরও ভেষজ",
                    latin: "Herbal blend",
                    text: "দারুচিনি, এলাচসহ আরও কিছু পরিচিত ভেষজের মিশ্রণ।",
                    image: unsplash("1723879683308-0c8542c02ee4", 600),
                },
            ],
        },
        usage: {
            enabled: true,
            title: "কীভাবে খাবেন",
            text: "নিয়ম মেনে খেলে ভেষজ সবচেয়ে ভালো কাজ করে। তাড়াহুড়ো নয়, নিয়মিত খান।",
            slipTitle: "সেবনবিধি",
            steps: [
                "প্রতিদিন রাতে খাবারের পর এক চা চামচ",
                "এক গ্লাস কুসুম গরম দুধ বা পানির সাথে",
                "ভালো ফলের জন্য টানা অন্তত ৩০ দিন",
            ],
            signature: "জেনেটিক আয়ুর",
            caution:
                "১৮ বছরের কম বয়সীদের জন্য নয়। ডায়াবেটিস, উচ্চ রক্তচাপ বা অন্য কোনো রোগের ওষুধ চললে আগে চিকিৎসকের পরামর্শ নিন।",
        },
        reviews: {
            enabled: true,
            title: "যাঁরা ব্যবহার করেছেন",
            text: "গ্রাহকদের নিজের ভাষায় অভিজ্ঞতা।",
            // isSample items render with a visible "নমুনা" tag. Replace them with
            // real customer feedback from the dashboard before going live.
            items: [
                { name: "গ্রাহকের নাম", location: "জেলা", text: "এখানে গ্রাহকের আসল মতামত বসবে। ড্যাশবোর্ড থেকে যোগ করুন।", isSample: true },
                { name: "গ্রাহকের নাম", location: "জেলা", text: "এখানে গ্রাহকের আসল মতামত বসবে। ড্যাশবোর্ড থেকে যোগ করুন।", isSample: true },
                { name: "গ্রাহকের নাম", location: "জেলা", text: "এখানে গ্রাহকের আসল মতামত বসবে। ড্যাশবোর্ড থেকে যোগ করুন।", isSample: true },
            ],
        },
        order: {
            enabled: true,
            title: "অর্ডার করুন, টাকা দিন হাতে পেয়ে",
            text: "নিচের ফর্মটি পূরণ করুন। আমাদের প্রতিনিধি ফোন করে অর্ডার নিশ্চিত করবেন।",
            submitLabel: "অর্ডার নিশ্চিত করুন",
            successTitle: "আপনার অর্ডারটি পেয়েছি",
            successText: "খুব শীঘ্রই আমাদের প্রতিনিধি আপনাকে ফোন করে অর্ডার নিশ্চিত করবেন।",
        },
        faq: {
            enabled: true,
            title: "যা জানতে চান",
            text: "আরও কিছু জানার থাকলে সরাসরি ফোন করুন।",
            items: [
                {
                    q: "ডেলিভারি পেতে কত দিন লাগে?",
                    a: "ঢাকার ভিতরে সাধারণত ১ থেকে ২ দিন, ঢাকার বাইরে ২ থেকে ৪ দিন সময় লাগে।",
                },
                {
                    q: "টাকা কীভাবে দিতে হবে?",
                    a: "ক্যাশ অন ডেলিভারি। কুরিয়ার থেকে পণ্য হাতে পেয়ে তারপর মূল্য পরিশোধ করবেন। আগে কোনো টাকা দিতে হবে না।",
                },
                {
                    q: "এক কৌটা কত দিন চলে?",
                    a: "নিয়ম মেনে প্রতিদিন এক চা চামচ করে খেলে এক কৌটা প্রায় এক মাস চলে।",
                },
                {
                    q: "কোনো পার্শ্বপ্রতিক্রিয়া আছে কি?",
                    a: "এটি ভেষজ উপাদানে তৈরি। তবে আপনার কোনো রোগ থাকলে বা নিয়মিত ওষুধ খেলে ব্যবহারের আগে অবশ্যই চিকিৎসকের পরামর্শ নিন।",
                },
                {
                    q: "পণ্য হাতে পেয়ে সমস্যা মনে হলে কী করব?",
                    a: "ডেলিভারির সময় প্যাকেট খুলে দেখে নিন। সিল ভাঙা বা ক্ষতিগ্রস্ত হলে গ্রহণ না করে আমাদের ফোন করুন।",
                },
            ],
        },
    },
};
