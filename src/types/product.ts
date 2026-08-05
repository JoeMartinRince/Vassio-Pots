// ─── Product & Variant Type Definitions ───────────────────────────────────────
// Single source of truth interfaces for hybrid product architecture

export interface ProductVariant {
  id?: string;
  product_id: string;        // Connects to product code (e.g. 'FLX48')
  variant_name: string;      // Display name e.g. "A", "B", "Flax-D (21")"
  dimensions?: string;       // e.g. "Height: 21\", Top: 8.5\""
  selling_price: number;     // Selling price in ₹
  original_price: number;    // MRP in ₹
  discount_percentage?: number; // Discount %
  stock_quantity: number;    // Units in stock
  available: boolean;        // Whether size can be purchased
  display_order: number;     // Sorting order
}

export interface ProductSizeOption {
  name: string;
  dimensions: string;
  available?: boolean;
}

export interface PairedProduct {
  code: string;
  name: string;
  price: number;
  mrp: number;
  img: string;
}

export interface Product {
  // ── Static fields (from products.ts) ──────────────────────────────────────
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

  // ── Dynamic fields (from Supabase products_dynamic) ───────────────────────
  featured?: boolean;       // featured in Supabase
  newArrival?: boolean;     // new_arrival in Supabase
  active?: boolean;         // active in Supabase
  displayOrder?: number;    // display_order in Supabase

  // ── Base Dynamic Price & Stock (from primary variant or products_dynamic) ─
  price: number;            // Default selling price
  mrp: number;              // Default original price
  discountPercentage?: number;
  stockQuantity?: number;
  isSoldOut?: boolean;

  // ── Dynamic Size Variants (from Supabase product_variants) ───────────────
  variants: ProductVariant[];
}
