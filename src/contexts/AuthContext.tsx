// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { supabase } from "@/lib/supabase"; // Importe o cliente Supabase

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  hasPermission: (action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Erro ao buscar usuário Supabase:", error);
        setUser(null);
      } else if (supabaseUser) {
        setUser({
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email || "Usuário",
          email: supabaseUser.email!,
          phone: supabaseUser.user_metadata?.phone || "",
          role: supabaseUser.user_metadata?.role as UserRole || "cleaner", // Cast para UserRole
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email || "Usuário",
            email: session.user.email!,
            phone: session.user.user_metadata?.phone || "",
            role: session.user.user_metadata?.role as UserRole || "cleaner",
          });
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) throw error;
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    });
    setIsLoading(false);
    if (error) throw error;
  };

  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    setIsLoading(false);
    if (error) throw error;
  };

  const hasPermission = (action: string) => {
    if (!user) return false;
    if (user.role === "manager") return true;
    if (user.role === "cleaner") {
      return action.startsWith("view");
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};