// Shopper-facing wording for payment methods and statuses. The API decides
// which methods exist (site.payment.methods) and every amount; this file only
// names them in Bangla.

export const methodLabel = (method, site) =>
    ({
        COD: "ক্যাশ অন ডেলিভারি",
        bKash: "বিকাশ",
        Nagad: "নগদ",
        Online: site?.payment?.online?.label || "কার্ড / মোবাইল ব্যাংকিং",
    })[method] || method;

export const methodHint = (m) => {
    if (m.method === "COD") return "পণ্য হাতে পেয়ে টাকা দিন";
    if (m.method === "Online") return "কার্ড, বিকাশ, নগদ, রকেট বা ব্যাংক";
    if (m.flow === "gateway") return "বিকাশ পেমেন্ট পেজে পরিশোধ করুন";
    return "টাকা পাঠিয়ে TrxID দিন";
};

// The menu item the shopper taps in the wallet app depends on the shop's
// account type.
export const walletAction = (accountType) =>
    ({ personal: "Send Money", agent: "Cash Out", merchant: "Payment" })[accountType] || "Send Money";

export const walletFor = (site, method) => (method === "bKash" ? site?.payment?.bkash : method === "Nagad" ? site?.payment?.nagad : null);

export const ORDER_STATUS_BN = {
    Pending: "অর্ডার গ্রহণ করা হয়েছে",
    Confirmed: "অর্ডার নিশ্চিত হয়েছে",
    Processing: "প্যাক করা হচ্ছে",
    Shipped: "কুরিয়ারে পাঠানো হয়েছে",
    Delivered: "পৌঁছে গেছে",
    Cancelled: "বাতিল হয়েছে",
};

export const PAYMENT_STATUS_BN = {
    Pending: "পেমেন্ট বাকি",
    Verifying: "পেমেন্ট যাচাই করা হচ্ছে",
    "Advance Paid": "অগ্রিম পরিশোধিত",
    Paid: "পরিশোধিত",
    Failed: "পেমেন্ট গ্রহণ করা যায়নি",
    Refunded: "টাকা ফেরত দেওয়া হয়েছে",
};
