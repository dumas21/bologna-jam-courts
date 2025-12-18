import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna alla Home
        </Link>

        <div className="arcade-card p-6 md:p-8 space-y-6">
          <h1 className="text-xl md:text-2xl font-press-start retro-neon-text">
            INFORMATIVA PRIVACY
          </h1>
          
          <p className="text-muted-foreground text-sm">
            Ultimo aggiornamento: Dicembre 2024
          </p>
          
          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="font-bold text-primary mb-2">1. Titolare del Trattamento</h2>
              <p className="text-sm">
                Il titolare del trattamento dei dati personali è Playground Jam. Per qualsiasi 
                informazione o richiesta, puoi contattarci all'indirizzo: privacy@playgroundjam.com
              </p>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">2. Dati Raccolti</h2>
              <p className="text-sm mb-2">Raccogliamo i seguenti dati:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Dati di registrazione:</strong> Email, username e password (crittografata)</li>
                <li><strong>Dati di utilizzo:</strong> Check-in nei playground, messaggi nella chat</li>
                <li><strong>Newsletter:</strong> Indirizzo email (solo se ti iscrivi)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">3. Finalità del Trattamento</h2>
              <p className="text-sm mb-2">I tuoi dati sono utilizzati per:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Fornirti accesso alla piattaforma e alle sue funzionalità</li>
                <li>Permetterti di partecipare alle chat dei playground</li>
                <li>Inviarti comunicazioni relative al servizio</li>
                <li>Migliorare l'esperienza utente</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">4. Base Giuridica</h2>
              <p className="text-sm">
                Il trattamento è basato sul tuo consenso esplicito (Art. 6(1)(a) GDPR) e 
                sull'esecuzione di un contratto di servizio (Art. 6(1)(b) GDPR).
              </p>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">5. Conservazione dei Dati</h2>
              <p className="text-sm">
                I dati personali sono conservati per tutta la durata dell'account. I messaggi 
                nelle chat vengono eliminati automaticamente dopo 72 ore.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">6. I Tuoi Diritti</h2>
              <p className="text-sm mb-2">Ai sensi del GDPR, hai diritto a:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Accesso:</strong> Ottenere conferma e copia dei tuoi dati</li>
                <li><strong>Rettifica:</strong> Correggere dati inesatti</li>
                <li><strong>Cancellazione:</strong> Richiedere l'eliminazione dei tuoi dati</li>
                <li><strong>Portabilità:</strong> Ricevere i tuoi dati in formato strutturato</li>
                <li><strong>Opposizione:</strong> Opporti al trattamento in determinati casi</li>
                <li><strong>Revoca del consenso:</strong> Ritirare il consenso in qualsiasi momento</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">7. Sicurezza</h2>
              <p className="text-sm">
                Adottiamo misure tecniche e organizzative appropriate per proteggere i tuoi 
                dati, inclusa la crittografia delle password e l'uso di connessioni sicure (HTTPS).
              </p>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">8. Condivisione con Terzi</h2>
              <p className="text-sm">
                Non vendiamo né condividiamo i tuoi dati personali con terze parti per scopi 
                pubblicitari. I dati possono essere condivisi solo con fornitori di servizi 
                tecnici (es. hosting) necessari al funzionamento della piattaforma.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">9. Contatti</h2>
              <p className="text-sm">
                Per esercitare i tuoi diritti o per qualsiasi domanda sulla privacy, 
                contattaci a: <a href="mailto:privacy@playgroundjam.com" className="text-primary hover:underline">privacy@playgroundjam.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;