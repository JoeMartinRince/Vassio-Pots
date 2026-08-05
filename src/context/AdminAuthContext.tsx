import React, { createContext, useContext, useState, useEffect } from "react";
import authService, { type AdminUser } from "@/services/auth.service";

export type AdminRole = "admin" | "staff";

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  role: AdminRole | null;
  isAdmin: boolean;
  isStaff: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Restore persistent session from Supabase / localStorage on mount
    authService.getCurrentSession().then((sessionUser) => {
      if (sessionUser) {
        setUser(sessionUser);
      } else {
        const saved = localStorage.getItem("vassio_admin_user");
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch (e) {
            localStorage.removeItem("vassio_admin_user");
          }
        }
      }
      setLoading(false);
    });

    // 2. Subscribe to Supabase auth state changes
    const unsubscribe = authService.onAuthStateChange((authUser) => {
      setUser(authUser);
      if (authUser) {
        localStorage.setItem("vassio_admin_user", JSON.stringify(authUser));
      } else {
        localStorage.removeItem("vassio_admin_user");
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await authService.login(email, pass);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem("vassio_admin_user", JSON.stringify(res.user));
    }
    return { success: res.success, error: res.error };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem("vassio_admin_user");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role || null,
        isAdmin: user?.role === "admin",
        isStaff: user?.role === "staff",
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
