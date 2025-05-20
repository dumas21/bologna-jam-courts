
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CookiePolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

const CookiePolicy: React.FC<CookiePolicyProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <div className="flex justify-between items-center">
            <DialogTitle className="font-press-start text-sm">Informativa sui Cookie</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 text-sm">
          <h2 className="font-bold text-jam-orange">Informativa sui Cookie di Playground Jam</h2>
          
          <p>
            Ultimo aggiornamento: 20 Maggio 2025
          </p>
          
          <p>
            Questa Informativa sui Cookie spiega come Playground Jam utilizza i cookie e tecnologie simili 
            quando utilizzi la nostra applicazione.
          </p>
          
          <h3 className="font-bold mt-4">1. Cosa sono i cookie?</h3>
          <p>
            I cookie sono piccoli file di testo memorizzati sul tuo dispositivo quando visiti un sito web o utilizzi un'applicazione.
            Vengono ampiamente utilizzati per far funzionare le applicazioni, migliorare l'efficienza e fornire informazioni
            ai proprietari dell'applicazione.
          </p>
          
          <h3 className="font-bold mt-4">2. Come utilizziamo i cookie</h3>
          <p>Utilizziamo i cookie e tecnologie simili (come il localStorage) per:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Ricordare le tue preferenze e impostazioni</li>
            <li>Mantenere attiva la tua sessione di accesso</li>
            <li>Memorizzare temporaneamente dati come le chat dei playground</li>
            <li>Raccogliere statistiche sull'utilizzo dell'app per migliorare le funzionalità</li>
            <li>Garantire la sicurezza del tuo account</li>
          </ul>
          
          <h3 className="font-bold mt-4">3. Tipi di cookie che utilizziamo</h3>
          <p>
            <strong>Cookie essenziali:</strong> Necessari per il funzionamento dell'applicazione,
            come mantenere il tuo stato di accesso.
          </p>
          <p>
            <strong>Cookie funzionali:</strong> Permettono di ricordare le tue preferenze e scelte.
          </p>
          <p>
            <strong>Cookie analitici:</strong> Ci aiutano a capire come gli utenti utilizzano l'applicazione,
            permettendoci di migliorare l'esperienza utente.
          </p>
          
          <h3 className="font-bold mt-4">4. Tecnologie di archiviazione locale</h3>
          <p>
            Oltre ai cookie, utilizziamo il localStorage del browser per memorizzare temporaneamente informazioni
            come le preferenze degli utenti e i dati delle chat. Queste informazioni rimangono sul tuo dispositivo
            finché non cancelli manualmente la cache del browser o l'applicazione non le rimuove automaticamente
            (come nel caso delle chat, che vengono resettate ogni 48 ore).
          </p>
          
          <h3 className="font-bold mt-4">5. Come gestire i cookie</h3>
          <p>
            Puoi gestire le preferenze relative ai cookie tramite le impostazioni del tuo browser.
            Tieni presente che la disabilitazione di alcuni cookie potrebbe influire sulla funzionalità 
            dell'applicazione.
          </p>
          
          <h3 className="font-bold mt-4">6. Modifiche a questa Informativa</h3>
          <p>
            Potremmo aggiornare questa Informativa sui Cookie di tanto in tanto. Ti informeremo di eventuali
            modifiche pubblicando la nuova Informativa sui Cookie su questa pagina.
          </p>
          
          <h3 className="font-bold mt-4">7. Contattaci</h3>
          <p>
            Per domande o chiarimenti su questa Informativa sui Cookie, contattaci all'indirizzo:
            privacy@playgroundjam.com
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CookiePolicy;
