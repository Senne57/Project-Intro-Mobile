import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  level: number; // 0.5 tot 7
  phone: string;
  city: string;
  bio: string;
  joinDate: Date;
};

type ProfileContextType = {
  profile: UserProfile | null;
  isRegistered: boolean;
  createProfile: (data: Omit<UserProfile, "id" | "joinDate">) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const defaultProfile: UserProfile = {
  id: "user_" + Math.random().toString(36).substr(2, 9),
  firstName: "",
  lastName: "",
  email: "",
  level: 3.5,
  phone: "",
  city: "",
  bio: "",
  joinDate: new Date(),
};

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const createProfile = (data: Omit<UserProfile, "id" | "joinDate">) => {
    const newProfile: UserProfile = {
      ...defaultProfile,
      ...data,
      joinDate: new Date(),
    };
    setProfile(newProfile);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...data });
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isRegistered: profile !== null,
        createProfile,
        updateProfile,
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