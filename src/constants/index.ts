// Centralized Application Constants

export const COMPANY_INFO = {
  name: "Vassio",
  legalName: "Vassio Pots & Planters Studio",
  tagline: "Handcrafted Planters & Organic Calm",
  phone: "+91 98765 43210",
  email: "support@vassio.com",
  salesEmail: "sales@vassio.com",
  address: "Vassio Studio, MG Road, Sultanpur, New Delhi, Delhi 110030",
  workingHours: "Mon - Sat: 10:00 AM - 7:00 PM IST",
  shippingPolicy: "Pan-India Delivery (5-7 Working Days)",
  paymentMethod: "100% Secure Online Payment",
};

export interface NavItem {
  label: string;
  path: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "FRP Pots", path: "/frp-pots" },
  { label: "Artificial Plants", path: "/artificial-plants" },
  { label: "Terracotta Pots", path: "/terracotta-pots" },
  { label: "Pebbles", path: "/pebbles" },
  { label: "New Arrivals", path: "/new-arrivals" },
  { label: "Track My Order", path: "/track-order" },
  { label: "Location", path: "/location" },
  { label: "Contact", path: "/contact" },
];

export const CATEGORIES = [
  {
    id: "frp-pots",
    name: "FRP Pots",
    description: "Lightweight, frost-resistant, and UV-protected fiberglass planters.",
    path: "/frp-pots",
  },
  {
    id: "artificial-plants",
    name: "Artificial Plants",
    description: "Maintenance-free botanicals with natural wood stems & silk foliage.",
    path: "/artificial-plants",
  },
  {
    id: "terracotta-pots",
    name: "Terracotta Pots",
    description: "Handcrafted earthen clay pots for natural moisture regulation.",
    path: "/terracotta-pots",
  },
  {
    id: "pebbles",
    name: "Pebbles",
    description: "Decorative natural river stones & marble chips for landscape accents.",
    path: "/pebbles",
  },
  {
    id: "new-arrivals",
    name: "New Arrivals",
    description: "Explore our latest handcrafted planter collections and studio additions.",
    path: "/new-arrivals",
  },
];

export const PLANT_HEIGHT_FILTERS = [
  { id: "all", label: "ALL" },
  { id: "1ft", label: "1 FT" },
  { id: "2ft", label: "2 FT" },
  { id: "3ft", label: "3 FT" },
  { id: "4ft", label: "4 FT" },
  { id: "5ft", label: "5 FT" },
  { id: "6ft+", label: "6 FT+" },
];

export const FRP_COLOR_FILTERS = [
  { id: "all", label: "ALL" },
  { id: "sea green", label: "SEA GREEN" },
  { id: "grey", label: "GREY" },
  { id: "black", label: "BLACK" },
  { id: "sage", label: "SAGE" },
];

export const BRAND_COLORS = {
  primary: "#739D30",
  primaryDark: "#628828",
  darkGreen: "#2F4B2F",
  softSage: "#EEF5E3",
  sageHover: "#E2EDCE",
  white: "#FCFCF8",
};
