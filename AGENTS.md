# Quartz Times: AI Project Context

This file is the canonical handoff for AI coding agents working in this repository. Read it before changing code. Verify details against source when a task touches them, and update this file when architecture or product behavior materially changes.

## Product and current scope

Quartz Times is a responsive, photography-first watch catalogue for an Indian luxury/premium watch seller. The public site supports product discovery, server-side filtering, product detail pages, WhatsApp conversion, and inquiry capture. A protected admin area manages watches, categories, media, and inquiry statuses.

This is currently a catalogue plus lead-generation application, not a complete e-commerce system. There is no cart, checkout, customer account, address, order, shipment, inventory reservation, refund, or payment implementation. Product pages currently convert through WhatsApp and an inquiry form.

The next requested product direction is payment integration. Do not add a payment button that trusts a browser-supplied amount. A safe implementation first needs a server-owned order/payment model and must derive amount, currency, product identity, availability, and stock from the database on the server. Provider choice and desired purchase flow (single-watch checkout versus cart; full payment versus deposit/payment link) should be confirmed before committing to a provider-specific design.

## Technology baseline

- Framework: Next.js 16.3.3, App Router, React 19.2.8.
- Language: TypeScript in strict mode, `@/*` maps to `src/*`.
- Runtime target: Node.js 20.9 or newer (`.nvmrc` currently says `20`).
- Styling: Tailwind CSS 3.4, class-based dark mode, custom slate/ebony/amber-gold palette.
- Database: MongoDB through Mongoose 9.
- Authentication: signed HS256 JWTs with `jose`, stored in an HTTP-only admin cookie; bcrypt for persisted admin passwords.
- Media: Cloudinary server SDK; Next Image accepts Cloudinary and Unsplash.
- Icons: Lucide React.
- There is no test framework. Run `node scripts/test-media.mjs` for upload/image-delivery checks and `node scripts/test-storefront-editor.mjs` for protected editor-data and product-update regression checks. Provider/session/service dependencies are stubbed.

