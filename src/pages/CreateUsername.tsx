
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useSupabaseUser } from "@/contexts/SupabaseUserContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

const CreateUsername = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoggedIn, isLoading } = useSupabaseUser();
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "ERRORE",
        description: "Utente non autenticato",
        variant: "destructive"
      });
      return;
    }

    if (!username.trim()) {
      toast({
        title: "ERRORE",
        description: "Il nome utente è obbligatorio",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nickname: username.trim() })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "ERRORE",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "SUCCESSO",
          description: "Nome utente creato con successo!",
        });
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error updating username:', error);
      toast({
        title: "ERRORE",
        description: "Si è verificato un errore. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="w-full max-w-md">
          <Card className="arcade-card" style={{
            background: 'rgba(0, 0, 0, 0.9)',
            border: '3px dashed #ff00ff',
            borderRadius: '20px',
            boxShadow: '0 0 20px #00ffff',
          }}>
            <CardHeader>
              <CardTitle className="arcade-title text-center" style={{ 
                color: '#ffcc00', 
                fontSize: '18px',
                textShadow: '2px 2px 0px #000'
              }}>
                CREA NOME UTENTE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="arcade-text" style={{ color: '#ffcc00' }}>
                    NOME UTENTE
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Inserisci il tuo nome utente"
                    required
                    maxLength={50}
                    className="arcade-input"
                    style={{
                      background: 'rgba(0, 0, 0, 0.8)',
                      border: '2px solid #00ffff',
                      color: '#ffffff'
                    }}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !username.trim()}
                  className="w-full arcade-button arcade-button-primary"
                >
                  {isSubmitting ? "CREAZIONE..." : "CREA NOME UTENTE"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateUsername;
