import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function SimpleAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [debug, setDebug] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('🔍 SimpleAuth - Controllo URL per token');
    console.log('🔍 URL completa:', window.location.href);
    console.log('🔍 Hash:', window.location.hash);
    console.log('🔍 Search:', window.location.search);
    
    // Prova prima con query parameters (?)
    const urlParams = new URLSearchParams(window.location.search);
    let accessToken = urlParams.get('access_token');
    let refreshToken = urlParams.get('refresh_token');
    
    // Se non ci sono, prova con hash (#)
    if (!accessToken) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      accessToken = hashParams.get('access_token');
      refreshToken = hashParams.get('refresh_token');
    }

    console.log('🔐 Token trovati:', { accessToken: !!accessToken, refreshToken: !!refreshToken });

    if (accessToken && refreshToken) {
      console.log('📝 Impostazione sessione...');
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ data, error }) => {
        console.log('✅ Risultato setSession:', { data: !!data.session, error });
        setDebug({ setSession: { data, error } });
        if (!error && data.session) {
          setUser(data.session.user);
          setView('dashboard');
          setMessage('✅ Login completato con successo!');
          // Pulisci URL
          window.history.replaceState({}, document.title, "/");
        } else {
          setMessage('❌ Errore durante la conferma: ' + (error?.message || 'Sconosciuto'));
        }
      });
    } else {
      // Controlla se c'è già una sessione
      supabase.auth.getUser().then(({ data: { user } }) => {
        console.log('👤 Utente esistente:', !!user);
        setUser(user);
        if (user) setView('dashboard');
      });
    }
  }, []);

  const handleSignUp = async () => {
    setLoading(true);
    setMessage('');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth-simple`
      }
    });
    
    console.log('📧 Risultato signUp:', { data, error });
    setDebug({ signUp: { data, error } });
    
    if (error) {
      setMessage('❌ Errore registrazione: ' + error.message);
    } else {
      setMessage('📧 Controlla la tua email per confermare l\'account!');
    }
    setLoading(false);
  };

  const handleSignIn = async () => {
    setLoading(true);
    setMessage('');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    console.log('🔑 Risultato signIn:', { data, error });
    setDebug({ signIn: { data, error } });
    
    if (error) {
      setMessage('❌ Errore login: ' + error.message);
    } else {
      setUser(data.user);
      setView('dashboard');
      setMessage('✅ Login completato!');
    }
    setLoading(false);
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('login');
    setMessage('👋 Logout completato');
    setDebug({});
  };

  if (view === 'dashboard') {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#f0f8ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h1>🎉 Benvenuto nel Dashboard!</h1>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>ID:</strong> {user?.id}</p>
          <p><strong>Confermato:</strong> {user?.email_confirmed_at ? '✅ Sì' : '❌ No'}</p>
        </div>
        
        {message && (
          <div style={{ background: '#e8f5e8', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {message}
          </div>
        )}
        
        <button onClick={handleLogout} style={{ 
          background: '#dc3545', 
          color: 'white', 
          padding: '0.5rem 1rem', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Logout
        </button>

        <details style={{ marginTop: '2rem' }}>
          <summary>🔍 Debug Info</summary>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', fontSize: '12px' }}>
            {JSON.stringify(debug, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>🔐 Auth Test</h1>
        
        {message && (
          <div style={{ 
            background: message.includes('❌') ? '#ffe6e6' : '#e8f5e8', 
            padding: '1rem', 
            borderRadius: '4px', 
            marginBottom: '1rem',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}
        
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              marginBottom: '0.5rem'
            }}
          />
        </div>
        
        {view === 'signup' && (
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #ccc', 
                borderRadius: '4px'
              }}
            />
          </div>
        )}
        
        {view === 'login' && (
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #ccc', 
                borderRadius: '4px'
              }}
            />
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {view === 'login' ? (
            <>
              <button 
                onClick={handleSignIn} 
                disabled={loading || !email || !password}
                style={{ 
                  background: '#007bff', 
                  color: 'white', 
                  padding: '0.75rem', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? '⏳ Caricamento...' : '🔑 Accedi'}
              </button>
              
              
              <button 
                onClick={() => setView('signup')}
                style={{ 
                  background: 'transparent', 
                  color: '#007bff', 
                  padding: '0.5rem', 
                  border: '1px solid #007bff', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                📝 Registrati
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleSignUp} 
                disabled={loading || !email || !password}
                style={{ 
                  background: '#28a745', 
                  color: 'white', 
                  padding: '0.75rem', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? '⏳ Caricamento...' : '📝 Registrati'}
              </button>
              
              <button 
                onClick={() => setView('login')}
                style={{ 
                  background: 'transparent', 
                  color: '#007bff', 
                  padding: '0.5rem', 
                  border: '1px solid #007bff', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🔑 Hai già un account?
              </button>
            </>
          )}
        </div>
        
        <details style={{ marginTop: '2rem' }}>
          <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#666' }}>🔍 Debug Info</summary>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', fontSize: '10px', marginTop: '0.5rem' }}>
            Current URL: {window.location.href}{'\n'}
            Hash: {window.location.hash}{'\n'}
            Search: {window.location.search}{'\n'}
            User: {user ? '✅ Logged in' : '❌ Not logged in'}{'\n'}
            {JSON.stringify(debug, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}