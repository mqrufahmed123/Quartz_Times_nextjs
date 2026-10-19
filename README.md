# Quartz Times — Luxury Horology Boutique & Catalogue (V1)

**Quartz Times** is a production-grade, photography-first luxury watch boutique web application engineered for independent watch businesses, horology ateliers, and fine timepiece collectors.

Built with a **WhatsApp-first conversion architecture** that seamlessly guides buyers from discovery to personal horologist advisory.

Mobile phone visitors open the Shop All catalogue (`/watches`) directly when visiting the homepage. Desktop and tablet visitors retain the editorial homepage. This redirect preserves query parameters and leaves product, contact, and admin links unchanged.

On phones the catalogue uses two compact cards per row so roughly four watches fit on a typical screen. Cards retain the watch title, price, availability and direct WhatsApp action; filtering, sorting and pagination continue to use the existing catalogue flow.

Storefront category links and filters follow active categories from the admin category list. Removed/inactive categories disappear from navigation and their category pages show the not-found view; empty categories do not display sample watches. Product forms use the managed list without hardcoded defaults. Category reads never recreate deleted defaults; use the protected seed endpoint explicitly when sample data is wanted. Run `node scripts/test-categories.mjs` for category regression checks.

After signing in as an admin, use **Edit product** on a storefront card or watch page to edit the full product in a modal without visiting the dashboard. Edit details, prices, stock, currency, tags, specifications, publishing flags, photos/video and photo descriptions, then save to refresh the storefront. Unsaved changes can be discarded; renaming follows the new watch URL and unpublishing returns to the catalogue. Visitors cannot see these controls, and every editor-data/save/upload endpoint independently checks the admin session. Run `node scripts/test-storefront-editor.mjs` for the protected editor and update regression checks.

Product photos support drag and drop from your computer or another browser tab, plus click to browse. Supported formats are JPG, PNG, WebP, GIF, AVIF, HEIC and HEIF, up to 15 MB each. Public image links are downloaded and uploaded through the protected server endpoint, with progress and per-batch errors. If a source website blocks downloads or requires a login, download the photo first and drop the saved file. Save the product after adding photos. Run `node scripts/test-image-drop.mjs`, `node scripts/test-remote-image.mjs`, and `node scripts/test-media.mjs` for drag parsing, safe remote downloads, and upload regression checks.

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
- HEIC/HEIF photos are explicitly converted to JPEG during Cloudinary upload. Existing Cloudinary HEIC photo URLs are delivered as JPEGs on product, category, and hero reads. Without Cloudinary, HEIC upload returns a clear error instead of saving an unrenderable data URL; use JPG/PNG/WebP for local demo uploads. Video uploads retain their existing behavior.
- Resilient fallback for immediate local demonstration when cloud credentials are pending.

Run `node scripts/test-media.mjs` for HEIC upload and delivery regression checks. These checks stub Cloudinary and admin sessions; they verify conversion options and response handling without uploading assets or changing product records.

---

## ✦ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server Components & Route Handlers) |
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
