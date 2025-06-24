
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseUser } from "@/contexts/SupabaseUserContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { ArrowLeft } from "lucide-react";

const Chat = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoading, signOut } = useSupabaseUser();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', user.id)
          .single();

        if (data && data.nickname) {
          setUsername(data.nickname);
        } else if (!error) {
          // Se non c'è un nickname, reindirizza alla creazione username
          navigate('/create-username');
        }
      }
    };

    if (user) {
      fetchUsername();
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col arcade-container">
      <div className="crt-overlay"></div>
      <div className="neptune-background"></div>
      
      <Header />
      
      <main className="container mx-auto p-4 flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-2xl">
          <div className="mb-6 flex justify-between items-center">
            <Button
              onClick={() => navigate("/")}
              className="arcade-button arcade-button-secondary"
            >
              <ArrowLeft size={16} className="mr-2" />
              INDIETRO
            </Button>
            
            <Button
              onClick={handleLogout}
              className="arcade-button arcade-button-secondary"
            >
              LOGOUT
            </Button>
          </div>

          <Card className="arcade-card" style={{
            background: 'rgba(0, 0, 0, 0.9)',
            border: '3px dashed #ff00ff',
            borderRadius: '20px',
            boxShadow: '0 0 20px #00ffff',
          }}>
            <CardHeader>
              <CardTitle className="arcade-title text-center" style={{ 
                color: '#ffcc00', 
                fontSize: '24px',
                textShadow: '2px 2px 0px #000'
              }}>
                BENVENUTO, {username?.toUpperCase()}!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center arcade-text" style={{ color: '#00ffff' }}>
                <p>Sei entrato con successo nella chat!</p>
                <p className="mt-4">Qui puoi aggiungere la logica per la chat.</p>
              </div>

              <div className="text-center">
                <div className="arcade-text" style={{ color: '#ffcc00', fontSize: '12px' }}>
                  <p>Email: {user?.email}</p>
                  <p>ID Utente: {user?.id}</p>
                </div>
              </div>

              <div className="mt-8 p-4 border-2 border-dashed border-cyan-400 rounded-lg">
                <div className="arcade-text text-center" style={{ color: '#ffffff', fontSize: '10px' }}>
                  <p>🎮 AREA CHAT 🎮</p>
                  <p className="mt-2">Questa è l'area dove implementerai la funzionalità di chat.</p>
                  <p>Puoi aggiungere messaggi, utenti online, stanze, ecc.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Chat;
