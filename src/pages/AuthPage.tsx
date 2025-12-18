import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
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

        if (!acceptedPrivacy) {
          setError('Devi accettare la Policy sui Dati per registrarti')
          setIsLoading(false)
          return
        }
        
        console.log('🚀 Avvio registrazione con:', { email, username })
        
        const { error } = await signUp(email, password, username, false, '1.0')
        
        if (error) {
          console.error('❌ Errore durante registrazione:', error)
          // Map common errors
          const errorMap: Record<string, string> = {
            'User already registered': 'Questo account esiste già. Prova ad accedere.',
            'Email already registered': 'Questa email è già registrata.',
            'Invalid email': 'Email non valida.',
            'Password should be at least 6 characters': 'La password deve avere almeno 6 caratteri.'
          }
          setError(errorMap[error.message] || error.message)
        } else {
          console.log('✅ Registrazione completata - controlla email')
          setMessage('✅ Registrazione completata! Controlla la tua email (anche spam) per confermare l\'account.')
        }
      } else {
        console.log('🔑 Tentativo di login con email:', email)
        
        const { error } = await signInWithPassword(email, password)
        
        if (error) {
          console.error('❌ Errore durante login:', error)
          const errorMap: Record<string, string> = {
            'Invalid login credentials': 'Credenziali non valide. Controlla email e password.',
            'Email not confirmed': 'Email non confermata. Controlla la tua casella di posta.'
          }
          setError(errorMap[error.message] || error.message)
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

  if (user && session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="arcade-card p-6 rounded-xl shadow-lg max-w-md w-full text-center">
          <p className="text-neon-green font-semibold">✅ Sei già autenticato!</p>
          <p className="text-muted-foreground">Reindirizzamento in corso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="arcade-card p-6 md:p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-xl md:text-2xl font-press-start mb-6 text-center retro-neon-text">
          {isSignUp ? 'NUOVA CONNESSIONE' : 'ACCESSO'}
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="EMAIL"
            className="arcade-input w-full p-3"
            disabled={isLoading}
          />
          
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="PASSWORD"
            className="arcade-input w-full p-3"
            disabled={isLoading}
          />
          
          {isSignUp && (
            <>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="USERNAME (3-20 caratteri)"
                className="arcade-input w-full p-3"
                disabled={isLoading}
                minLength={3}
                maxLength={20}
              />
              
              {/* Privacy consent checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedPrivacy}
                    onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-primary"
                    disabled={isLoading}
                  />
                  <span className="text-xs text-muted-foreground">
                    Accetto la{' '}
                    <Link 
                      to="/privacy-policy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Policy sui Dati
                    </Link>
                    {' '}e autorizzo il trattamento dei miei dati personali ai sensi del GDPR.
                  </span>
                </label>
              </div>
            </>
          )}
          
          <button
            onClick={handleEmailPasswordAuth}
            disabled={isLoading}
            className="arcade-button w-full mt-4"
          >
            {isLoading ? 'CARICAMENTO...' : (isSignUp ? 'REGISTRATI' : 'ACCEDI')}
          </button>
          
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setMessage('')
              setAcceptedPrivacy(false)
            }}
            className="w-full text-primary py-2 text-sm hover:underline"
            disabled={isLoading}
          >
            {isSignUp ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
          </button>
          

          {message && <p className="text-neon-green mt-3 text-center text-sm">{message}</p>}
          {error && <p className="text-destructive mt-3 text-center text-sm">{error}</p>}
        </div>
      </div>
    </div>
  )
}