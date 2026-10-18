# Quartz Times — Luxury Horology Boutique & Catalogue (V1)

**Quartz Times** is a production-grade, photography-first luxury watch boutique web application engineered for independent watch businesses, horology ateliers, and fine timepiece collectors.

Built with a **WhatsApp-first conversion architecture** that seamlessly guides buyers from discovery to personal horologist advisory.

---

## ✦ Core Features & Architecture

### 1. Photography-First Editorial Design
- Designed specifically around **real watch photography** (black gloved hands, marble flat-lays, wrist profiles, high-magnification macro movement & subdial shots).
- Deep ebony & champagne gold aesthetic tailored for luxury horology connoisseurs.
- Responsive high-resolution gallery with thumbnail switcher, fullscreen zoom lightbox, and product video support.

### 2. WhatsApp Direct Conversion Engine
- Instant **Click-to-Chat** links across cards, catalogue, hero, and product pages.
- Dynamic pre-filled inquiry messages embedding **Watch Name, Brand, Reference/SKU, and Listed Price**.
- Direct contact configuration via `NEXT_PUBLIC_WHATSAPP_NUMBER`.

### 3. Comprehensive Horological Catalogue (`/watches`)
- Real-time server-side database filtering:
  - **Category**: Automatic, Chronograph, Quartz, Dress, Vintage & Heritage, Diver & Tool
  - **Manufacture / Brand**: Rolex, Audemars Piguet, Patek Philippe, Omega, Grand Seiko, Cartier, etc.
  - **Movement Calibre**: Automatic, Manual-Winding, Quartz, Spring Drive, Co-Axial Master Chronometer
  - **Availability**: In Stock, Reserved, Acquired / Sold Out, Bespoke Sourcing
  - **Price Range (INR ₹)** & **Sorting** (Featured, Newest, Price Low/High)
- URL query parameter synchronization (`/watches?category=automatic&sort=price-low`).

### 4. Direct Client Concierge Inquiry System (`/contact` & `/watches/[slug]`)
- Integrated inquiry forms storing client leads directly into MongoDB.
- Instant WhatsApp continuation handoff.

### 5. Protected Director Admin Portal (`/admin`)
- Secure authentication via Jose JWT sessions & HTTP-only cookies.
- **Vault Overview**: Total watches, active inventory, featured curations, unread inquiries.
- **Product Management**: Add, edit, delete watches with full technical specifications (Calibre, Case Material, Strap, Dial, Water Resistance, Case Diameter, Crystal, Power Reserve, Condition, Warranty).
- **Cloudinary Media Manager**: Multi-photo upload, live preview, primary cover selector, photo reordering, and optional product video.
- **Category Taxonomies**: Add, edit, toggle classifications.
- **Client Inquiry Pipeline**: Status tracker (`New` → `Contacted` → `Converted` → `Closed`) with instant one-click WhatsApp reply generator.

### 6. Cloudinary & Media Optimization
- Automatic server-side WebP/AVIF format and quality transformation.
- Compatible with browser-incompatible original formats such as **`.HEIC`** and **`.MOV`**.
- Resilient fallback for immediate local demonstration when cloud credentials are pending.

---

## ✦ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Server Components & Route Handlers) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS (Tailored Luxury Palette & Typography) |
| **Database** | MongoDB Atlas with Mongoose (with in-memory fallback layer) |
| **Media CDN** | Cloudinary Server SDK & Transformation Engine |
| **Authentication** | Jose JWT & Bcrypt password hashing |
| **Icons** | Lucide React |
| **Deployment** | Vercel Ready |

---

## ✦ Environment Configuration

Create a `.env.local` file in the project root:

```env
# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/quartz_times?retryWrites=true&w=majority

# Cloudinary Media Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# WhatsApp Business Communication
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example

# Admin Authentication
ADMIN_EMAIL=your-secure-admin@example.com
ADMIN_PASSWORD=replace-with-your-existing-unique-admin-password
JWT_SECRET=replace-with-at-least-32-random-characters
```

---

## ✦ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build and test production bundle
npm run build
npm run start
```

Before deploying, validate the production environment values:

```bash
npm run check:deploy-env
```

Open [http://localhost:3000](http://localhost:3000) to view the boutique.

---

## ✦ Admin Access

- **URL**: `/admin/login`
- Configure a unique `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the deployment environment.
- Never deploy the example values or commit production credentials.
# Quartz_Times_nextjs
# Customer checkout and Razorpay

