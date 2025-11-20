"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createClient } from "@/utils/supabase/client";

type AuthContextType = {
  loginId: string | null;
  isAdmin: boolean;
  currentProfile: Profile | null;
  signOut: () => void;
  signIn: (userId: string) => void;
  loadUserProfile: (userId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  loginId: null,
  isAdmin: false,
  currentProfile: null,
  signOut: () => {},
  signIn: () => {},
  loadUserProfile: async () => {},
});

type Profile = {
  id: number;
  username: string;
  full_name: string | null;
  role: string;
  created_at?: string;
  updated_at?: string;
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loginId, setLoginId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  const loadUserProfile = async (userId: string) => {
    try {
      const supabase = createClient();

      // Get profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, full_name, role")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error loading profile:", profileError);
        setCurrentProfile(null);
        setIsAdmin(false);
        return;
      }

      if (profile) {
        setCurrentProfile(profile);
        setIsAdmin(profile.role === "admin");
      } else {
        setCurrentProfile(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      setCurrentProfile(null);
      setIsAdmin(false);
    }
  };

  console.log(currentProfile);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) {
      setLoginId(id);
      loadUserProfile(id);
    }
  }, []);

  const signOut = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userId");
    setCurrentProfile(null);
    setIsAdmin(false);
    setLoginId(null);
  };

  const signIn = async (userId: string) => {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userId", userId);
    setLoginId(userId);
    await loadUserProfile(userId);
  };

  return (
    <AuthContext.Provider
      value={{
        loginId,
        isAdmin,
        currentProfile,
        signOut,
        signIn,
        loadUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
