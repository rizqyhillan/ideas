import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { authService, UserProfile } from "../services/auth.service";
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
  signIn: (
    identifier: string,
    password: string,
    remember?: boolean,
  ) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<UserProfile | null>(() =>
    getStoredUser<UserProfile>(),
  );
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
        const isLocalStorage = Boolean(
          localStorage.getItem("ideas_access_token"),
        );
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

  async function signIn(
    identifier: string,
    password: string,
    remember = false,
  ) {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    const result = await authService.login(identifier.trim(), password);

    // Login already returns the canonical user resolved by the backend.
    // Avoid a second `/auth/me` request here: it used to create a race with
    // the old token/session and could restore the previous account in state.
    setStoredToken(result.accessToken, remember);
    setStoredUser(result.user, remember);
    setToken(result.accessToken);
    setUser(result.user);
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
      const isLocalStorage = Boolean(
        localStorage.getItem("ideas_access_token"),
      );
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
  const userWithRoles = useMemo(() => {
    const rolesFromRelations =
      context.user?.userRoles2
        ?.map((role) => role.role?.code)
        .filter((code): code is string => Boolean(code)) ||
      [];
    const permissionsFromRelations =
      context.user?.userRoles2
        ?.flatMap(
          (role) =>
            role.role?.rolePermissions?.map((permission) => permission.permission?.code) || [],
        )
        .filter((code): code is string => Boolean(code)) || [];

    return {
      ...context.user,
      roles: [
        ...(context.user?.roles?.map((role) =>
          typeof role === "string" ? role : role.code,
        ) || []),
        ...rolesFromRelations,
      ],
      permissions: [
        ...(context.user?.permissions?.map((permission) =>
          typeof permission === "string" ? permission : permission.code,
        ) || []),
        ...permissionsFromRelations,
      ],
    };
  }, [context.user]);

  const hasPermission = (perm: string): boolean => {
    if (!context.isAuthenticated) return false;
    if (
      userWithRoles.roles?.includes("admin") ||
      userWithRoles.permissions?.includes("*")
    ) {
      return true;
    }
    return Boolean(userWithRoles.permissions?.includes(perm));
  };

  const hasAnyPermission = (...perms: string[]): boolean => {
    if (!context.isAuthenticated) return false;
    if (
      userWithRoles.roles?.includes("admin") ||
      userWithRoles.permissions?.includes("*")
    ) {
      return true;
    }
    return perms.some((p) => userWithRoles.permissions?.includes(p));
  };

  const hasModuleAccess = (module: string): boolean => {
    if (!context.isAuthenticated) return false;
    if (
      userWithRoles.roles?.includes("admin") ||
      userWithRoles.permissions?.includes("*")
    ) {
      return true;
    }
    return Boolean(
      userWithRoles.permissions?.some((p: string) => p.startsWith(`${module}.`)),
    );
  };

  return {
    ...context,
    user: userWithRoles,
    hasPermission,
    hasAnyPermission,
    hasModuleAccess,
  };
}
