// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 🔥 NOVA FUNÇÃO: Busca o role da tabela employees
  const fetchUserRole = async (email: string): Promise<UserRole> => {
    try {
      console.log('🔍 Buscando role para email:', email);
      
      const { data, error } = await supabase
        .from('employees')
        .select('role')
        .eq('email', email)
        .single();

      console.log('📊 Resposta do Supabase:', { data, error });

      if (error || !data) {
        console.error('❌ Erro ao buscar role do usuário:', error);
        return "cleaner"; // fallback
      }

      console.log('✅ Role encontrado:', data.role);
      return data.role as UserRole;
    } catch (err) {
      console.error('❌ Exceção ao buscar role:', err);
      return "cleaner";
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        const supabaseUser = session?.user;
        if (supabaseUser && supabaseUser.email) {
          // 🔥 BUSCA O ROLE DA TABELA EMPLOYEES
          const role = await fetchUserRole(supabaseUser.email);
          
          setUser({
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.name || supabaseUser.email || "Usuário",
            email: supabaseUser.email,
            phone: supabaseUser.user_metadata?.phone || "",
            role: role, // 🔥 USA O ROLE DO BANCO DE DADOS
          });
        } else {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user && session.user.email) {
          // 🔥 BUSCA O ROLE DA TABELA EMPLOYEES
          const role = await fetchUserRole(session.user.email);
          
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email || "Usuário",
            email: session.user.email,
            phone: session.user.user_metadata?.phone || "",
            role: role, // 🔥 USA O ROLE DO BANCO DE DADOS
          });
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.session) {
      throw new Error("Failed to establish session. Please try again.");
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
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
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Fast refresh requires this hook to live alongside the provider; suppressing the lint rule for this export.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
