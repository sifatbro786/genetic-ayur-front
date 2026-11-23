# Genetic Ayur storefront

Landing page store for Genetic Ayur (Kasturi Active Power, ready for 15 to 20
products) with its dashboard at `/admin`. Next.js 16 (App Router, Cache
Components), React 19, Tailwind v4. The backend is the Express API in
`genetic-ayur-back` (built on the STR Solutions Footpath pattern).

```bash
npm install
npm run dev      # http://localhost:3000, dashboard at /admin
npm run build
npm run lint
```

## Setup

```bash
cp .env.example .env     # NEXT_PUBLIC_API_URL, REVALIDATE_SECRET (same as the API's)
npm install
npm run dev              # the API must be running (genetic-ayur-back, npm run dev)
```

`next build` prerenders the pages from the API, so the API must be reachable
while building (locally and on Vercel).

Dashboard: `/admin`, log in with the account made by the API's
`npm run admin:create`.

## Where things are

| Path | What |
|---|---|
| `lib/api/storefront.js` | Server read of `/api/storefront`, cached and tagged `storefront` |
| `lib/api/client.js` | Browser `apiFetch` + `ApiError`, `newRequestId()` |
| `lib/admin/api.js` | Dashboard `adminFetch` (JWT), order status flow table |
| `lib/storage.js` | The only localStorage use: guest order tokens, dashboard token |
| `lib/payments.js` | Bangla names for payment methods and statuses |
| `lib/schema.js` | Dashboard form definitions (landing sections, product, settings) |
| `lib/defaults.js` | Built-in copy for the error pages and the API seed. Not read by live pages |
| `app/api/revalidate/route.js` | `POST`, secret header, expires cache tags |
| `app/order/[orderNumber]` | Shopper's order page (status, pay again, resend TrxID) |
| `app/products/[slug]` | Product page (multi-product stores) |
| `components/store/` | Landing page sections, order form, order status |
| `components/admin/` | Dashboard shell, form editor, order detail |
| `app/admin/` | Dashboard pages: overview, orders, products, landing page, settings |
| `app/globals.css` | Fonts and design tokens (`@theme`) |

### Adding an editable landing field

1. Add one line to the section's schema in `lib/schema.js`.
2. Add the same field to `SECTION_SPECS` in the API's `services/landingSchema.js`.
3. Read it in the section component.

## Before going live

The privacy policy and terms are a starting draft written for this shop, not
legal advice. Have the client read them and adjust before launch.

Product facts in the seed content (ingredients, dosage, net weight, prices,
delivery times) are placeholders written for the design demo. Replace them with
the client's real information. The three customer reviews are tagged samples;
replace them with real feedback or hide the section.
