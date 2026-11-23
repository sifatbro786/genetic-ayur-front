# Genetic Ayur storefront: working context

Read `AGENTS.md` first (this Next.js version differs from older ones; docs are
in `node_modules/next/dist/docs/`). Project overview and file map: `README.md`.
Status, phase plan and go-live steps: `../genetic-ayur-back/HANDOVER.md`.
API contract: `../genetic-ayur-back/README.md`.

- All store data comes from the Express API. Server pages read it through
  `lib/api/storefront.js` (`getStorefront()`: `"use cache"`, tag
  `storefront`, 5 minute safety revalidate). The API expires the tag through
  `POST /api/revalidate` after dashboard saves and stock changes.
- Browser calls go through `lib/api/client.js` (`apiFetch`, `ApiError`);
  dashboard calls through `lib/admin/api.js` (`adminFetch`, adds the JWT, a
  401 logs out).
- localStorage is touched only in `lib/storage.js`: guest order tokens and the
  dashboard token. Never store content there.
- Money is decided by the API. The order form shows only what
  `POST /api/checkout/calculate` returns; never compute totals, delivery or
  pay-now amounts here.
- Variants have no id; identity is the `options` array, sent back to the API
  exactly as received (Footpath rule).
- Order form: `clientRequestId` per attempt, hidden `website` honeypot, save
  the guest token BEFORE following `nextAction.url` to a gateway.
- Landing sections are server components; only `OrderSection`, `MobileBar`,
  `Photo` and the order page are client components. Anything that differs
  between server and browser (dates, locale formatting, random values) stays
  out of server render. `lib/format.js` groups digits by hand for this reason.
- A new landing section field: one line in `lib/schema.js`, the same field in
  the API's `services/landingSchema.js` (unknown keys are dropped there), then
  read it in the section component.
- With Cache Components, any client component that reads the URL
  (`usePathname`, `useSearchParams`, `useParams`) must sit under a
  `<Suspense>`; the admin layout and the order page already have one.
- Fonts are self-hosted in `public/fonts`; `@font-face` is in `app/globals.css`.
- Storefront visual language (greens, gold, arch shape, handwritten stickers)
  and dashboard language (plain grey) stay separate.
- Client's copy rule: no dashes or tape graphics in the storefront design.
