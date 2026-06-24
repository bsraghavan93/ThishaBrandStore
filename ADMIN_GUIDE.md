# Thisha Brand Store — Admin & Feature Guide

---

## Table of Contents

1. [Admin Portal](#1-admin-portal)
   - [Logging In](#11-logging-in)
   - [Adding a Product](#12-adding-a-product)
   - [Product Images](#13-product-images)
   - [Product Variants (Colors & Sizes)](#14-product-variants-colors--sizes)
   - [Editing a Product](#15-editing-a-product)
   - [Managing Stock](#16-managing-stock)
   - [Customer Reviews & Testimonials](#17-customer-reviews--testimonials)
   - [Searching & Filtering Products](#18-searching--filtering-products)
2. [Order Management](#2-order-management)
   - [Viewing Orders](#21-viewing-orders)
   - [Order Stats Dashboard](#22-order-stats-dashboard)
   - [Confirming an Order](#23-confirming-an-order)
   - [Updating Order Status](#24-updating-order-status)
   - [Searching & Filtering Orders](#25-searching--filtering-orders)
3. [Customer-Facing Features](#3-customer-facing-features)
   - [Homepage & Brand Switcher](#31-homepage--brand-switcher)
   - [Product Browsing](#32-product-browsing)
   - [Product Details & Selection](#33-product-details--selection)
   - [Cart System](#34-cart-system)
   - [Checkout & Payment](#35-checkout--payment)
   - [Order Confirmation & WhatsApp](#36-order-confirmation--whatsapp)
   - [Customer Reviews](#37-customer-reviews)
4. [Technical Reference](#4-technical-reference)
   - [Tech Stack](#41-tech-stack)
   - [Supabase Database Tables](#42-supabase-database-tables)
   - [Supabase Storage](#43-supabase-storage)
   - [API Routes](#44-api-routes)
   - [Environment Variables](#45-environment-variables)
   - [Deployment (Vercel)](#46-deployment-vercel)

---

## 1. Admin Portal

### 1.1 Logging In

- Go to **yoursite.com/admin**
- Enter your admin email and password
- These are Supabase Auth credentials — only users added in the Supabase dashboard can log in
- After login you land on the **Admin Dashboard** with two tabs: **Products** and **Orders**

### 1.2 Adding a Product

Click **+ Add Product** to open the product form.

**Required fields:**

| Field | Description |
|-------|-------------|
| **Name** | Product name as shown to customers |
| **Price (₹)** | Price in Indian Rupees (not required for Customer Review items) |
| **Brand** | Select **Organics** or **Trends** — this determines which storefront shows the product |
| **Category** | Select an existing category or choose "New category" to type a custom one |
| **Description** | Detailed product description shown in the product modal |

**Brand-specific fields:**

For **Thisha Trends** (fashion/clothing):
| Field | Options |
|-------|---------|
| **Material / Fabric** | Cotton, Pure Cotton, Silk, Banarasi Silk, Chanderi Silk, Chiffon, Georgette, Crepe, Linen, Polyester, Rayon, Viscose, Net, Velvet, Satin, Organza, Cotton Blend, Silk Blend, Khadi, Muslin, Jacquard, Brocade, Tussar |
| **Fit Type** | Regular Fit, Slim Fit, Relaxed Fit, Oversized, A-Line, Straight, Flared |
| **Care Instructions** | Free text — e.g., "Machine Wash Cold, Dry Clean Only" |

For **Thisha Organics** (skincare/wellness):
| Field | Options |
|-------|---------|
| **Volume / Size** | 5ml, 10ml, 15ml, 30ml, 50ml, 100ml, 150ml, 200ml, 250ml, 500ml, 5g, 10g, 25g, 50g, 100g, 200g, 250g, 500g |
| **Skin Type** | All Skin Types, Normal, Oily, Dry, Combination, Sensitive, Acne-Prone, Mature |
| **Ingredients** | Free text — e.g., "Rosehip Oil, Vitamin C, Hyaluronic Acid" |
| **Usage Instructions** | Free text — e.g., "Apply 2-3 drops to clean skin morning and night" |

### 1.3 Product Images

**How to upload:**
1. In the product form, click **+ Add Images**
2. Select one or more image files (JPG, PNG, WebP, etc.)
3. New images appear with a green "NEW" badge
4. Hover over any image and click **✕** to remove it
5. Images upload to cloud storage when you save the product

**Image recommendations:**
- **Keep file sizes small** — under **500 KB per image** is ideal for fast page loads
- Use **JPG** for photos (best compression) or **WebP** for modern browsers
- Recommended resolution: **800×800px to 1200×1200px** (square or near-square works best)
- Product cards display images as 1:1 (square), product modal as 4:3 on mobile
- The **first image** is used as the main thumbnail across the site
- Upload **2–4 images** per product for the best browsing experience
- Avoid uploading images larger than **2 MB** — they slow down the storefront

**Existing images:** When editing a product, existing images show with a red **✕** to remove. Removed images are permanently deleted from storage.

### 1.4 Product Variants (Colors & Sizes)

**Adding Colors** (Trends brand):
1. Use the color picker to select a hex color
2. Type the color name (e.g., "Blush Pink")
3. Click **Add** or press Enter
4. Added colors appear as pills — click **✕** on a pill to remove it

**Adding Sizes** (Trends brand):
- Click the size buttons to toggle: **XS, S, M, L, XL, XXL, 3XL, Free Size**
- Selected sizes are highlighted; click again to deselect

**How variants work for customers:**
- Customers must select a color and/or size before adding to cart
- Each color/size combination is treated as a unique cart item
- Out-of-stock variants appear grayed out and cannot be selected (see Stock Management below)

### 1.5 Editing a Product

1. In the product table, click the **Edit** button on any product row
2. The form reopens pre-filled with all existing data, images, colors, and sizes
3. Make changes and click **Update Product**
4. Click **Cancel** to discard changes

### 1.6 Managing Stock

**Whole-product stock toggle:**
- Click **Mark OOS** (Out of Stock) on a product row to mark the entire product unavailable
- The product stays visible on the storefront but shows an "Out of Stock" badge and the Add to Cart button is disabled
- Click **Mark In Stock** to make it available again

**Variant-level stock (per size/color):**
1. Click the stock button on a product row to open the **Manage Stock** popup
2. **Sizes:** Click any size to toggle it out of stock (red = OOS, green = in stock)
3. **Colors:** Click any color to toggle it out of stock (grayed = OOS)
4. Click **Save Variant Stock**
5. OOS variants appear strikethrough on the customer site and cannot be selected

The product table shows a count like "2 variants OOS" when individual variants are marked out of stock.

### 1.7 Customer Reviews & Testimonials

There are **two ways** customer reviews appear on the site:

**Method 1 — Customer-Submitted Reviews (Reviews Section):**
- Customers can submit reviews directly on the brand homepage
- Reviews include: name, optional product selection, star rating (1–5), and a comment
- Reviews appear in a grid under "What Our Customers Say" with star ratings
- Admin can moderate by deleting inappropriate reviews from Supabase

**Method 2 — Admin-Created Testimonials (Scrolling Section):**
1. Click **+ Add Product**
2. Set the category to **"Customer Review"**
3. Enter the **customer's name** in the Name field
4. Enter their **testimonial quote** in the Description field
5. Upload the **customer's photo** (optional) as the product image
6. Price is not required for review items
7. These appear in the **horizontal scrolling testimonials** section on the homepage

**Stats:** The dashboard shows a "Testimonials" count tile showing how many Customer Review items exist.

### 1.8 Searching & Filtering Products

- **Brand tabs:** Filter by All, Organics, or Trends
- **Search bar:** Type to search by product name, category, or description — results update live
- **Pagination:** Products are shown 10 per page with Previous/Next navigation
- Changing a filter or search resets to page 1

---

## 2. Order Management

### 2.1 Viewing Orders

Click the **Orders** tab in the admin header. Each order card shows:
- Customer name
- **Order ID** (e.g., TO-260622-A4KX) — TO = Thisha Organics, TT = Thisha Trends
- **Brand badge** (Organics/Trends with brand color)
- **Status badge** (Pending / Confirmed / Shipped / Delivered / Cancelled)
- **Payment badge** (Paid / Unpaid)
- Total amount
- Date and time, item count

**Click an order to expand** and see full details:
- Customer contact info (name, phone, email)
- Delivery address
- Payment status and UPI reference ID (if provided)
- Order notes
- Itemized table with product images, variants, quantities, and subtotals

### 2.2 Order Stats Dashboard

Five stat tiles at the top of the Orders view:

| Tile | What it shows |
|------|---------------|
| **Total Orders** | Count of all orders |
| **Pending** | Orders awaiting confirmation |
| **Paid** | Confirmed-paid orders + total paid revenue (₹) |
| **Unpaid** | Orders without payment + total unpaid revenue (₹) |
| **Total Revenue** | Sum of all active (non-cancelled) orders |

All stats **adapt to the brand filter** — select "Thisha Organics" or "Thisha Trends" to see brand-specific stats.

### 2.3 Confirming an Order

Orders must be **confirmed** before they can be shipped or delivered. This is the most important admin action.

1. Expand an order and click the **Confirmed** status button
2. A popup appears asking for the **UPI Transaction/Ref ID**
3. **If the customer paid:** Enter the UPI reference number → click **"Confirm as Paid"**
   - Order status changes to `confirmed`, payment status changes to `paid`
4. **If payment is pending:** Leave the field blank → click **"Confirm as Unpaid"**
   - Order status changes to `confirmed`, payment stays `unpaid`

The ref ID field is optional but recommended — it helps track which payments are verified.

### 2.4 Updating Order Status

The order status flow is:

```
Pending → Confirmed → Shipped → Delivered
              ↓
          Cancelled (can cancel at any status)
```

**Rules:**
- You **cannot** skip to Shipped or Delivered without confirming first — those buttons are disabled with a tooltip "Confirm the order first"
- Click any status button in the expanded order view to update
- Status colors: Pending (yellow), Confirmed (blue), Shipped (indigo), Delivered (green), Cancelled (red)

### 2.5 Searching & Filtering Orders

- **Brand filter:** All Brands, Thisha Organics, Thisha Trends
- **Status filter:** All, Pending, Confirmed, Shipped, Delivered, Cancelled
- **Search bar:** Search by customer name, phone number, email, or order ID
- **Pagination:** 10 orders per page
- Click **Refresh** to reload orders from the database

---

## 3. Customer-Facing Features

### 3.1 Homepage & Brand Switcher

The landing page at **yoursite.com** shows two brand cards:
- **Thisha Organics** (green) — skincare & wellness
- **Thisha Trends** (burgundy) — fashion & clothing

Each brand has its own homepage with:
- Hero section with CTA buttons (Shop Now, Collections)
- Featured product images from the catalog
- New Arrivals / Bestsellers product grid
- Shop by Collections section (categories with cover images)
- Customer Reviews section (submitted reviews with star ratings)
- Customer Testimonials section (admin-created, horizontal scroll)
- Footer

### 3.2 Product Browsing

The product pages (**/trends/products** and **/organics/products**) include:

- **Category filter pills:** "All" + dynamic categories from your products
- **Search bar:** Instant search by product name, description, or category
- **Sort dropdown:**
  - Newest (default — most recently added first)
  - Popular
  - Price: Low to High
  - Price: High to Low
- **Price range filter:** Expandable panel with a slider to set max price, plus a "Reset All" button
- **Result count:** Shows "12 products" or "3 products matching 'serum'"
- **Pagination:** 12 products per page with numbered page buttons

Products in the **"Customer Review"** category are hidden from product browsing — they only appear in the testimonials section.

### 3.3 Product Details & Selection

Clicking a product opens a **modal popup**:

**On mobile:** Full-screen sheet from the bottom, scrollable, with a sticky "Add to Cart" footer
**On desktop:** Centered two-column card — images left, details right

The modal shows:
- Image gallery with thumbnail navigation
- Product name, category, and price
- Full description
- Brand-specific details (material, fit, ingredients, skin type, etc.)
- **Color swatches** — click to select (OOS colors are grayed out)
- **Size buttons** — click to select (OOS sizes are grayed out)
- **Quantity selector** — minus/plus buttons to order multiple
- **Add to Cart button** — disabled if product is out of stock or a required variant isn't selected

### 3.4 Cart System

**Cart toast notification:**
- When an item is added, a small popup appears near the cart button showing the product image, name, variant, and price
- Auto-dismisses after 3 seconds

**Cart sidebar:**
- Opens from the right side when clicking the cart button
- Shows each item with: thumbnail, name, price, variant info (color/size), quantity adjuster (−/+), and remove button
- Subtotal displayed at the bottom
- "Checkout" button to proceed to payment

### 3.5 Checkout & Payment

The checkout page has three steps:

**Step 1 — Customer Details:**
- Full Name (required)
- Phone Number (required)
- Email (optional)
- City (optional)
- Delivery Address (required)
- Order Notes (optional)
- Order summary sidebar showing all cart items

**Step 2 — Payment Options:**

Two side-by-side cards:

| Pay Now (UPI) | Pay Later |
|---------------|-----------|
| Shows a UPI QR code | "Place your order now and arrange payment later via WhatsApp" |
| Displays the UPI ID for manual entry | No payment details needed |
| "Open UPI App" button (deep link) | |
| Enter UPI Transaction/Ref ID | |
| Click "I've Paid — Place Order" | Click "Pay Later — Place Order" |
| Order marked as **paid** | Order marked as **unpaid** |

**What happens when the order is placed:**
1. Order is saved to the database with a unique Order ID (e.g., TO-260622-A4KX)
2. WhatsApp opens with a pre-filled message containing all order details
3. An email notification is sent to the admin
4. Cart is cleared

### 3.6 Order Confirmation & WhatsApp

After placing an order, the customer sees:
- Success animation with a checkmark
- Their **Order ID** displayed prominently
- Payment status badge: green "Paid" or yellow "Unpaid"
- Message: "We'll call you shortly to confirm your order"
- "Continue Shopping" button

**WhatsApp message** (sent automatically to the store's WhatsApp number) includes:
- Brand name (Thisha Organics / Thisha Trends)
- Order ID
- Payment status (Paid with UPI ref / Payment Pending)
- Customer name, phone, email, address, city
- Itemized list with quantities, variants, and subtotals
- Total amount
- Order notes

### 3.7 Customer Reviews

On each brand homepage, customers can:
1. Click **"Write a Review"**
2. Fill in: their name (required), select a product (optional), star rating (1–5, required), and a comment
3. Submit — the review appears immediately in the reviews grid
4. Reviews show: star rating, comment, reviewer name, product name (if selected), date

---

## 4. Technical Reference

### 4.1 Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (email/password, JWT) |
| **File Storage** | Supabase Storage |
| **Email Notifications** | Resend |
| **Hosting / Deployment** | Vercel |
| **Analytics** | Vercel Web Analytics |

### 4.2 Supabase Database Tables

#### `products`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key, auto-generated |
| `name` | text | Product name |
| `brand` | text | 'organics' or 'trends' |
| `category` | text | Category name (or 'Customer Review' for testimonials) |
| `price` | numeric(10,2) | Price in INR |
| `description` | text | Product description / testimonial text |
| `images` | text[] | Array of image URLs |
| `in_stock` | boolean | Default: true |
| `colors` | jsonb | Array of `{name, hex}` objects |
| `sizes` | text[] | Array of size strings |
| `oos_sizes` | text[] | Out-of-stock sizes |
| `oos_colors` | text[] | Out-of-stock color names |
| `material` | text | Fabric type (Trends) |
| `fit_type` | text | Fit style (Trends) |
| `care_instructions` | text | Care info (Trends) |
| `ingredients` | text | Ingredients list (Organics) |
| `volume` | text | Product volume/weight (Organics) |
| `skin_type` | text | Target skin type (Organics) |
| `usage_instructions` | text | How-to-use (Organics) |
| `created_at` | timestamptz | Auto-set on creation |

**RLS Policies:** Public read access. Only authenticated (admin) users can insert, update, or delete.

#### `orders`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key, auto-generated |
| `order_id` | text | Human-readable ID, e.g., "TO-260622-A4KX" |
| `brand` | text | 'organics' or 'trends' |
| `customer_name` | text | |
| `customer_phone` | text | |
| `customer_email` | text | Optional |
| `address` | text | Delivery address |
| `city` | text | |
| `notes` | text | Order notes from customer |
| `items` | jsonb | Serialized cart items (product details, qty, variants) |
| `total` | numeric(10,2) | Order total in INR |
| `status` | text | 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled' |
| `payment_status` | text | 'paid' or 'unpaid' |
| `upi_ref` | text | UPI transaction reference ID |
| `created_at` | timestamptz | Auto-set on creation |

**RLS Policies:** Anyone can insert (public checkout). Only authenticated (admin) users can read or update.

**Note:** The `order_id`, `brand`, `payment_status`, and `upi_ref` columns were added after initial setup. Run these if not already applied:
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS upi_ref text;
```

#### `reviews`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key, auto-generated |
| `product_id` | uuid | Optional, references products(id) — cascades on delete |
| `brand` | text | 'organics' or 'trends' |
| `reviewer_name` | text | Customer's name |
| `rating` | int | 1 to 5 |
| `comment` | text | Review text |
| `created_at` | timestamptz | Auto-set on creation |

**RLS Policies:** Anyone can read and insert. Only authenticated (admin) users can delete.

### 4.3 Supabase Storage

**Bucket: `product-images`** (public)
- Stores all product images and customer testimonial photos
- Public read access — images served via Supabase CDN
- Authenticated write/delete access
- Files named as `{uuid}.{original-extension}` to avoid collisions
- URL format: `https://<project>.supabase.co/storage/v1/object/public/product-images/<filename>`

### 4.4 API Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/products` | GET | Public | Fetch all products |
| `/api/products` | POST | Admin | Create a new product |
| `/api/products` | PATCH | Admin | Update a product |
| `/api/products?id=` | DELETE | Admin | Delete product + images |
| `/api/orders` | GET | Admin | Fetch all orders |
| `/api/orders` | POST | Public | Place a new order (checkout) |
| `/api/orders` | PATCH | Admin | Update order status/payment |
| `/api/reviews?brand=` | GET | Public | Fetch reviews (optional brand filter) |
| `/api/reviews` | POST | Public | Submit a customer review |

### 4.5 Environment Variables

Set these in Vercel (Settings → Environment Variables) and locally in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
RESEND_API_KEY=re_...
```

| Variable | Where Used | Purpose |
|----------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Public API key for Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Full-access key for admin API routes |
| `RESEND_API_KEY` | Server only | Email delivery (order notifications) |

**Hardcoded configuration:**
- Admin notification email: `bsraghavan93@gmail.com` (in `lib/resend.ts`)
- UPI ID: `adithyarajendran27@okicici` (in `app/checkout/page.tsx`)
- WhatsApp number: `+91 9942384380` (in `app/checkout/page.tsx`)

### 4.6 Deployment (Vercel)

- The site is hosted on **Vercel** and auto-deploys on every push to the main branch
- **Build command:** `next build`
- **Framework:** Next.js (auto-detected)
- Environment variables must be set in **Vercel → Project Settings → Environment Variables**
- **Vercel Web Analytics** is integrated for visitor tracking
- Custom domain can be configured in Vercel → Project Settings → Domains

**To deploy a change:**
1. Push code to the GitHub repository
2. Vercel automatically builds and deploys
3. Check the Vercel dashboard for build status
4. Preview deployments are created for pull requests

---

*Last updated: June 2026*
