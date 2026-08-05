import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff";
}

/**
 * Production Supabase Authentication Service for Administrators.
 * Handles sign in, account provisioning, persistent session management, and sign out.
 */
export const authService = {
  /**
   * Get current authenticated session from Supabase Auth.
   */
  async getCurrentSession(): Promise<AdminUser | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user) return null;
      const u = data.session.user;
      return {
        id: u.id,
        email: u.email || "",
        name: u.user_metadata?.name || u.email?.split("@")[0] || "Admin",
        role: (u.user_metadata?.role as "admin" | "staff") || "admin",
      };
    } catch (e) {
      return null;
    }
  },

  /**
   * Authenticate administrator using Supabase Auth.
   * If credentials match an uncreated admin on a fresh Supabase project, provisions the admin account.
   */
  async login(email: string, pass: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    if (!isSupabaseConfigured) {
      return { success: false, error: "Supabase client is not configured." };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      
      // 1. Standard Supabase Sign In with Email & Password
      let { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      // 2. If user account does not exist yet in fresh Supabase Auth, auto-provision first admin account
      if (error && (error.message.includes("Invalid login credentials") || error.message.includes("User not found"))) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: {
            data: {
              name: cleanEmail.split("@")[0],
              role: cleanEmail.includes("staff") ? "staff" : "admin",
            },
          },
        });

        if (!signUpError && signUpData.user) {
          // Re-attempt sign in after provisioning
          const retry = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: pass,
          });

          if (!retry.error && retry.data.user) {
            data = retry.data;
            error = null;
          } else if (signUpData.session?.user) {
            data = { user: signUpData.session.user, session: signUpData.session };
            error = null;
          }
        }
      }

      if (error) {
        return { success: false, error: error.message || "Invalid email or password." };
      }

      if (data?.user) {
        const adminUser: AdminUser = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          name: data.user.user_metadata?.name || cleanEmail.split("@")[0],
          role: (data.user.user_metadata?.role as "admin" | "staff") || (cleanEmail.includes("staff") ? "staff" : "admin"),
        };
        return { success: true, user: adminUser };
      }

      return { success: false, error: "Authentication failed. Please check your credentials." };
    } catch (err: any) {
      return { success: false, error: err?.message || "An unexpected error occurred during authentication." };
    }
  },

  /**
   * Logout administrator from Supabase Auth.
   */
  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("[Vassio Auth] Signout notice:", e);
      }
    }
  },

  /**
   * Listen to real-time authentication state changes.
   */
  onAuthStateChange(callback: (user: AdminUser | null) => void) {
    if (!isSupabaseConfigured) return () => {};

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const adminUser: AdminUser = {
          id: session.user.id,
          email: session.user.email || "admin@vassio.com",
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Admin",
          role: (session.user.user_metadata?.role as "admin" | "staff") || "admin",
        };
        callback(adminUser);
      } else {
        callback(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  },
};

export default authService;
