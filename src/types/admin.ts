export interface AdminProduct {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  mrp: number;
  sale_price: number;
  images: string[];
  materials?: string[];
  care_instructions?: string;
  colors?: string[];
  features?: string[];
  in_stock: boolean;
  stock_count: number;
  category_id?: string;
  rating_avg?: number;
  review_count?: number;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
}
