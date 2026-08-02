/**
 * Variant Store
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages admin-edited product variant availability.
 * Uses localStorage as the persistence layer now.
 * Future: replace read/write calls with Supabase queries — zero UI changes needed.
 */

import {
  type ProductVariants,
  type ProductSizeVariant,
  type ProductColorVariant,
  DEFAULT_SIZE_OPTIONS,
  DEFAULT_COLOR_OPTIONS,
} from "@/types/variants";

const STORAGE_KEY = "vassio_variants_v1";

// ─── Local persistence helpers ─────────────────────────────────────────────────

function readAllVariants(): Record<string, ProductVariants> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAllVariants(map: Record<string, ProductVariants>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch { /* quota exceeded */ }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the full variant config for a product.
 * If no admin overrides exist yet, returns the default template.
 *
 * Future Supabase replacement:
 *   const { data } = await supabase.from("product_variants").select("*").eq("product_code", code).single();
 *   return data ?? buildDefault(code);
 */
export function getVariants(productCode: string): ProductVariants {
  const all = readAllVariants();
  if (all[productCode]) return all[productCode];
  return buildDefault(productCode);
}

/**
 * Persists updated variants for a product.
 *
 * Future Supabase replacement:
 *   await supabase.from("product_variants").upsert({ product_code: productCode, ...variants });
 */
export function saveVariants(productCode: string, variants: ProductVariants): void {
  const all = readAllVariants();
  all[productCode] = { ...variants, updatedAt: new Date().toISOString() };
  writeAllVariants(all);
}

/**
 * Updates a single size availability for a product.
 */
export function toggleSizeAvailability(productCode: string, sizeId: string, available: boolean): void {
  const variants = getVariants(productCode);
  variants.sizes = variants.sizes.map((s) =>
    s.id === sizeId ? { ...s, available } : s
  );
  saveVariants(productCode, variants);
}

/**
 * Updates a single color availability for a product.
 */
export function toggleColorAvailability(productCode: string, colorId: string, available: boolean): void {
  const variants = getVariants(productCode);
  variants.colors = variants.colors.map((c) =>
    c.id === colorId ? { ...c, available } : c
  );
  saveVariants(productCode, variants);
}

/**
 * Adds a new size variant to a product.
 */
export function addSizeVariant(productCode: string, size: Omit<ProductSizeVariant, "displayOrder">): void {
  const variants = getVariants(productCode);
  const maxOrder = variants.sizes.reduce((m, s) => Math.max(m, s.displayOrder), -1);
  variants.sizes.push({ ...size, displayOrder: maxOrder + 1 });
  saveVariants(productCode, variants);
}

/**
 * Adds a new color variant to a product.
 */
export function addColorVariant(productCode: string, color: Omit<ProductColorVariant, "displayOrder">): void {
  const variants = getVariants(productCode);
  const maxOrder = variants.colors.reduce((m, c) => Math.max(m, c.displayOrder), -1);
  variants.colors.push({ ...color, displayOrder: maxOrder + 1 });
  saveVariants(productCode, variants);
}

/**
 * Removes a size variant by id.
 */
export function removeSizeVariant(productCode: string, sizeId: string): void {
  const variants = getVariants(productCode);
  variants.sizes = variants.sizes.filter((s) => s.id !== sizeId);
  saveVariants(productCode, variants);
}

/**
 * Removes a color variant by id.
 */
export function removeColorVariant(productCode: string, colorId: string): void {
  const variants = getVariants(productCode);
  variants.colors = variants.colors.filter((c) => c.id !== colorId);
  saveVariants(productCode, variants);
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

function buildDefault(productCode: string): ProductVariants {
  return {
    productCode,
    sizes: DEFAULT_SIZE_OPTIONS.map((s) => ({ ...s })),
    colors: DEFAULT_COLOR_OPTIONS.map((c) => ({ ...c })),
  };
}
