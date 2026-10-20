# Quartz Times — Watches, Shoes & T-shirts

Quartz Times is a responsive, photography-first catalogue with WhatsApp conversion, inquiry capture, and a protected admin area. It supports watches, shoes, and T-shirts in one product system. It does not implement checkout or payments.

## Catalogue architecture

- **Shared products:** name, brand, category, pricing, publication status, media, tags, and inquiries use the same services and admin screens.
- **Product type:** `watch`, `shoes`, or `tshirt` selects the specification fields. It is independent of admin-managed categories (such as Automatic, Sneakers, or Everyday T-shirts).
- **Specifications:** watches retain their existing technical fields; shoes add upper/sole materials, closure, fit and care; T-shirts add fabric, fit, neckline, sleeve length, pattern and care. Common model, condition and warranty fields remain available.
- **Variants:** optional size/colour combinations have their own SKU and nonnegative integer stock. Footwear sizes include the sizing system, e.g. `UK 8` or `EU 42`. Variant SKUs and size/colour combinations must be unique within a product. All variants share the product price and currency. The server calculates total stock from variants; zero total stock changes an in-stock product to sold out. Stock remains informational; it is not reserved by an inquiry.
- **Compatibility:** existing products without `productType` are watches. No data migration is required. Existing categories and watch specifications are preserved.

`/products` is the shared catalogue; use `?productType=watch`, `?productType=shoes`, or `?productType=tshirt` for departments. Filters support category, brand, watch movement, size, colour, availability, price and sorting. A size and colour must match the same variant; with the in-stock filter that variant must have stock. `/products/[slug]` is the canonical detail route. `/watches` remains a watch-only catalogue, and old `/watches/[slug]` links permanently redirect to the canonical product URL. Phone visitors opening `/` are sent to `/products`, preserving query parameters.

Product pages show appropriate specifications and variant choices. WhatsApp links carry the selected variant SKU, size and colour. Inquiry forms save those selections in the message and SKU; email is optional. The site remains a catalogue with lead capture, with no purchase or payment processing.

## Admin workflow

In **Admin → Categories**, create any needed categories. In **Admin → Products → Add Product**, choose a product type, category, shared details, specifications and optional variants. Add photos/video through the existing Cloudinary media manager. The stock field is calculated when variants exist. Existing products remain editable with no changes to their type.

Signed-in admins can also use **Edit product** on storefront cards and product pages. The modal reuses the full form and refreshes the storefront after saving. Editor-data, mutation and upload endpoints independently authorize admin sessions. Active category links are loaded from the managed category list; category reads never seed missing records. Database reads preserve empty category/product-list results.

The demo dataset includes 15 watches and two clearly marked footwear/clothing examples without photos. Reads never add them to MongoDB. The protected seed endpoint explicitly adds sample data when requested. Replace demo details with real stock and photos before publication. Empty product galleries display a placeholder instead of an unrelated watch photo.

## Stack and verification

Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS, MongoDB/Mongoose, Cloudinary, and signed HTTP-only admin sessions. Node.js 20.9 or newer is required.

```bash
npm install
npm run dev
npm run typecheck
npm run lint
node scripts/test-product-types.mjs
node scripts/test-categories.mjs
node scripts/test-storefront-editor.mjs
node scripts/test-media.mjs
npm run build
```

The product-type regression script checks real Mongoose validation, replacement of an obsolete development schema after hot reload, legacy defaults, protected API mutations, variant validation and totals, partial updates, Mongo/demo filter parity, related products and WhatsApp selections without writing to a database. The build requires a complete production configuration, including a deployed HTTPS site origin.

Product photos support file/browser drops and click-to-upload. Public images are imported through the protected server endpoint. HEIC/HEIF photos require Cloudinary conversion; supported browser formats retain a local demo fallback. Run `node scripts/test-image-drop.mjs` and `node scripts/test-remote-image.mjs` for image parsing and remote-import checks. Demo memory and base64 media are not durable production storage.

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

### Storefront design

Light mode is the default for new visitors, regardless of device theme. Customers can switch to dark mode, and their choice is saved for future visits.

The public experience uses a photography-first white/charcoal design with flat product cards, responsive grids, department shortcuts, and contextual WhatsApp inquiries. The catalogue has a collapsible desktop filter sidebar and a full-screen mobile filter draft applied with **Show results**. Search, navigation, filtering and photo zoom use accessible native dialogs. Product pages provide size/colour selection, expandable details, and an inquiry form; About, Contact, loading, empty and error states share the same design language. Admin navigation and login use matching typography and neutral surfaces.

Run `node scripts/test-catalogue-navigation.mjs` for filter URL and category-navigation regression checks.
