export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  ordersCount?: number;
  totalSpent?: number;
  createdAt: string;
}
