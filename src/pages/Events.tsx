import { Calendar, ExternalLink, ArrowLeft, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { playgroundData } from "@/data/playgroundData";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Events = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [formData, setFormData] = useState({
    playgroundName: '',
    eventName: '',
    eventDescription: '',
    eventDate: '',
    eventLink: ''
  });

  // Filtra i playground che hanno eventi attivi
  const activeEvents = playgroundData.filter(playground => playground.currentEvent && playground.currentEvent.isActive);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.eventName.trim() || !formData.playgroundName.trim()) {
      toast.error("Compila i campi obbligatori");
      return;
    }

    if (!privacyAccepted) {
      toast.error("Devi accettare l'informativa privacy per continuare");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulazione invio - in futuro collegare a Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Suggerimento inviato! Lo valuteremo presto.");
    setFormData({
      playgroundName: '',
      eventName: '',
      eventDescription: '',
      eventDate: '',
      eventLink: ''
    });
    setPrivacyAccepted(false);
    setShowForm(false);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col arcade-container">
      <div className="neptune-background"></div>
      
      <header className="arcade-header relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button onClick={() => navigate('/')} className="arcade-button arcade-button-home">
              <ArrowLeft size={16} />
              <span className="ml-2">TORNA ALLA MAPPA</span>
            </Button>
            <h1 className="text-2xl md:text-4xl font-bold arcade-title">
              EVENTI PLAYGROUND
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 flex-1 relative z-10">
        <div className="space-y-6">
          {/* Eventi in corso */}
          <div className="arcade-section p-6">
            <h2 className="text-xl md:text-2xl font-bold mb-4 arcade-heading">
              EVENTI IN CORSO
            </h2>
            
            <div className="text-center py-12">
              <Sparkles size={64} className="mx-auto text-primary mb-4 animate-pulse" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4 retro-neon-text animate-pulse">
                STAY TUNED!
              </h3>
              <p className="text-muted-foreground arcade-text">
                Stiamo preparando eventi incredibili per te.
              </p>
              <p className="text-muted-foreground arcade-text mt-2">
                Torna presto per scoprire le novità!
              </p>
            </div>
          </div>

          {/* Sezione Suggerisci Evento */}
          <div className="arcade-section p-6">
            <h2 className="text-xl md:text-2xl font-bold mb-4 arcade-heading flex items-center gap-2">
              <Send size={24} className="text-primary" />
              SUGGERISCI UN EVENTO
            </h2>
            
            {user ? (
              <>
                {!showForm ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">
                      Hai un'idea per un evento? Condividila con noi!
                    </p>
                    <Button 
                      onClick={() => setShowForm(true)}
                      className="arcade-button"
                    >
                      PROPONI EVENTO
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
                    <div className="space-y-2">
                      <Label htmlFor="playgroundName" className="text-foreground">
                        Nome Playground *
                      </Label>
                      <Input
                        id="playgroundName"
                        value={formData.playgroundName}
                        onChange={(e) => setFormData(prev => ({ ...prev, playgroundName: e.target.value }))}
                        placeholder="Es. Giardini Margherita"
                        className="bg-background/50 border-border"
                        maxLength={100}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="eventName" className="text-foreground">
                        Nome Evento *
                      </Label>
                      <Input
                        id="eventName"
                        value={formData.eventName}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventName: e.target.value }))}
                        placeholder="Es. Torneo 3vs3"
                        className="bg-background/50 border-border"
                        maxLength={100}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="eventDescription" className="text-foreground">
                        Descrizione
                      </Label>
                      <Textarea
                        id="eventDescription"
                        value={formData.eventDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventDescription: e.target.value }))}
                        placeholder="Descrivi l'evento..."
                        className="bg-background/50 border-border min-h-[100px]"
                        maxLength={500}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="eventDate" className="text-foreground">
                        Data Evento
                      </Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                        className="bg-background/50 border-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="eventLink" className="text-foreground">
                        Link (opzionale)
                      </Label>
                      <Input
                        id="eventLink"
                        type="url"
                        value={formData.eventLink}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventLink: e.target.value }))}
                        placeholder="https://..."
                        className="bg-background/50 border-border"
                        maxLength={255}
                      />
                    </div>
                    
                    {/* Privacy Consent Checkbox */}
                    <div className="pt-2">
                      <div className="flex items-start gap-3">
                        <input
                          id="privacy-consent-event"
                          type="checkbox"
                          checked={privacyAccepted}
                          onChange={(e) => setPrivacyAccepted(e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-border bg-background/50 text-primary focus:ring-primary"
                          required
                        />
                        <label htmlFor="privacy-consent-event" className="text-xs text-muted-foreground">
                          Dichiaro di aver letto l'{' '}
                          <Link to="/privacy-policy" target="_blank" className="text-primary hover:underline">
                            informativa privacy
                          </Link>{' '}
                          e acconsento al trattamento dei miei dati personali ai sensi del Regolamento UE 2016/679 (GDPR).
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowForm(false)}
                        className="flex-1"
                      >
                        ANNULLA
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting || !privacyAccepted}
                        className="flex-1 arcade-button"
                      >
                        {isSubmitting ? "INVIO..." : "INVIA SUGGERIMENTO"}
                      </Button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">
                  Accedi per suggerire un evento
                </p>
                <Link to="/auth">
                  <Button className="arcade-button">
                    ACCEDI
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="arcade-footer mt-4">
        <div className="container mx-auto px-4 text-center py-4">
          <p className="font-press-start text-xs">
            PLAYGROUND JAM BOLOGNA &copy; 2025 - MATTEO BERGAMI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Events;