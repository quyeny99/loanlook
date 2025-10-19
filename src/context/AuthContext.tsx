
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AuthContextType = {
  loginId: string | null;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
  loginId: null,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loginId, setLoginId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    setLoginId(id);

    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        if (userInfo && userInfo.is_admin) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Failed to parse user info", error);
        setIsAdmin(false);
      }
    } else {
        setIsAdmin(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ loginId, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
