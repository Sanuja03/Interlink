import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const InterviewerProfileContext = createContext(null);

export const InterviewerProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: null,
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/interviewer/profile");
      setProfile({
        name: res.data.fullName || "",
        email: res.data.email || "",
        avatar: res.data.photoUrl || null,
      });
    } catch (err) {
      console.error("Failed to load interviewer profile:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <InterviewerProfileContext.Provider value={{ profile, fetchProfile }}>
      {children}
    </InterviewerProfileContext.Provider>
  );
};

export const useInterviewerProfile = () => useContext(InterviewerProfileContext);