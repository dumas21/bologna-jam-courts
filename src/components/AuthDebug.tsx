
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthDebug = () => {
  const [authInfo, setAuthInfo] = useState<any>(null);

  useEffect(() => {
    const getAuthInfo = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      
      setAuthInfo({
        session: session ? 'PRESENTE' : 'ASSENTE',
        user: user ? 'PRESENTE' : 'ASSENTE',
        sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A',
        error: error?.message || 'NESSUNO'
      });
    };

    getAuthInfo();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 AuthDebug - Auth state changed:', event, session?.user?.id);
      getAuthInfo();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!authInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded text-xs max-w-xs">
      <div className="font-bold mb-2">AUTH DEBUG</div>
      <div>Session: {authInfo.session}</div>
      <div>User: {authInfo.user}</div>
      <div>Expires: {authInfo.sessionExpiry}</div>
      <div>Error: {authInfo.error}</div>
    </div>
  );
};

export default AuthDebug;
