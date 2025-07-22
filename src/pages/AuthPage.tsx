import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { user, session, signUp, signInWithPassword } = useAuth()
  const navigate = useNavigate()

  // Redirect se già autenticato
  useEffect(() => {
    if (user && session) {
      navigate('/', { replace: true })
    }
  }, [user, session, navigate])

  const handleEmailPasswordAuth = async () => {
    if (!email || !password) {
      setError('Email e password sono obbligatori')
      return
    }

    setMessage('')
    setError('')
    setIsLoading(true)
    
    try {
      if (isSignUp) {
        if (!username) {
          setError('Username è obbligatorio per la registrazione')
          setIsLoading(false)
          return
        }
        
        console.log('🚀 Avvio registrazione con:', { email, username })
        
        const { error } = await signUp(email, password, username)
        
        if (error) {
          console.error('❌ Errore durante registrazione:', error)
          setError(error.message)
        } else {
          console.log('✅ Registrazione completata - controlla email')
          setMessage('✅ Registrazione completata! Controlla la tua email per confermare l\'account.')
        }
      } else {
        console.log('🔑 Tentativo di login con email:', email)
        
        const { error } = await signInWithPassword(email, password)
        
        if (error) {
          console.error('❌ Errore durante login:', error)
          setError(error.message)
        } else {
          console.log('✅ Login completato con successo')
          setMessage('✅ Login effettuato con successo!')
        }
      }
    } catch (err: any) {
      console.error('💥 Errore imprevisto:', err)
      setError('Errore durante l\'autenticazione')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLinkLogin = async () => {
    if (!email) {
      setError('Email è obbligatoria')
      return
    }

    setMessage('')
    setError('')
    setIsLoading(true)
    
    console.log('🔧 Iniziando OTP passwordless per:', email)
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://bologna-jam-courts.lovable.app/confirm-email',
      },
    })
    
    if (error) {
      console.error('❌ Errore OTP:', error)
      setError(error.message)
    } else {
      console.log('✅ Codice OTP inviato con successo')
      setMessage('✅ Controlla la tua email per il codice/link di accesso!')
    }
    setIsLoading(false)
  }

  const handleGitHubLogin = async () => {
    setMessage('')
    setError('')
    setIsLoading(true)
    
    console.log('🔧 Iniziando GitHub OAuth')
    
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'github',
      options: {
        redirectTo: 'https://bologna-jam-courts.lovable.app/confirm-email'
      }
    })
    
    if (error) {
      console.error('❌ Errore GitHub OAuth:', error)
      setError(error.message)
    }
    setIsLoading(false)
  }

  const handleGoogleLogin = async () => {
    setMessage('')
    setError('')
    setIsLoading(true)
    
    console.log('🔧 Iniziando Google OAuth')
    
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: 'https://bologna-jam-courts.lovable.app/confirm-email'
      }
    })
    
    if (error) {
      console.error('❌ Errore Google OAuth:', error)
      setError(error.message)
    }
    setIsLoading(false)
  }

  if (user && session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center">
          <p className="text-green-600 font-semibold">✅ Sei già autenticato!</p>
          <p>Reindirizzamento in corso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isSignUp ? 'Registrazione' : 'Accesso'}
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="border p-3 w-full rounded-lg"
            disabled={isLoading}
          />
          
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="border p-3 w-full rounded-lg"
            disabled={isLoading}
          />
          
          {isSignUp && (
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              className="border p-3 w-full rounded-lg"
              disabled={isLoading}
            />
          )}
          
          <button
            onClick={handleEmailPasswordAuth}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Caricamento...' : (isSignUp ? 'Registrati' : 'Accedi')}
          </button>
          
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-blue-600 py-2"
            disabled={isLoading}
          >
            {isSignUp ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
          </button>
          
          <div className="border-t pt-4 space-y-3">
            <button
              onClick={handleMagicLinkLogin}
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Caricamento...' : 'Accedi con OTP (Solo Email)'}
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={handleGitHubLogin}
                disabled={isLoading}
                className="flex-1 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 disabled:opacity-50 flex items-center justify-center"
              >
                🐙 GitHub
              </button>
              
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
              >
                🔍 Google
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              Metodi di accesso alternativi - più veloci e affidabili!
            </p>
          </div>

          {message && <p className="text-green-600 mt-3 text-center">{message}</p>}
          {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
        </div>
      </div>
    </div>
  )
}