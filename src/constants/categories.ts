import { ROUTES } from "./routes";
import type { Category } from "@/types/category";

export const CATEGORY_LIST: Category[] = [
  {
    id: "frp-pots",
    name: "FRP Pots",
    slug: "frp-pots",
    description: "Lightweight, frost-resistant, and UV-protected fiberglass planters.",
    path: ROUTES.FRP_POTS,
  },
  {
    id: "artificial-plants",
    name: "Artificial Plants",
    slug: "artificial-plants",
    description: "Maintenance-free botanicals with natural wood stems & silk foliage.",
    path: ROUTES.ARTIFICIAL_PLANTS,
  },
  {
    id: "terracotta-pots",
    name: "Terracotta Pots",
    slug: "terracotta-pots",
    description: "Handcrafted earthen clay pots for natural moisture regulation.",
    path: ROUTES.TERRACOTTA_POTS,
  },
  {
    id: "pebbles",
    name: "Pebbles",
    slug: "pebbles",
    description: "Decorative natural river stones & marble chips for landscape accents.",
    path: ROUTES.PEBBLES,
  },
  {
    id: "new-arrivals",
    name: "New Arrivals",
    slug: "new-arrivals",
    description: "Explore our latest handcrafted planter collections and studio additions.",
    path: ROUTES.NEW_ARRIVALS,
  },
];
