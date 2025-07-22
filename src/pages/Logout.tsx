
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Logout = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await signOut();
        toast({
          title: "LOGOUT EFFETTUATO",
          description: "Sei stato disconnesso con successo.",
        });
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Errore durante logout:', error);
        toast({
          title: "ERRORE LOGOUT",
          description: "Si è verificato un errore durante la disconnessione.",
          variant: "destructive"
        });
        navigate('/', { replace: true });
      }
    };

    handleLogout();
  }, [signOut, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
      <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-8 border border-purple-500 text-center">
        <h1 className="text-xl font-bold text-white mb-4 nike-text">
          DISCONNESSIONE...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default Logout;
