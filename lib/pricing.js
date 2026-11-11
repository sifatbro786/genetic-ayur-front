// STATIC PHASE ONLY.
// The Footpath rule is that money is decided on the server: createOrder
// recomputes everything through pricingService and the UI only displays what
// POST /api/checkout/calculate returns. There is no server yet, so this file
// stands in for that endpoint. When the backend is wired up, delete this
// module and read the same fields from the calculate response. Do not grow
// business rules here.

export function calculateOrder({ product, variantIndex, zoneKey, site }) {
    const variant = product.variants[variantIndex] || product.variants[0];
    const zone = site.shipping.find((z) => z.key === zoneKey && z.enabled);

    const itemsPrice = Number(variant?.price) || 0;
    const shippingPrice = variant?.freeShipping ? 0 : Number(zone?.charge) || 0;

    return {
        variant,
        zone,
        itemsPrice,
        shippingPrice,
        totalPrice: itemsPrice + shippingPrice,
        savings: Math.max(0, (Number(variant?.comparePrice) || 0) - itemsPrice),
    };
}
