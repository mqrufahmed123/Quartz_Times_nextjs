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
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Admin Authentication
ADMIN_EMAIL=admin@quartztimes.com
ADMIN_PASSWORD=QuartzLuxury2025!
JWT_SECRET=super_secret_jwt_key_quartz_times_luxury_horology_2025
AUTH_SECRET=super_secret_auth_secret_session_key_32bytes_long
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

Open [http://localhost:3000](http://localhost:3000) to view the boutique.

---

## ✦ Admin Credentials (Default)

- **URL**: `/admin/login`
- **Email**: `admin@quartztimes.com`
- **Password**: `QuartzLuxury2025!`
# Quartz_Times_nextjs
