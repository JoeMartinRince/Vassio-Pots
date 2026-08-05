// ─── Vassio Product Type Definitions ─────────────────────────────────────────
// Single source of truth for all product interfaces.
//
// Pricing Rule: ALL prices live ONLY in ProductVariant.
// No price/mrp fields on the Product object itself.
// product.price is a DERIVED computed property = cheapest available variant.

// ── Variant (one per size, all prices here) ──────────────────────────────────

export interface ProductVariant {
  id?: string;
  product_id: string;           // FK → product code e.g. 'FLX48'
  variant_name: string;         // e.g. 'A (40")', 'B (33")', 'Standard'
  dimensions?: string;          // e.g. 'Height: 40", Top: 16", Bottom: 12"'
  selling_price: number;        // ₹ selling price — source of truth
  original_price: number;       // ₹ MRP — source of truth
  discount_percentage?: number; // Computed: (mrp - price) / mrp * 100
  stock_quantity: number;       // Units in stock
  available: boolean;           // Purchasable?
  sku?: string;                 // Optional SKU e.g. 'FLX48-A'
  display_order: number;        // Sort order within product
}

// ── Static Size Definition (no prices) ───────────────────────────────────────

export interface ProductSizeOption {
  name: string;        // Display name matching variant_name
  dimensions: string;  // Physical dimensions string
  available?: boolean; // UI hint only, authoritative value is in variant
}

// ── Full Merged Product ───────────────────────────────────────────────────────

export interface Product {
  // ── Static fields (from src/data/products.ts) ──────────────────────────────
  code: string;                  // Primary key e.g. 'FLX48'
  slug?: string;
  name: string;
  img: string;
  thumbnails?: string[];
  color?: string;
  material?: string;
  dimensions?: string;           // Display string only, not authoritative per variant
  insideBox?: string;
  delivery?: string;
  payment?: string;
  description?: string;
  sizes?: ProductSizeOption[];   // Size names + dimensions only. NO prices.
  pairsWith?: { code: string; name: string; img: string }; // NO prices
  category?: string;
  height?: string;
  createdAt?: string;

  // ── Dynamic flags (from Supabase products_dynamic) ─────────────────────────
  featured?: boolean;
  newArrival?: boolean;
  active?: boolean;
  displayOrder?: number;

  // ── Derived from variants (computed, NOT stored) ───────────────────────────
  // These are convenience getters derived from the first available variant.
  // Do NOT use these for display — always select the matched variant instead.
  price: number;            // = variants.find(available).selling_price || 0
  mrp: number;              // = variants.find(available).original_price || 0
  discountPercentage?: number;
  stockQuantity?: number;
  isSoldOut?: boolean;

  // ── Variant array (from Supabase product_variants) ─────────────────────────
  variants: ProductVariant[];
}
