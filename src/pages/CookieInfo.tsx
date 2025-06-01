
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CookieInfo: React.FC = () => {
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
            <h1 className="font-press-start text-lg text-jam-purple">Cookie Policy</h1>
          </div>
          
          <div className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="font-bold text-jam-orange text-base mb-3">Informativa sui Cookie di Playground Jam</h2>
              <p className="text-gray-600">Ultimo aggiornamento: 1 Giugno 2025</p>
            </section>
            
            <section>
              <h3 className="font-bold mb-2">1. Cosa sono i cookie?</h3>
              <p>
                I cookie sono piccoli file di testo memorizzati sul tuo dispositivo per migliorare 
                l'esperienza di navigazione e far funzionare correttamente l'applicazione.
              </p>
            </section>
            
            <section>
              <h3 className="font-bold mb-2">2. Come utilizziamo i cookie</h3>
              <p>Utilizziamo i cookie e il localStorage per:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Mantenere attiva la tua sessione di accesso</li>
                <li>Ricordare le tue preferenze</li>
                <li>Memorizzare temporaneamente le chat dei playground</li>
                <li>Garantire la sicurezza del tuo account</li>
                <li>Migliorare le prestazioni dell'app</li>
              </ul>
            </section>
            
            <section>
              <h3 className="font-bold mb-2">3. Tipi di cookie utilizzati</h3>
              <p className="mb-2">
                <strong>Cookie essenziali:</strong> Necessari per il funzionamento dell'app, 
                come mantenere il tuo stato di accesso.
              </p>
              <p className="mb-2">
                <strong>Cookie funzionali:</strong> Permettono di ricordare le tue preferenze e impostazioni.
              </p>
              <p>
                <strong>localStorage:</strong> Utilizziamo il localStorage del browser per memorizzare 
                temporaneamente le chat e altre preferenze locali.
              </p>
            </section>
            
            <section>
              <h3 className="font-bold mb-2">4. Gestione dei cookie</h3>
              <p>
                Puoi gestire i cookie tramite le impostazioni del tuo browser. 
                La disabilitazione potrebbe influire sul funzionamento dell'applicazione.
              </p>
            </section>
            
            <section>
              <h3 className="font-bold mb-2">5. Cookie di terze parti</h3>
              <p>
                Non utilizziamo cookie di tracciamento pubblicitario o di profilazione. 
                Tutti i cookie utilizzati sono funzionali al servizio.
              </p>
            </section>
            
            <section>
              <h3 className="font-bold mb-2">6. Contatti</h3>
              <p>
                Per domande sui cookie, contattaci all'indirizzo: 
                <span className="text-jam-blue font-medium"> privacy@playgroundjam.com</span>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieInfo;
