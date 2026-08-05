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
  code: string;
  name: string;
  price: number;
  mrp: number;
  img: string;
  thumbnails?: string[];
  color?: string;
  material?: string;
  dimensions?: string;
  insideBox?: string;
  delivery?: string;
  payment?: string;
  description?: string;
  isSoldOut?: boolean;
  sizes?: ProductSizeOption[];
  pairsWith?: PairedProduct;
  category?: string;
  height?: string;
  createdAt?: string;
}

export interface CartItem {
  code: string;
  name: string;
  img: string;
  price: number;
  mrp: number;
  quantity: number;
  sizeName?: string;
}

export interface WishlistItem {
  code: string;
  name: string;
  img: string;
  price: number;
  mrp: number;
  addedAt: string;
}

export interface OrderItem {
  code: string;
  name: string;
  price: number;
  quantity: number;
  sizeName?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  trackingNumber?: string;
  createdAt: string;
}
