# Genetic Ayur storefront: working context

Read `AGENTS.md` first (this Next.js version differs from older ones; docs are
in `node_modules/next/dist/docs/`). Project overview and file map: `README.md`.

- Static phase. All data goes through `lib/stores.js` (localStorage). Do not
  read localStorage anywhere else.
- Storefront sections are client components because content can be overridden
  from the dashboard; the server renders `lib/defaults.js`. Anything that
  differs between server and browser (dates, locale formatting, random values)
  must stay out of render. `lib/format.js` groups digits by hand for this reason.
- Dashboard pages render only after hydration (`AdminShell`), so `useDraft`
  can seed forms from the real saved copy.
- Variants have no id; identity is the `options` array (Footpath rule).
- `lib/pricing.js` is a temporary stand-in for the server. Do not add business
  rules there.
- Fonts are self-hosted in `public/fonts`; `@font-face` is in `app/globals.css`.
- Storefront visual language (greens, gold, arch shape, handwritten stickers)
  and dashboard language (plain grey) stay separate.
- Client's copy rule: no dashes or tape graphics in the storefront design.
