// ─── Single Source of Truth Product & Variant Types ──────────────────────────

export interface ProductVariant {
  id?: string;
  product_id: string;        // e.g. 'FLX48'
  variant_name: string;      // e.g. "A", "B", "C", "D", "Standard"
  dimensions?: string;       // e.g. 'Height: 21", Top: 8.5"'
  selling_price: number;     // Price in ₹
  original_price: number;    // MRP in ₹
  discount_percentage?: number;
  stock_quantity: number;    // Units in stock
  available: boolean;        // Whether in stock & purchasable
  sku?: string;              // Stock Keeping Unit identifier (e.g. "SKU-FLX48-A")
  display_order: number;
}

export interface ProductSizeOption {
  name: string;
  dimensions: string;
  available?: boolean;
}

export interface PairedProduct {
  code: string;
  name: string;
  img: string;
}

export interface Product {
  // ── Static metadata (from src/data/products.ts) ───────────────────────────
  id?: string;
  code: string;
  slug?: string;
  name: string;
  img: string;
  thumbnails?: string[];
  color?: string;
  material?: string;
  dimensions?: string;
  insideBox?: string;
  delivery?: string;
  payment?: string;
  description?: string;
  sizes?: ProductSizeOption[];
  pairsWith?: PairedProduct;
  category?: string;
  height?: string;
  createdAt?: string;

  // ── Dynamic product flags (from Supabase products_dynamic) ────────────────
  featured?: boolean;
  newArrival?: boolean;
  active?: boolean;
  displayOrder?: number;

  // ── Primary display price & status (derived from primary variant) ──────────
  price: number;              // Default / primary variant selling price
  mrp: number;                // Default / primary variant MRP
  discountPercentage?: number;
  stockQuantity?: number;
  isSoldOut?: boolean;

  // ── Dynamic size variants (from Supabase product_variants) ────────────────
  variants: ProductVariant[];
}
