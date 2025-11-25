// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { User, UserRole } from "@/types";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRoleLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPABASE_TIMEOUT_MS = 15000;
const USER_CACHE_KEY = "app.auth.cachedUser";

const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;

const loadCachedUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch (error) {
    console.warn("Não foi possível restaurar o usuário em cache:", error);
    return null;
  }
};

const persistUser = (value: User | null) => {
  if (typeof window === "undefined") return;
  if (!value) {
    window.sessionStorage.removeItem(USER_CACHE_KEY);
    return;
  }
  window.sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(value));
};

const withTimeout = async <T,>(promise: Promise<T>, timeoutMessage: string, timeoutMs = SUPABASE_TIMEOUT_MS) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const normalizeAuthError = (error: unknown): Error => {
  if (error instanceof Error) {
    if (error.message.includes("fetch failed") || error.message.includes("Failed to fetch")) {
      return new Error("Não foi possível conectar ao servidor de autenticação. Verifique sua conexão e tente novamente.");
    }
    if (error.message.includes("timeout")) {
      return new Error(error.message);
    }
    return error;
  }
  return new Error("Não foi possível autenticar. Tente novamente em instantes.");
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cachedUserRef = useRef<User | null>(loadCachedUser());
  const [user, setUserState] = useState<User | null>(cachedUserRef.current);
  const [isLoading, setIsLoading] = useState<boolean>(() => cachedUserRef.current === null);
  const [isRoleLoading, setIsRoleLoading] = useState<boolean>(false);

  const setUser = useCallback(
    (value: User | null | ((prev: User | null) => User | null)) => {
      setUserState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        persistUser(next);
        cachedUserRef.current = next;
        return next;
      });
    },
    []
  );

  // 🔥 NOVA FUNÇÃO: Busca o role da tabela employees
  const fetchUserRole = async (email: string): Promise<UserRole> => {
    try {
      console.log('🔍 Buscando role para email:', email);
      if (isOffline()) {
        throw new Error("Sem conexão para buscar as permissões do usuário.");
      }

      const { data, error } = await withTimeout(
        supabase
          .from('employees')
          .select('role')
          .eq('email', email)
          .single(),
        "Tempo esgotado ao consultar permissões do usuário."
      );

      console.log('📊 Resposta do Supabase:', { data, error });

      if (error || !data) {
        console.warn('⚠️ Erro ao buscar role do usuário, usando fallback:', error);
        return "cleaner"; // fallback
      }

      console.log('✅ Role encontrado:', data.role);
      return data.role as UserRole;
    } catch (err) {
      console.warn('⚠️ Exceção ao buscar role, usando fallback:', err);
      return "cleaner";
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading((current) => current || !cachedUserRef.current);
      try {
        if (isOffline()) {
          throw new Error("Sem conexão com a internet. Reconecte-se para continuar.");
        }

        const { data: { session }, error } = await withTimeout(
          supabase.auth.getSession(),
          "Tempo esgotado ao validar a sessão do usuário."
        );
        if (error) {
          throw error;
        }

        const supabaseUser = session?.user;
        if (supabaseUser && supabaseUser.email) {
          const fallbackRole: UserRole =
            cachedUserRef.current?.email === supabaseUser.email
              ? cachedUserRef.current.role
              : "cleaner";

          const baseUser: User = {
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.name || supabaseUser.email || "Usuário",
            email: supabaseUser.email,
            phone: supabaseUser.user_metadata?.phone || "",
            role: fallbackRole,
          };

          setIsLoading(true);
          setIsRoleLoading(true);
          setUser(baseUser);
          try {
            const role = await fetchUserRole(supabaseUser.email);
            setUser((prev) => {
              if (!prev || prev.email !== supabaseUser.email) return prev;
              if (prev.role === role) return prev;
              return {
                ...prev,
                role,
              };
            });
          } finally {
            setIsRoleLoading(false);
            setIsLoading(false);
          }
        } else {
          setUser(null);
          setIsLoading(false);
          setIsRoleLoading(false);
        }
      } catch (error) {
        console.error("Erro ao recuperar sessão do usuário:", error);
        setUser(null);
        setIsLoading(false);
        setIsRoleLoading(false);
      }
    };

    void fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user && session.user.email) {
        const supabaseUser = session.user;
        const shouldBlockUi = event === "SIGNED_IN";
        const baseUser: User = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email || "Usuário",
          email: supabaseUser.email,
          phone: supabaseUser.user_metadata?.phone || "",
          role:
            cachedUserRef.current?.email === supabaseUser.email
              ? cachedUserRef.current.role
              : "cleaner",
        };

        if (shouldBlockUi) {
          setIsLoading(true);
        }
        setIsRoleLoading(true);
        setUser((prev) => {
          if (prev && prev.email === supabaseUser.email) {
            return prev;
          }
          return baseUser;
        });

        void (async () => {
          try {
            const role = await fetchUserRole(supabaseUser.email!);
            setUser((prev) => {
              if (!prev || prev.email !== supabaseUser.email) return prev;
              if (prev.role === role) return prev;
              return { ...prev, role };
            });
          } catch (error) {
            console.warn("Não foi possível atualizar role após mudança de sessão:", error);
          } finally {
            setIsRoleLoading(false);
            if (shouldBlockUi) {
              setIsLoading(false);
            }
          }
        })();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setIsLoading(false);
        setIsRoleLoading(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (isOffline()) {
        throw new Error("Você está offline. Conecte-se à internet para fazer login.");
      }

      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        "Tempo esgotado ao tentar realizar login. Verifique sua conexão."
      );

      if (error) throw error;
      if (!data.session) {
        throw new Error("Não foi possível estabelecer a sessão. Tente novamente.");
      }
    } catch (error) {
      throw normalizeAuthError(error);
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
        isRoleLoading,
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