Use these commands from the repository root:

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
npm run start
```

`npm run build` first runs `scripts/check-deploy-env.mjs`, so a production build intentionally fails unless every deployment variable is configured. For code-only validation, run typecheck and lint. The build uses Webpack explicitly (`next build --webpack`).

## Source layout and responsibilities

```text
src/app/                 App Router pages, layouts, metadata, and API route handlers
src/components/common/   Shared shell, navigation, theme, buttons, badges, states
src/components/home/     Homepage marketing and collection sections
src/components/catalogue Catalogue filters, cards, grid, load-more behavior
src/components/product/  Gallery, specs, product information, inquiry, related items
src/components/admin/    Admin shell and CRUD interfaces
src/models/              Mongoose schemas
src/services/            Database-first domain/data operations with memory fallback
src/lib/                 MongoDB, auth, Cloudinary, WhatsApp, mock data, utilities
src/types/index.ts        Shared application interfaces and filter/result contracts
scripts/                 Deployment environment validation
```

Keep business/data behavior in `src/services`, persistence schemas in `src/models`, reusable integrations in `src/lib`, and HTTP authorization/validation in route handlers. Client components call the internal API; server pages call services directly.

## Public application flow

- `/`: server-rendered homepage with 60-second ISR. It concurrently loads featured products, active categories, and new arrivals. `src/proxy.ts` redirects mobile phone visitors from `/` to `/watches` before rendering, preserving query parameters. Desktop/tablet visitors and bots keep the homepage; other routes are unaffected. Mobile redirects use private/no-store caching.
- `/watches`: server-rendered catalogue. URL query parameters are the source of truth for filters: `category`, `brand`, `movement`, `availability`, `minPrice`, `maxPrice`, `sort`, and `search`. Phones use a compact two-column grid with 4:3 photos, two-line titles, prices, and per-watch WhatsApp buttons; desktop retains richer cards and a three-column grid. Loading skeletons match the responsive grid. The floating chat widget is hidden on mobile catalogue/category listings to avoid covering card actions.
- `/categories/[slug]`: category-specific catalogue with the same filtering/grid machinery and a fixed category base query.
- `/watches/[slug]`: active product detail with dynamic metadata, canonical/OpenGraph/Twitter data, Product JSON-LD, media gallery, specifications, related products, WhatsApp CTA, and inquiry form.
- `/about` and `/contact`: static marketing/support pages; contact embeds the generic inquiry form.
- `sitemap.xml` includes static routes, active products, and active categories. `robots.txt` disallows `/admin/` and `/api/`.
- The public shell includes announcement bar, responsive navbar/search, footer, floating WhatsApp button, dark/light theme persistence, and a navigation progress indicator. Admin routes bypass this shell.
- Header, mobile navigation, and footer category links share `StorefrontCategoriesProvider`, fetching `/api/categories?active=true` without caching on navigation/focus. They use the real active category names/slugs; no fixed Automatic/Chronograph/Vintage list remains. Desktop shows up to three category links or a Categories menu for longer lists; the drawer is used below the xl breakpoint and mobile/footer expose all active categories. Public filter options also use only active categories. Product forms list admin-managed categories, retaining a clearly marked current value for products still assigned to a removed category.

Catalogue filter options are wrapped in `unstable_cache` for 300 seconds under tag `catalogue-filters`. Category mutations expire this tag immediately and revalidate relevant paths. Product mutations revalidate homepage/catalogue/product paths. Category filtering resolves real category slugs to stored names, with slug aliases retained for older products. Category pages show the not-found view for removed/inactive categories and their filter sidebar correctly switches back to the catalogue when selecting another category or All Watches. The catalogue initially renders 12 products server-side; `ProductGrid` loads more through `/api/products`.

## Admin application flow

- `/admin/login`: client login form.
- The signed-in admin header keeps the storefront link visible on phones as Website and on larger screens as View Website. It opens `/` in a new tab, retaining the admin session for storefront editing; phone visitors follow the existing catalogue redirect.
- `/admin`: dashboard counts, configuration status, and recent inquiries.
- `/admin/products`: list, delete, publish/status updates, and links to edit.
- `/admin/products/new` and `/admin/products/[id]/edit`: full product form and media manager.
- Signed-in admins also see Edit product on storefront cards and watch detail pages. `StorefrontAdminProvider` checks `/api/auth/me` client-side with private/no-store responses, keeping session-dependent controls out of public server-rendered caches. The full form is loaded only when opening a modal and fetches fresh product/categories from the independently protected `/api/admin/products/[id]/editor` endpoint. Cancel/discard stays on the storefront; save refreshes it, follows renamed slugs, and returns hidden products to the catalogue. Modal editing reuses ProductForm; admin dashboard navigation remains its default when no callbacks are provided.
- Media controls are locked during uploads/saves. Card image loading/error state follows the image URL, and product galleries remount when their media changes so replacing photos or removing a video refreshes selection correctly.
- `MediaUploader` has a persistent click/drag/drop photo area. `src/lib/imageDrop.ts` prefers dropped files, otherwise extracts image sources from browser HTML/URI payloads, decodes embedded raster images and same-origin blobs, and unwraps this site's Next image URLs. Each successful upload is kept even if another photo fails. Public HTTP(S) image URLs are imported through the authenticated upload endpoint; blocked/private/authenticated sources show a download-and-upload fallback message.
- `/admin/categories`: category CRUD and active toggles. Cover images support click-to-upload, local file drops, and browser image drops through the existing authenticated upload/import endpoint and `readImageDrop` helper. A single-image preview supports replacement/removal; an optional URL field remains available. Saving and category actions are locked during uploads so late results cannot attach to another category; failed uploads preserve the previous cover.
- `/admin/inquiries`: inquiry pipeline management and WhatsApp follow-up.

Each protected admin page performs a server-side `getAdminSession()` check and redirects when needed. Every mutating API independently checks the session; preserve this defense in depth. The admin layout only decides whether to render `AdminShell`; it is not by itself route protection.

The session cookie is `qt_admin_session`, HTTP-only, SameSite=Lax, secure in production, path `/`, and valid for seven days. Login first compares `ADMIN_EMAIL`/`ADMIN_PASSWORD`, granting `superadmin`, then checks the MongoDB `Admin` collection. `/api/seed` is POST-only and requires a signed-in `superadmin`.

## Data contracts

### Product

`IProduct` and the Mongoose Product schema contain:

- Identity/catalogue: `name`, unique `slug`, `brand`, `category`, unique uppercase `sku`.
- Content: `description`, optional `story`, optional `tags`.
- Commerce-like fields: numeric `price`, optional `originalPrice`, `currency` (normally `INR`), integer-ish `stock`, and `availability` (`in_stock`, `reserved`, `sold_out`, `made_to_order`). These fields currently drive display/filtering only; they do not enforce checkout inventory.
- Merchandising: `featured`, optional `isNewArrival`, and publication `status` (`active`, `draft`, `archived`). Public queries only expose active products.
- Specifications: movement, case/strap material, dial color, water resistance, case diameter, crystal, power reserve, warranty, reference number, and condition.
- Media: image array with URL/public ID/alt/dimensions/primary flag and optional video URL/public ID/thumbnail.
- Timestamps. Services serialize Mongo ObjectIds and dates so objects can cross Server-to-Client boundaries.

### Category

`name`, unique `slug`, `description`, optional `image`, `active`, and timestamps. Product-to-category association is a denormalized category name string, not a MongoDB reference. Renaming/deleting a category does not migrate existing products.

### Inquiry

`name`, `phone`, `email`, optional product name/ID/SKU, `message`, pipeline `status` (`new`, `contacted`, `converted`, `closed`), optional notes, and timestamps. Public POST validation requires name, phone, and message even though the TypeScript/Mongoose contracts currently declare email required; generic forms allow email to be blank, so this contract is inconsistent and should be resolved when working in this area.

### Admin

`email`, `passwordHash`, `name`, role (`admin` or `superadmin`), and timestamps.

No Order, Payment, Customer, Cart, Address, Shipment, WebhookEvent, or idempotency record exists yet.

## API surface

- `GET /api/products`: public paginated/filterable active product list, maximum service page size 50.
- `POST /api/products`: admin-only create.
- `GET /api/products/[id]`: public for active products; admin can read inactive products.
- `GET /api/admin/products/[id]/editor`: admin-only fresh full product/categories for storefront editing, private/no-store on every response.
- `PUT /api/products/[id]`, `DELETE /api/products/[id]`: admin-only.
- `GET /api/categories`: public and returns active and inactive categories by default; `?active=true` returns active categories only. Responses use no-store.
- `POST /api/categories`, `PUT|DELETE /api/categories/[id]`: admin-only.
- `POST /api/inquiries`: public inquiry creation.
- `GET /api/inquiries`, `PUT /api/inquiries/[id]`: admin-only.
- `POST /api/upload`: admin-only multipart upload or JSON `{ imageUrl }` photo import, Node runtime. Images up to 15 MB; videos up to 30 MB; accepted MIME types are defined in the route, including GIF. Remote imports use `src/lib/remoteImage.ts`: checked public DNS pinned to the socket, HTTP(S) standard ports, rechecked redirects (up to three), a 15-second total deadline, bounded streaming, signature-derived raster formats, and no forwarded credentials. Cloudinary upload IDs are unique so browser-supplied filenames cannot overwrite another photo.
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`: admin session lifecycle.
- `POST /api/seed`: superadmin-only idempotent-ish upsert of sample categories/products/inquiries and creation of the configured admin.

