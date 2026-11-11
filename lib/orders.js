"use client";

import { ordersStore } from "./stores";

// Same enum as Footpath's Order.orderStatus so the dashboard maps 1:1 later.
export const ORDER_STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

const makeOrderNumber = (now) => {
    const pad = (n) => String(n).padStart(2, "0");
    const date = `${String(now.getFullYear()).slice(2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    // Random, not sequential: the real backend issues sequential numbers
    // behind a guest access token. A demo number only has to look right.
    return `GA${date}${Math.floor(1000 + Math.random() * 9000)}`;
};

// Field names follow the Footpath Order model (orderItems, shippingAddress,
// shippingPrice, totalPrice, orderStatus, statusHistory).
export function placeOrder({ customer, product, totals }) {
    const now = new Date();
    const order = {
        orderNumber: makeOrderNumber(now),
        createdAt: now.toISOString(),
        orderItems: [
            {
                name: product.nameBn,
                variant: { options: totals.variant.options },
                quantity: totals.quantity,
                // Unit price, as in Footpath's orderItemSchema.
                price: totals.variant.price,
                image: product.image,
            },
        ],
        shippingAddress: {
            name: customer.name,
            phone: customer.phone,
            addressLine1: customer.address,
            locationType: totals.zone.key,
            locationLabel: totals.zone.label,
        },
        customerNote: customer.note || "",
        paymentMethod: "COD",
        paymentStatus: "Pending",
        itemsPrice: totals.itemsPrice,
        shippingPrice: totals.shippingPrice,
        totalPrice: totals.totalPrice,
        orderStatus: "Pending",
        statusHistory: [{ status: "Pending", updatedAt: now.toISOString() }],
    };
    const result = ordersStore.set([order, ...ordersStore.get()]);
    return result.ok ? order : null;
}

export function updateOrderStatus(orderNumber, status) {
    const next = ordersStore.get().map((o) =>
        o.orderNumber === orderNumber
            ? {
                  ...o,
                  orderStatus: status,
                  statusHistory: [...o.statusHistory, { status, updatedAt: new Date().toISOString() }],
              }
            : o,
    );
    return ordersStore.set(next);
}

export function deleteOrder(orderNumber) {
    return ordersStore.set(ordersStore.get().filter((o) => o.orderNumber !== orderNumber));
}

// Lets the client see a populated dashboard during the demo without placing
// orders by hand. Names are obvious placeholders, not real people.
export function addSampleOrders(product, site) {
    const statuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Delivered"];
    const now = Date.now();
    const samples = statuses.map((status, i) => {
        const variant = product.variants[i % product.variants.length];
        const zone = site.shipping[i % site.shipping.length];
        const created = new Date(now - (i + 1) * 9 * 3600 * 1000);
        const shippingPrice = variant.freeShipping ? 0 : zone.charge;
        return {
            orderNumber: makeOrderNumber(created),
            createdAt: created.toISOString(),
            orderItems: [
                {
                    name: product.nameBn,
                    variant: { options: variant.options },
                    quantity: 1,
                    price: variant.price,
                    image: product.image,
                },
            ],
            shippingAddress: {
                name: `Sample Customer ${i + 1}`,
                phone: `0170000000${i + 1}`,
                addressLine1: "Sample address, demo data",
                locationType: zone.key,
                locationLabel: zone.label,
            },
            customerNote: "",
            paymentMethod: "COD",
            paymentStatus: status === "Delivered" ? "Paid" : "Pending",
            itemsPrice: variant.price,
            shippingPrice,
            totalPrice: variant.price + shippingPrice,
            orderStatus: status,
            statusHistory: [{ status, updatedAt: created.toISOString() }],
            isSample: true,
        };
    });
    return ordersStore.set([...samples, ...ordersStore.get()]);
}
