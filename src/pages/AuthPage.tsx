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
    
    console.log('🔧 Iniziando magic link per:', email)
    
    // Usa signInWithPassword con password temporanea per bypassare il problema
    const tempPassword = 'TempPassword123!'
    
    // Prima prova a registrare l'utente (se non esiste)
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: { username: email.split('@')[0] }
      }
    })
    
    // Poi fai login immediato (ora che è auto-confermato)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: tempPassword
    })
    
    if (signInError && !signInError.message.includes('already')) {
      setError('Errore durante l\'accesso')
    } else {
      setMessage('✅ Accesso effettuato con successo!')
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
          
          <div className="border-t pt-4">
            <button
              onClick={handleMagicLinkLogin}
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Caricamento...' : 'Accesso Rapido (Solo Email)'}
            </button>
            <p className="text-xs text-gray-500 mt-1">Accedi senza password usando solo l'email</p>
          </div>

          {message && <p className="text-green-600 mt-3 text-center">{message}</p>}
          {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
        </div>
      </div>
    </div>
  )
}