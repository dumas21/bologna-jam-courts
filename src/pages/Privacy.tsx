
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Privacy: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-jam-purple via-jam-blue to-jam-orange p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-press-start text-lg text-jam-purple">Privacy Policy</h1>
          </div>
          
          <div className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="font-bold text-jam-orange text-base mb-3">Informativa sulla Privacy di Playground Jam</h2>
              <p className="text-gray-600">Ultimo aggiornamento: 1 Giugno 2025</p>
            </section>
            
            <section>
              <h3 className="font-bold mb-2">1. Informazioni che raccogliamo</h3>
              <p className="mb-2">
                <strong>Informazioni di registrazione:</strong> Quando crei un account, raccogliamo 
                il tuo indirizzo email e il nickname che scegli. L'email serve solo per l'autenticazione 
                e non viene mai mostrata pubblicamente.
              </p>
              <p>
                <strong>Contenuti generati:</strong> Raccogliamo i messaggi che invii nelle chat 
                dei playground, associati al tuo nickname.
              </p>
            </section>
            
            <section>
              <h3 className="font-bold mb-2">2. Come utilizziamo le tue informazioni</h3>
              <p>Le tue informazioni vengono utilizzate esclusivamente per:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Permetterti di accedere all'applicazione</li>
                <li>Mostrare il tuo nickname nelle chat (mai l'email)</li>
                <li>Garantire la sicurezza della piattaforma</li>
                <li>Migliorare l'esperienza utente</li>
              </ul>
            </section>
            
            <section>
              <h3 className="font-bold mb-2">3. Privacy e visibilità</h3>
              <p className="mb-2">
                <strong>Informazioni pubbliche:</strong> Solo il tuo nickname è visibile agli altri utenti.
              </p>
              <p>
                <strong>Informazioni private:</strong> Il tuo indirizzo email non è mai visibile ad altri utenti 
                e non viene condiviso con terze parti per scopi pubblicitari.
              </p>
            </section>
            
            <section>
              <h3 className="font-bold mb-2">4. Conservazione dei dati</h3>
              <p>
                I dati dell'account vengono conservati finché mantieni un profilo attivo. 
                Le chat dei playground vengono automaticamente resettate ogni 48 ore per garantire privacy.
              </p>
            </section>
            
            <section>
              <h3 className="font-bold mb-2">5. I tuoi diritti</h3>
              <p>
                Hai il diritto di accedere, correggere o eliminare i tuoi dati personali. 
                Per esercitare questi diritti, contattaci all'indirizzo privacy@playgroundjam.com.
              </p>
            </section>
            
            <section>
              <h3 className="font-bold mb-2">6. Contatti</h3>
              <p>
                Per domande su questa Privacy Policy, contattaci all'indirizzo: 
                <span className="text-jam-blue font-medium"> privacy@playgroundjam.com</span>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
