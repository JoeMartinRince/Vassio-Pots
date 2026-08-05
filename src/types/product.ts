// ─── Product Type Definitions ─────────────────────────────────────────────────
// Static fields come from src/data/products.ts
// Dynamic fields come from Supabase products_dynamic table

export interface ProductSizeOption {
  name: string;
  price: number;
  mrp: number;
  dimensions: string;
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
  price: number;            // selling_price in Supabase
  mrp: number;              // original_price in Supabase
  discountPercentage?: number;  // discount_percentage in Supabase
  stockQuantity?: number;   // stock_quantity in Supabase
  isSoldOut?: boolean;      // derived from stock_quantity / stock_status
  featured?: boolean;       // featured in Supabase
  newArrival?: boolean;     // new_arrival in Supabase
  active?: boolean;         // active in Supabase
  displayOrder?: number;    // display_order in Supabase
}
