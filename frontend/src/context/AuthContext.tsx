import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  authService,
  UserProfile,
} from "../services/auth.service";
import {
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
  clearStoredAuth,
} from "../services/api";

type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser<UserProfile>());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    async function initAuth() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.me();
        setUser(currentUser);
        // Persist updated user details
        const isLocalStorage = Boolean(localStorage.getItem("ideas_access_token"));
        setStoredUser(currentUser, isLocalStorage);
      } catch (error) {
        console.error("Auth session expired or invalid:", error);
        clearStoredAuth();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  async function signIn(email: string, password: string, remember = false) {
    const result = await authService.login(email.trim(), password);
    setStoredToken(result.accessToken, remember);
    const currentUser = await authService.me();
    setStoredUser(currentUser, remember);
    setToken(result.accessToken);
    setUser(currentUser);
  }

  function signOut() {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    try {
      const currentUser = await authService.me();
      setUser(currentUser);
      const isLocalStorage = Boolean(localStorage.getItem("ideas_access_token"));
      setStoredUser(currentUser, isLocalStorage);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      signOut();
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  const rolesFromRelations =
    context.user?.userRoles2?.map((r: any) => r.role?.code).filter(Boolean) || [];
  const permissionsFromRelations =
    context.user?.userRoles2
      ?.flatMap((r: any) =>
        r.role?.rolePermissions?.map((rp: any) => rp.permission?.code) || [],
      )
      .filter(Boolean) || [];
  const userWithRoles = {
    ...context.user,
    roles: [
      ...(context.user?.roles?.map((r: any) => r.code || r) || []),
      ...rolesFromRelations,
    ],
    permissions: [
      ...(context.user?.permissions?.map((p: any) => p.code || p) || []),
      ...permissionsFromRelations,
    ],
  };
  return {
    ...context,
    user: userWithRoles,
  };
}
