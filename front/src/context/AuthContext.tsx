import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type User = {
  _id: string;
  name: string;
  email: string;
  publicKey: string;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  privateKey: string | null;
  isLoading: boolean;
  setAuth: (token: string, user: User, privateKey: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      const savedPrivateKey = localStorage.getItem("privateKey");

      if (savedToken && savedUser && savedPrivateKey) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setPrivateKey(savedPrivateKey);
      }
    } catch (error) {
      console.error("Error loading auth from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setAuth = (newToken: string, newUser: User, newPrivateKey: string) => {
    setToken(newToken);
    setUser(newUser);
    setPrivateKey(newPrivateKey);

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("privateKey", newPrivateKey);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setPrivateKey(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("privateKey");
  };

  const value: AuthContextType = {
    token,
    user,
    privateKey,
    isLoading,
    setAuth,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}


