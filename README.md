# Genetic Ayur storefront

Single-product landing page for Genetic Ayur (Kasturi Active Power) with a demo
dashboard. Next.js 16 (App Router), React 19, Tailwind v4. Built on the STR
Solutions e-commerce base (Footpath); this repo is the storefront, the backend
stays the Footpath Express API.

```bash
npm install
npm run dev      # http://localhost:3000, dashboard at /admin
npm run build
npm run lint
```

## Current phase: static demo

There is no backend yet. Everything the dashboard saves, and every order placed
from the form, lives in the visitor's own browser (localStorage). Orders do not
reach the shop on their own; the success screen offers a WhatsApp button that
sends the order text to the shop's number.

Dashboard demo login: `admin@geneticayur.com` / `demo1234`. It is a UI demo,
not access control.

## Where things are

| Path | What |
|---|---|
| `lib/defaults.js` | Seed content: site settings, the product, landing sections |
| `lib/stores.js` | localStorage stores and hooks. The only file that knows where data lives |
| `lib/schema.js` | Dashboard form definitions, one per section/document |
| `lib/pricing.js` | Stand-in for `POST /api/checkout/calculate`. Delete in the backend phase |
| `lib/orders.js` | Order create/update, field names follow the Footpath Order model |
| `components/store/` | Landing page sections |
| `components/admin/` | Dashboard shell and the schema-driven form editor |
| `app/admin/` | Dashboard pages |
| `app/globals.css` | Fonts and design tokens (`@theme`) |

### Adding an editable field

1. Add it to the section in `lib/defaults.js`.
2. Add one line to that section's schema in `lib/schema.js`.
3. Read it in the section component.

If the shape of a default document changes, bump `VERSION` in `lib/stores.js`
so old browser copies are ignored.

## Backend phase (after design approval)

- Swap the read/write inside `lib/stores.js` for API calls. Components only use
  the hooks, so they stay as they are.
- Remove `lib/pricing.js`; show the numbers returned by the calculate endpoint.
- Base changes this storefront needs from Footpath: a landing-content resource
  (the base has none), guest orders without an email, and full cash on delivery
  without an upfront gateway payment.
- Replace the demo login with the base JWT auth.
- Move images to uploads/CDN and switch `<img>` to `next/image`.

## Before going live

Product facts in the seed content (ingredients, dosage, net weight, prices,
delivery times) are placeholders written for the design demo. Replace them with
the client's real information. The three customer reviews are tagged samples;
replace them with real feedback or hide the section.