Route params and page params/searchParams are Promises because this code targets current Next.js App Router conventions. Keep those signatures when adding dynamic routes.

## Persistence and fallback behavior

The services attempt MongoDB first and fall back to module-level arrays initialized from `src/lib/mockData.ts` when `MONGODB_URI` is absent or reads cannot connect. The mock catalogue contains 15 products plus sample categories and inquiries.

Important distinctions:

- Without `MONGODB_URI`, CRUD affects only process memory and disappears on restart/redeploy.
- Category reads never seed the database. Defaults can be added explicitly through the protected seed endpoint. With MongoDB configured, unavailable category reads return an empty list/null instead of restoring sample categories; successful missing/empty results remain missing/empty.
- When `MONGODB_URI` is configured but unavailable, create/update/delete operations generally throw instead of pretending to persist; reads may still display mock data.
- Uploads use Cloudinary only when all three Cloudinary credentials exist. HEIC/HEIF photos explicitly request JPEG conversion; existing Cloudinary HEIC URLs are normalized to JPEG delivery on product, category, and hero reads without changing the stored originals. Empty/octet-stream MIME types are accepted for HEIC filenames. Without Cloudinary, HEIC returns an actionable error rather than an unrenderable data URL; supported browser formats retain the base64 demo fallback. Do not treat base64 fallback media as durable production storage.
- Successful connected product-list queries preserve empty results, including empty category filters, instead of filling them with sample watches. Other product/detail read fallbacks remain as implemented in their services.

For payment/order work, durable MongoDB must be required. Never create financial records in the in-memory fallback, and never report payment success solely from client redirect/query parameters.

## Environment variables

Never expose or copy values from `.env`. Document and edit placeholders only in `.env.example`.

Required by the current deployment check:

