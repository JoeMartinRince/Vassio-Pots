/**
 * Formats a numeric price into INR currency string.
 * Example: 4500 -> "₹4,500"
 */
export function formatINR(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Calculates discount percentage rounded to nearest integer.
 * Returns 0 if mrp is missing or <= price.
 */
export function calculateDiscount(price: number, mrp?: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * Converts any string into a URL-friendly slug.
 * Example: "Flax Series Tapered Planters" -> "flax-series-tapered-planters"
 */
export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W_]+(?:-[\s\W_]+)*/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Capitalizes first letter of each word.
 */
export function titleCase(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
