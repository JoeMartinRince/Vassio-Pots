import type { Order, OrderItem } from "@/types/products";

const ORDERS_KEY = "vassio_orders_v1";

/**
 * Service Layer abstraction for Order Processing and Tracking.
 * Backed by localStorage and prepared for Supabase API integration.
 */
export const orderService = {
  getOrders(): Order[] {
    try {
      const data = localStorage.getItem(ORDERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  getOrderById(id: string): Order | null {
    const orders = this.getOrders();
    return orders.find((o) => o.id.toUpperCase() === id.trim().toUpperCase()) || null;
  },

  createOrder(payload: {
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
  }): Order {
    const newOrder: Order = {
      id: `VS-${Math.floor(100000 + Math.random() * 900000)}`,
      ...payload,
      status: "Confirmed",
      trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      createdAt: new Date().toISOString(),
    };

    const currentOrders = this.getOrders();
    const updated = [newOrder, ...currentOrders];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));

    return newOrder;
  },
};

export default orderService;
