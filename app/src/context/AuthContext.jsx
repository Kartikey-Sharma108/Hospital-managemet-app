import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Starting unauthenticated so the landing page shows
  }, []);

  const loginMock = () => {
    setSession({ user: { id: 'mock-user-id', email: 'admin@nexushms.com' } });
    setProfile({ id: 'mock-user-id', role: 'management', email: 'admin@nexushms.com' });
  };

  const signOut = () => {
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, loginMock, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
