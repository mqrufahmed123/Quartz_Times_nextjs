# Supplier references — 20 October 2026

20 real public supplier listings were saved through the authenticated product and upload APIs: 10 white-label T-shirts from Qikink and 10 unbranded/plain/custom-logo footwear references from Alibaba suppliers.

- At the merchant’s subsequent request, all 20 products are now published (`active`) and marked `in_stock`. The T-shirts and Shoes categories are active and visible.
- Photos are supplier assets stored in Cloudinary. No generated product images or demo products were created.
- Prices are observed supplier quotes in INR, not approved retail prices. Footwear uses the lower quoted bound; the complete range and minimum order are retained in each product's story and the manifest. Qikink quotes include 5% GST and exclude printing and shipping.
- Physical stock quantities remain unconfirmed. Existing positive quantities are preserved; zero quantities are raised to a minimum catalogue quantity of 1 to represent the merchant-requested in-stock status. No new size/colour combinations were invented. The records retain this quantity basis.
- Supplier no-logo options, sizes/colours, physical stock, fulfilment costs and retail prices still require merchant verification. Some custom-logo supplier photos include packaging examples.

`supplier-drafts-2026-10-20.json` records source URLs, quoted terms, saved product IDs and product payloads. `supplier-drafts-2026-10-20-receipts.json` records Cloudinary assets and created product IDs. These are provenance records, not an automatic seed or publishing mechanism.

View the public [catalogue](http://localhost:3000/products) or manage products in [Admin → Products](http://localhost:3000/admin/products).

## Watch addition

10 further unbranded/custom-logo supplier watch listings were imported and published as `active` / `in_stock`, with one catalogue unit each, following the merchant's request. Catalogue prices are ₹500, ₹550, ₹600, ₹650, ₹700, ₹750, ₹800, ₹850, ₹900 and ₹1,000. These are merchant-requested selling prices; they are **separate from supplier quotes**. The original localized INR quote ranges, minimum orders, listing titles, supplier identities and source URLs are retained in `watch-listings-2026-10-20.json`. Physical stock quantities and landed costs remain unverified. Only listed or visibly supported specifications were added; no manufacturer warranty or water-resistance claims were invented. Supplier photos are stored in Cloudinary and the Watches category is active.

`watch-listings-2026-10-20-receipts.json` records the uploaded media and saved product IDs. The original 20 footwear/clothing products were preserved.
