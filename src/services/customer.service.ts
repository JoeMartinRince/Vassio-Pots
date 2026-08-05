import type { Customer } from "@/types/customer";

const CUSTOMERS_KEY = "vassio_customers_v1";

/**
 * Service Layer abstraction for Customer Operations.
 * Prepared for Supabase Database integration.
 */
export const customerService = {
  getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(CUSTOMERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  getCustomerById(id: string): Customer | null {
    const customers = this.getCustomers();
    return customers.find((c) => c.id === id) || null;
  },

  saveCustomer(customer: Customer): Customer {
    const customers = this.getCustomers();
    const existingIndex = customers.findIndex((c) => c.id === customer.id);
    let updated: Customer[];
    if (existingIndex >= 0) {
      updated = [...customers];
      updated[existingIndex] = customer;
    } else {
      updated = [customer, ...customers];
    }
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updated));
    return customer;
  },
};

export default customerService;
