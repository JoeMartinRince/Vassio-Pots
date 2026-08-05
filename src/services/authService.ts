export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

const CUSTOMER_SESSION_KEY = "vassio_customer_session";

/**
 * Service Layer abstraction for Customer Authentication.
 * Prepared for Supabase Auth integration.
 */
export const authService = {
  getCurrentUser(): CustomerUser | null {
    try {
      const data = localStorage.getItem(CUSTOMER_SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user: CustomerUser | null): void {
    if (user) {
      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CUSTOMER_SESSION_KEY);
    }
  },

  logout(): void {
    localStorage.removeItem(CUSTOMER_SESSION_KEY);
  },
};

export default authService;
