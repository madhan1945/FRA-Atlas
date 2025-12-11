import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface AuthContextValue {
  session: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ session: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        // If supabase is not configured, skip gracefully
        if (!supabase || !('auth' in supabase)) {
          if (mounted) setLoading(false);
          return;
        }
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data.session);
        setLoading(false);
      } catch (_err) {
        if (mounted) {
          setSession(null);
          setLoading(false);
        }
      }
    };
    init();

    // Subscribe to auth state changes only if available
    const unsub = (() => {
      try {
        if (supabase && 'auth' in supabase && supabase.auth.onAuthStateChange) {
          const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
          });
          return () => data.subscription.unsubscribe();
        }
      } catch (_e) {}
      return () => {};
    })();

    return () => { mounted = false; unsub(); };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


