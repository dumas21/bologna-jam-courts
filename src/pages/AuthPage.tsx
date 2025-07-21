import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [session, setSession] = useState<any>(null)

  // Al mount: controlla sessione
  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
    }

    fetchSession()

    // Listener per cambiamento auth
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const handleEmailLogin = async () => {
    setMessage('')
    setError('')
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`
      }
    })
    if (error) {
      setError(error.message)
    } else {
      setMessage('✅ Controlla la tua email per il link di accesso!')
    }
  }

  const handleGitHubLogin = async () => {
    setMessage('')
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth`
      }
    })
    if (error) {
      setError(error.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">LOVABLE - Login</h1>

        {session ? (
          <div className="space-y-4">
            <p className="text-green-600 font-semibold">✅ Accesso effettuato!</p>
            <p>Email: {session.user?.email}</p>
            <p>Scadenza: {new Date(session.expires_at! * 1000).toLocaleString()}</p>
            <button
              onClick={handleLogout}
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
            >
              Esci
            </button>
          </div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Inserisci email"
              className="border p-2 w-full mb-3 rounded"
            />
            <button
              onClick={handleEmailLogin}
              className="w-full bg-blue-600 text-white py-2 rounded mb-2"
            >
              Login con Email
            </button>
            <button
              onClick={handleGitHubLogin}
              className="w-full bg-gray-800 text-white py-2 rounded"
            >
              Login con GitHub
            </button>

            {message && <p className="text-green-600 mt-3">{message}</p>}
            {error && <p className="text-red-500 mt-3">{error}</p>}
          </>
        )}
      </div>
    </div>
  )
}