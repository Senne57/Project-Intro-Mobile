import React, { createContext, useContext, useState, ReactNode } from "react";
import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  level: number;
  phone: string;
  city: string;
  bio: string;
  joinDate: Date;
};

type ProfileContextType = {
  profile: UserProfile | null;
  isRegistered: boolean;
  createProfile: (data: Omit<UserProfile, "id" | "joinDate">) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
  setProfileFromFirebase: (data: any) => void;
  logout: () => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Wordt aangeroepen na login of registratie
  const setProfileFromFirebase = (data: any) => {
    setProfile({
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || "",
      city: data.city || "",
      level: data.level || 3.5,
      bio: data.bio || "",
      joinDate: data.joinDate?.toDate ? data.joinDate.toDate() : new Date(),
    });
  };

  const createProfile = async (data: Omit<UserProfile, "id" | "joinDate">) => {
    console.log("createProfile aangeroepen");
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (profile) setProfile({ ...profile, ...data });
  };

  const logout = () => {
    setProfile(null);
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isRegistered: profile !== null,
        createProfile,
        updateProfile,
        setProfileFromFirebase,
        logout,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within ProfileProvider");
  return context;
};