Quartz Times supports customer registration/login, seven-day customer sessions, single-watch Buy Now checkout, protected receipts, customer order history, and admin fulfillment tracking. Cart checkout and in-app refunds are not included.

Configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, and a separate `RAZORPAY_WEBHOOK_SECRET` in ignored `.env.local`. Use placeholders only in `.env.example`. The public and server key IDs must match. MongoDB Atlas or another replica set is required for transactions; demo products cannot be purchased.

In the Razorpay dashboard, configure a publicly reachable HTTPS webhook at `/api/checkout/webhook`, subscribe to `payment.captured` and `order.paid`, and enter the same webhook secret. Enable automatic capture. Local testing needs a public HTTPS tunnel to the development server. Browser callback signature verification does not mark an order paid; the receipt waits for the verified webhook and refreshes automatically for two minutes.

Buy Now reserves one watch for 15 minutes. Available stock and exact INR prices are checked on the server, and capture updates the order and stock together. Expired holds are released on the next checkout for that watch. Duplicate webhook deliveries do not decrement stock again. Late payments without available stock appear as captured payments requiring review in admin orders; reconcile/refund those in Razorpay before arranging fulfillment. Ambiguous provider creation failures retain the local order for reconciliation rather than creating duplicate provider orders on retry.

For databases containing the earlier prototype, inspect duplicate `razorpayOrderId`/`razorpayPaymentId` values before replacing their old non-unique indexes with unique sparse indexes. Financial records must not be deleted to resolve an index conflict. New databases create the required indexes automatically.

Validation commands:

```bash
npm run typecheck
npm run lint
npm run test:commerce
node scripts/test-commerce.cjs --integration
npm run build
```

The integration checks create a uniquely named temporary database on the configured MongoDB server and remove that test database afterward. They exercise competing checkouts, idempotent retries, amount tampering, concurrent duplicate capture, replay after shipping, and expired reservations. The production build requires a production HTTPS site URL and all deployment credentials.

Before accepting live payments, complete a test checkout through Razorpay and verify webhook delivery, receipt ownership, customer history, admin visibility, and stock. Refunds/reconciliation remain operator actions in Razorpay. Configure infrastructure-level abuse protection for signup/login and checkout before public launch.

## Payment security and operational checks

The application now permits one active checkout hold per customer across all watches, with at most three unpaid holds per hour. Concurrent attempts are serialized through a customer document write inside the reservation transaction. Reopening checkout reuses an eligible same-watch order instead of allocating another hold; delivery changes on retries produce an explicit conflict. Delivery fields lock once payment preparation succeeds, and a completed browser payment directs the customer to check the saved order rather than immediately paying again.

MongoDB stores shared request budgets with expiry indexes. Login permits 10 attempts per account per 15 minutes and 100 attempts/minute globally per login route; signup permits 30/hour globally; checkout permits 20/customer/15 minutes; inquiries permit 60/minute globally. These conservative defaults suit a small boutique and need capacity review before a larger launch. Global budgets can be exhausted by attackers, so add trusted edge-level IP/bot controls; application limits alone do not defeat distributed abuse. Production fails closed if the budget database is unavailable. Client-supplied forwarding headers do not bypass account/global limits.

Public inquiry input is allowlisted and bounded, optional email is supported, and internal status/notes are server-controlled. Production inquiries are not retained in a process cache; demonstration storage is capped at 100. Payment/authentication JSON is limited to 16 KiB while reading the stream, and signed webhook bodies to 256 KiB. Product JSON-LD escapes HTML-significant input.

Run `node scripts/check-payment-readiness.cjs` for read-only transaction/index/provider-authentication checks. Add `--test-order` to create a labelled INR 1 **Test Mode order only**; the command refuses a live order and never makes a payment. Readiness still requires a public HTTPS `NEXT_PUBLIC_SITE_URL`, correct dashboard capture settings and webhook registration, and an actual successful browser payment with order/stock readback. Localhost is intentionally rejected by `npm run build`. Restart the development server after schema changes.

The commerce suite includes route-level forgery/ownership checks and optional isolated MongoDB transaction tests. Route tests stub Razorpay and sessions and therefore do not establish browser SDK or real webhook transport behavior. Ambiguous provider creation and missed webhook delivery still require operator reconciliation; no automatic refund or captured-payment reconciliation worker is installed.
