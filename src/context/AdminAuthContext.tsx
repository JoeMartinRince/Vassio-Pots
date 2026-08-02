import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type AdminRole = "admin" | "staff";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

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
    // Check local session storage or Supabase session on mount
    const savedUser = localStorage.getItem("vassio_admin_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse stored admin user", e);
      }
    }

    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const authUser: AdminUser = {
            id: session.user.id,
            email: session.user.email || "admin@vassio.com",
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Admin",
            role: (session.user.user_metadata?.role as AdminRole) || "admin",
          };
          setUser(authUser);
          localStorage.setItem("vassio_admin_user", JSON.stringify(authUser));
        }
        setLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const authUser: AdminUser = {
            id: session.user.id,
            email: session.user.email || "admin@vassio.com",
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Admin",
            role: (session.user.user_metadata?.role as AdminRole) || "admin",
          };
          setUser(authUser);
          localStorage.setItem("vassio_admin_user", JSON.stringify(authUser));
        } else {
          setUser(null);
          localStorage.removeItem("vassio_admin_user");
        }
        setLoading(false);
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const loggedUser: AdminUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || email.split("@")[0],
            role: email.includes("staff") ? "staff" : "admin",
          };
          setUser(loggedUser);
          localStorage.setItem("vassio_admin_user", JSON.stringify(loggedUser));
          return { success: true };
        }
      } catch (err: any) {
        console.warn("Supabase auth failed, falling back to local verification:", err);
      }
    }

    // Local / Dev Mode verification fallback
    if (pass === "admin123" || pass === "vassio123" || pass === "admin") {
      const isStaffUser = email.includes("staff");
      const loggedUser: AdminUser = {
        id: isStaffUser ? "staff-001" : "admin-001",
        email: email || (isStaffUser ? "staff@vassio.com" : "admin@vassio.com"),
        name: isStaffUser ? "Staff Operations" : "Master Administrator",
        role: isStaffUser ? "staff" : "admin",
      };
      setUser(loggedUser);
      localStorage.setItem("vassio_admin_user", JSON.stringify(loggedUser));
      return { success: true };
    }

    return { success: false, error: "Invalid credentials. Try admin@vassio.com / admin123 or staff@vassio.com / admin123" };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
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
