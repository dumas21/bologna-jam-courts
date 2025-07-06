
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { signInWithPassword, signInWithUsername, signInWithMagicLink, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [emailLogin, setEmailLogin] = useState({ email: '', password: '' });
  const [usernameLogin, setUsernameLogin] = useState({ username: '', password: '' });
  const [magicLink, setMagicLink] = useState({ email: '', username: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Utente già autenticato, redirect alla home');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔑 Tentativo login con email:', emailLogin.email);
      const { data, error } = await signInWithPassword(emailLogin.email, emailLogin.password);
      
      if (error) {
        console.error('❌ Errore login email:', error);
        
        if (error.message?.includes('Email not confirmed')) {
          toast({
            title: "EMAIL NON CONFERMATA",
            description: "Controlla la tua email e clicca sul link di conferma prima di effettuare il login.",
            variant: "destructive"
          });
        } else if (error.message?.includes('Invalid login credentials')) {
          toast({
            title: "CREDENZIALI NON VALIDE",
            description: "Email o password non corretti. Riprova.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "ERRORE LOGIN",
            description: error.message || "Errore durante il login. Riprova.",
            variant: "destructive"
          });
        }
        return;
      }
      
      if (data?.user) {
        console.log('✅ Login completato con successo:', data.user.id);
        toast({
          title: "LOGIN EFFETTUATO",
          description: "Benvenuto nel PlaygroundJam!",
        });
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      console.error('💥 Errore imprevisto durante login:', error);
      toast({
        title: "ERRORE",
        description: "Si è verificato un errore imprevisto. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔑 Tentativo login con username:', usernameLogin.username);
      const { data, error } = await signInWithUsername(usernameLogin.username, usernameLogin.password);
      
      if (error) {
        console.error('❌ Errore login username:', error);
        toast({
          title: "ERRORE LOGIN",
          description: error.message || "Username o password non corretti.",
          variant: "destructive"
        });
        return;
      }
      
      if (data?.user) {
        console.log('✅ Login completato con successo:', data.user.id);
        toast({
          title: "LOGIN EFFETTUATO",
          description: "Benvenuto nel PlaygroundJam!",
        });
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      console.error('💥 Errore imprevisto durante login username:', error);
      toast({
        title: "ERRORE",
        description: "Si è verificato un errore imprevisto. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('✨ Invio magic link a:', magicLink.email);
      const { error } = await signInWithMagicLink(magicLink.email, magicLink.username);
      
      if (error) {
        console.error('❌ Errore magic link:', error);
        toast({
          title: "ERRORE MAGIC LINK",
          description: error.message || "Errore nell'invio del magic link.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "MAGIC LINK INVIATO!",
        description: "Controlla la tua email e clicca sul link per accedere.",
      });
    } catch (error: any) {
      console.error('💥 Errore imprevisto durante magic link:', error);
      toast({
        title: "ERRORE",
        description: "Si è verificato un errore imprevisto. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black bg-opacity-50 backdrop-blur-sm border border-purple-500">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white nike-text">
            PLAYGROUND JAM
          </CardTitle>
          <CardDescription className="text-gray-300">
            Accedi al tuo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800 border border-orange-500">
              <TabsTrigger value="email" className="text-white">EMAIL</TabsTrigger>
              <TabsTrigger value="username" className="text-white">USERNAME</TabsTrigger>
              <TabsTrigger value="magic" className="text-white">MAGIC</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-white flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={emailLogin.email}
                    onChange={(e) => setEmailLogin({...emailLogin, email: e.target.value})}
                    className="bg-gray-800 border-orange-500 text-white"
                    placeholder="la-tua-email@esempio.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-white flex items-center gap-2">
                    <Lock size={16} />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={emailLogin.password}
                      onChange={(e) => setEmailLogin({...emailLogin, password: e.target.value})}
                      className="bg-gray-800 border-orange-500 text-white pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full arcade-button arcade-button-primary"
                >
                  {loading ? 'ACCESSO...' : 'ACCEDI'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="username">
              <form onSubmit={handleUsernameLogin} className="space-y-4">
                <div>
                  <Label htmlFor="loginUsername" className="text-white flex items-center gap-2">
                    <User size={16} />
                    Username
                  </Label>
                  <Input
                    id="loginUsername"
                    type="text"
                    value={usernameLogin.username}
                    onChange={(e) => setUsernameLogin({...usernameLogin, username: e.target.value})}
                    className="bg-gray-800 border-orange-500 text-white"
                    placeholder="il-tuo-username"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="usernamePassword" className="text-white flex items-center gap-2">
                    <Lock size={16} />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="usernamePassword"
                      type={showPassword ? "text" : "password"}
                      value={usernameLogin.password}
                      onChange={(e) => setUsernameLogin({...usernameLogin, password: e.target.value})}
                      className="bg-gray-800 border-orange-500 text-white pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full arcade-button arcade-button-primary"
                >
                  {loading ? 'ACCESSO...' : 'ACCEDI'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="magic">
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <Label htmlFor="magicEmail" className="text-white flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </Label>
                  <Input
                    id="magicEmail"
                    type="email"
                    value={magicLink.email}
                    onChange={(e) => setMagicLink({...magicLink, email: e.target.value})}
                    className="bg-gray-800 border-orange-500 text-white"
                    placeholder="la-tua-email@esempio.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="magicUsername" className="text-white flex items-center gap-2">
                    <User size={16} />
                    Username
                  </Label>
                  <Input
                    id="magicUsername"
                    type="text"
                    value={magicLink.username}
                    onChange={(e) => setMagicLink({...magicLink, username: e.target.value})}
                    className="bg-gray-800 border-orange-500 text-white"
                    placeholder="il-tuo-username"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full arcade-button arcade-button-primary"
                >
                  {loading ? 'INVIO...' : 'INVIA MAGIC LINK'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center space-y-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/register')}
              className="text-purple-300 hover:text-white"
            >
              Non hai un account? Registrati
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white flex items-center gap-2 mx-auto"
            >
              <ArrowLeft size={16} />
              Torna alla home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
