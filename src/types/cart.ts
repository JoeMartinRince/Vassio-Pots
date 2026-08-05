export interface CartItem {
  code: string;
  name: string;
  img: string;
  price: number;
  mrp: number;
  quantity: number;
  sizeName?: string;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
}