- `MONGODB_URI`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_WHATSAPP_NUMBER` (8-15 digits including country code)
- `NEXT_PUBLIC_SITE_URL` (production HTTPS origin)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `JWT_SECRET` (at least 32 characters)

`JWT_SECRET` has a local-development fallback but is mandatory in production. WhatsApp helpers also have a demo-number fallback. New payment secrets must be server-only; only explicitly publishable provider keys may use `NEXT_PUBLIC_`.

## UI and code conventions

- Visual style: clean luxury retail, high-contrast photography, slate/white light mode, ebony/slate dark mode, amber/gold accents, green only for WhatsApp/success. Inter is body text and Playfair Display is headings.
- Design is mobile-first and responsive. Preserve both themes and accessible focus/disabled/error states.
- Prefer Server Components. Add `'use client'` only for browser state, event handlers, effects, localStorage, or navigation hooks.
- Use `next/image` for remote product/marketing images and maintain useful alt text.
- Reuse `cn`, `formatPrice`, and shared components rather than duplicating style/format logic.
- Currency presentation uses `Intl.NumberFormat`, usually locale `en-IN` and currency `INR`.
- IDs may be Mongo ObjectId strings or mock IDs such as `prod-1`; services deliberately handle both.
- Preserve unrelated worktree changes. At the time this context was created, `package-lock.json` already had an uncommitted modification and was not changed for this documentation task.

## Security and correctness notes

- Do not weaken server-side admin checks because a page appears protected.
- API input validation is currently hand-written and minimal; validate and normalize all new payment/order inputs server-side.
- Login has no rate limiting, lockout, or CSRF token. SameSite=Lax provides partial CSRF protection, but sensitive new flows should receive an explicit threat review.
- Public inquiry submission has no rate limiting, CAPTCHA, or abuse control.
- Product creation still uses truthiness for price. Product updates allowlist editable fields, validate positive prices, nonnegative integer stock, currency and slug, and run Mongoose validators. Zero price is rejected even though the schema permits zero. Empty original price/video are sent as explicit nulls so removal persists. ProductForm exposes stock, currency and tags plus image-alt descriptions; saving is disabled during media uploads. Update invalidation covers old/new slugs, category pages, admin list and catalogue filter options.
- There is no transaction around stock changes and no inventory reservation strategy.
- Cloudinary deletion is not performed when product media or products are removed, so remote assets may remain orphaned.
- JSON-LD maps every non-`in_stock` state to PreOrder and always emits UsedCondition; revisit this if condition/availability accuracy matters.
- The README says Next.js 14 and “V1,” while `package.json` is version 2.0.0 on Next.js 16. Source and package metadata are authoritative.

## Payment integration guardrails and likely shape

When payment work begins, first establish the intended business flow and provider. For an India-first INR store this may be Razorpay or another India-capable gateway; do not assume one silently. A robust minimum design should include:

1. An `Order` record with immutable server-calculated line snapshot(s), customer/contact and shipping data, subtotal/total/currency, lifecycle status, and timestamps.
2. Payment attempt fields or a separate `Payment` record storing provider IDs, amount/currency, status, failure data, and idempotency identifiers. Never store card data.
3. A server endpoint that validates product state/stock, computes the amount from persisted product data, creates the local pending order, then creates the provider order/session.
4. A signed webhook endpoint using the provider's raw-body/signature rules, with replay/idempotency protection. Webhook verification—not the browser callback—is the authority for paid status.
5. Atomic/idempotent order fulfillment and stock decrement after verified payment, including duplicate webhook handling and clear failed/expired/refunded states.
6. A checkout UI that disables unavailable products, communicates totals and errors, and has success/cancel pages that read status from the server.
7. Admin order/payment visibility and operational handling for refunds or reconciliation if those are in scope.
8. Updated `.env.example`, deployment checks, metadata/copy, and tests for amount tampering, invalid signatures, duplicate events, stale stock, and retries.

For high-value one-off watches, decide whether checkout should reserve stock before payment and for how long. A naive pay-then-decrement flow can oversell. Also decide whether “reserved,” “made to order,” and “sold out” items allow deposits/inquiries only.

## Verification and handoff checklist

Before completing a change:

- Run `npm run typecheck`.
- Run `npm run lint`.
- For category changes, run `node scripts/test-categories.mjs` (authoritative category reads, active API options, slug/name matching, empty results and demo CRUD).
- For photo drop/import changes, run `node scripts/test-image-drop.mjs`, `node scripts/test-remote-image.mjs`, and `node scripts/test-media.mjs`.
- Run `npm run build` when deployment variables are available or the task changes build/runtime behavior; explain if the environment check prevents it.
- Exercise affected public and admin paths, including unauthenticated API behavior.
- For schema changes, consider existing MongoDB documents, fallback mock data, serialization, indexes, and seed behavior.
- For catalogue mutations, preserve relevant `revalidatePath`/`revalidateTag` behavior.
- Update `.env.example`, README, and this file when configuration or architecture changes.

