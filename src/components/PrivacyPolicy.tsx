
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <div className="flex justify-between items-center">
            <DialogTitle className="font-press-start text-sm">Informativa sulla Privacy</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 text-sm">
          <h2 className="font-bold text-jam-orange">Informativa sulla Privacy di Playground Jam</h2>
          
          <p>
            Ultimo aggiornamento: 20 Maggio 2025
          </p>
          
          <p>
            La presente Informativa sulla Privacy descrive come Playground Jam raccoglie, utilizza e condivide 
            le tue informazioni personali quando utilizzi la nostra applicazione.
          </p>
          
          <h3 className="font-bold mt-4">1. Informazioni che raccogliamo</h3>
          <p>
            <strong>Informazioni di registrazione:</strong> Quando crei un account, raccogliamo il tuo indirizzo email,
            il nickname che scegli e una password crittografata.
          </p>
          <p>
            <strong>Dati di utilizzo:</strong> Raccogliamo informazioni sui playground che visiti e sui check-in che effettui.
          </p>
          <p>
            <strong>Contenuti generati:</strong> Raccogliamo i messaggi che invii tramite la nostra funzione di chat.
          </p>
          
          <h3 className="font-bold mt-4">2. Come utilizziamo le tue informazioni</h3>
          <p>Utilizziamo le informazioni raccolte per:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Fornirti i servizi dell'applicazione</li>
            <li>Personalizzare la tua esperienza</li>
            <li>Migliorare e sviluppare nuove funzionalità</li>
            <li>Comunicare con te riguardo al tuo account</li>
            <li>Garantire la sicurezza della nostra piattaforma</li>
          </ul>
          
          <h3 className="font-bold mt-4">3. Condivisione delle informazioni</h3>
          <p>
            <strong>Informazioni pubbliche:</strong> Il tuo nickname è visibile ad altri utenti dell'applicazione, 
            insieme ai messaggi che pubblichi nelle chat dei playground.
          </p>
          <p>
            <strong>Non condividiamo:</strong> Il tuo indirizzo email non è mai visibile pubblicamente ad altri utenti
            e non viene mai condiviso con terze parti per scopi pubblicitari.
          </p>
          
          <h3 className="font-bold mt-4">4. Conservazione dei dati</h3>
          <p>
            Conserviamo i tuoi dati personali per tutto il tempo in cui mantieni un account attivo.
            Le chat dei playground vengono automaticamente resettate ogni 48 ore.
          </p>
          
          <h3 className="font-bold mt-4">5. I tuoi diritti</h3>
          <p>
            Hai il diritto di accedere, correggere o eliminare i tuoi dati personali. Per esercitare
            questi diritti, contattaci all'indirizzo privacy@playgroundjam.com.
          </p>
          
          <h3 className="font-bold mt-4">6. Modifiche a questa Informativa</h3>
          <p>
            Potremmo aggiornare questa Informativa sulla Privacy di tanto in tanto. Ti informeremo di eventuali
            modifiche pubblicando la nuova Informativa sulla Privacy su questa pagina.
          </p>
          
          <h3 className="font-bold mt-4">7. Contattaci</h3>
          <p>
            Per domande o chiarimenti su questa Informativa sulla Privacy, contattaci all'indirizzo:
            privacy@playgroundjam.com
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicy;
