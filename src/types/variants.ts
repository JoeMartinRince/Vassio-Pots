/**
 * Product Variant Types
 * ─────────────────────────────────────────────────────────────────────────────
 * Designed to be Supabase-ready. Each interface maps cleanly to a DB table row.
 * Future fields (sku, price_adjustment, stock_qty, images) are included as
 * optional so the UI doesn't break when you add them later.
 */

export interface ProductSizeVariant {
  /** Unique identifier within the product: "A", "B", "C", "Small", "Large", etc. */
  id: string;
  /** Display label shown to the customer */
  label: string;
  /** Physical dimension description — e.g. "H: 16\", Top: 10.5\"" */
  dimensions?: string;
  /** Whether this size can currently be selected / purchased */
  available: boolean;
  /** Controls display order (lower = first) */
  displayOrder: number;
  // --- Future fields ---
  priceAdjustment?: number;  // e.g. +500 or -200 relative to base price
  sku?: string;
  stockQty?: number;
}

export interface ProductColorVariant {
  /** Unique identifier: "black", "off-white", etc. (lowercase slug) */
  id: string;
  /** Display name shown to the customer */
  name: string;
  /** CSS hex color for the swatch preview */
  hex: string;
  /** Whether this color can currently be selected / purchased */
  available: boolean;
  /** Controls display order (lower = first) */
  displayOrder: number;
  // --- Future fields ---
  sku?: string;
  stockQty?: number;
  images?: string[];
}

export interface ProductVariants {
  /** Matches the product.code / product_id */
  productCode: string;
  sizes: ProductSizeVariant[];
  colors: ProductColorVariant[];
  /** ISO timestamp of last admin edit */
  updatedAt?: string;
}

// ─── Default variant catalog ──────────────────────────────────────────────────
// These represent the initial variant definitions for every product.
// Admin edits get stored in localStorage (and later Supabase).

export const DEFAULT_SIZE_OPTIONS: ProductSizeVariant[] = [
  { id: "A", label: "A", available: true,  displayOrder: 0 },
  { id: "B", label: "B", available: true,  displayOrder: 1 },
  { id: "C", label: "C", available: true,  displayOrder: 2 },
];

export const DEFAULT_COLOR_OPTIONS: ProductColorVariant[] = [
  { id: "off-white", name: "Off White", hex: "#F5F0E8", available: true,  displayOrder: 0 },
  { id: "black",     name: "Black",     hex: "#1F1F1F", available: true,  displayOrder: 1 },
  { id: "beige",     name: "Beige",     hex: "#D9C6A5", available: true,  displayOrder: 2 },
  { id: "grey",      name: "Grey",      hex: "#8B8B8B", available: true,  displayOrder: 3 },
  { id: "green",     name: "Green",     hex: "#739D30", available: false, displayOrder: 4 },
];
