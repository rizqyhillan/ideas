import { createContext, useContext, useState, type ReactNode } from "react";

type AuthContextValue = {
  isAuthenticated: boolean;
  signIn: (email: string, password: string, remember: boolean) => boolean;
  signOut: () => void;
};

const SESSION_KEY = "ideas-demo-session";
const DEMO_EMAIL = "admin@ideas.id";
const DEMO_PASSWORD = "admin123";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true" || localStorage.getItem(SESSION_KEY) === "true",
  );

  function signIn(email: string, password: string, remember: boolean) {
    const valid = email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
    if (!valid) return false;

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(SESSION_KEY, "true");
    setIsAuthenticated(true);
    return true;
  }

  function signOut() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }

  return <AuthContext.Provider value={{ isAuthenticated, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
