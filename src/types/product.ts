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
  id?: string;
  code: string;
  slug?: string;
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
