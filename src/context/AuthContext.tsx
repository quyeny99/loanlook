"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type AuthContextType = {
  loginId: string | null;
  isAdmin: boolean;
  currentUser: User | null;
  signOut: () => void;
  signIn: (user: User) => void;
};

const AuthContext = createContext<AuthContextType>({
  loginId: null,
  isAdmin: false,
  currentUser: null,
  signOut: () => {},
  signIn: () => {},
});

type User = {
  id: string;
  username: string;
  fullname: string;
  type__code: string;
  type__name: string;
  is_admin: boolean;
  role: string;
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loginId, setLoginId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    setLoginId(id);

    console.log({ id });

    const userInfoString = localStorage.getItem("userInfo");
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        setCurrentUser(userInfo);
        if (userInfo && userInfo.is_admin) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Failed to parse user info", error);
        setCurrentUser(null);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, []);

  const signOut = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userId");
    localStorage.removeItem("userInfo");
    setCurrentUser(null);
    setIsAdmin(false);
    setLoginId(null);
  };

  const signIn = (user: User) => {
    localStorage.setItem("userInfo", JSON.stringify(user));
    setCurrentUser(user);
    setIsAdmin(user.is_admin);
    setLoginId(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        loginId,
        isAdmin,
        currentUser,
        signOut,
        signIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
