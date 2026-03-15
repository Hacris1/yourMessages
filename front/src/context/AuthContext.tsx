import React, { createContext, useState, useContext, useEffect } from "react";

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
  setAuth: (token: string, user: User, privateKey: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const savedPrivateKey = localStorage.getItem("privateKey");

    if (savedToken && savedUser && savedPrivateKey) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setPrivateKey(savedPrivateKey);
    }
    setIsLoading(false);
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

  return (
    <AuthContext.Provider value={{ token, user, privateKey, setAuth, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe ser usado dentro de AuthProvider");
  return context;
};


