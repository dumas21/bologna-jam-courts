import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Mail } from 'lucide-react';

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
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-xl md:text-2xl font-press-start retro-neon-text">
              INFORMATIVA PRIVACY
            </h1>
          </div>
          
          <p className="text-muted-foreground text-sm">
            Informativa ai sensi del Regolamento UE 2016/679 (GDPR)
          </p>
          <p className="text-muted-foreground text-xs">
            Ultimo aggiornamento: Dicembre 2024
          </p>
          
          <div className="space-y-6 text-foreground">
            {/* 1. Titolare del Trattamento */}
            <section>
              <h2 className="font-bold text-primary mb-2">1. Titolare del Trattamento</h2>
              <p className="text-sm">
                Il titolare del trattamento dei dati personali è il proprietario del progetto <strong>Playground JAM</strong>.
              </p>
              <p className="text-sm mt-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>Email di contatto: </span>
                <a href="mailto:playgroundjam21@gmail.com" className="text-primary hover:underline">
                  playgroundjam21@gmail.com
                </a>
              </p>
            </section>

            {/* 2. Tipologia di Dati Raccolti */}
            <section>
              <h2 className="font-bold text-primary mb-2">2. Tipologia di Dati Raccolti</h2>
              <p className="text-sm mb-3">
                Vengono raccolti esclusivamente:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <strong>Indirizzo email</strong> – fornito durante la registrazione o l'iscrizione alla newsletter
                </li>
                <li>
                  <strong>Username/Nickname</strong> – scelto dall'utente per identificarsi nel servizio
                </li>
                <li>
                  <strong>Eventuali dati forniti volontariamente</strong> – tramite form di contatto, suggerimenti eventi o altre comunicazioni
                </li>
              </ul>
            </section>

            {/* 3. Finalità del Trattamento */}
            <section>
              <h2 className="font-bold text-primary mb-2">3. Finalità del Trattamento</h2>
              <p className="text-sm mb-3">
                I dati personali sono utilizzati per le seguenti finalità:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Inviare comunicazioni legate a Playground JAM</li>
                <li>Fornire aggiornamenti sul progetto, eventi, tornei e novità</li>
                <li>Rispondere a richieste inviate dagli utenti</li>
                <li>Gestire l'autenticazione e l'accesso ai servizi</li>
                <li>Attività informative e promozionali strettamente collegate al progetto</li>
              </ul>
            </section>

            {/* 4. Base Giuridica del Trattamento */}
            <section>
              <h2 className="font-bold text-primary mb-2">4. Base Giuridica del Trattamento</h2>
              <p className="text-sm">
                Il trattamento dei dati si basa sul <strong>consenso esplicito dell'utente</strong>, 
                espresso tramite apposita accettazione al momento della registrazione o dell'invio di form.
              </p>
              <p className="text-sm mt-2">
                Riferimento normativo: Art. 6(1)(a) del Regolamento UE 2016/679 (GDPR).
              </p>
            </section>

            {/* 5. Modalità di Trattamento e Conservazione */}
            <section>
              <h2 className="font-bold text-primary mb-2">5. Modalità di Trattamento e Conservazione</h2>
              <p className="text-sm mb-2">
                I dati personali sono trattati in modo <strong>lecito, corretto e trasparente</strong>, 
                con strumenti digitali e adeguate misure di sicurezza tecniche e organizzative.
              </p>
              <p className="text-sm">
                I dati vengono conservati <strong>solo per il tempo strettamente necessario</strong> alle 
                finalità indicate, oppure fino a richiesta di cancellazione da parte dell'utente.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                <li>Dati account: conservati per tutta la durata dell'account</li>
                <li>Messaggi chat: eliminati automaticamente dopo 72 ore</li>
                <li>Dati newsletter: conservati fino alla disiscrizione</li>
              </ul>
            </section>

            {/* 6. Comunicazione e Condivisione dei Dati */}
            <section>
              <h2 className="font-bold text-primary mb-2">6. Comunicazione e Condivisione dei Dati</h2>
              <p className="text-sm mb-2">
                <strong>I dati personali non vengono ceduti a terzi</strong> per scopi pubblicitari o commerciali.
              </p>
              <p className="text-sm">
                I dati possono essere trattati esclusivamente da servizi tecnici indispensabili 
                al funzionamento del sito (hosting, servizi email), sempre nel rispetto del GDPR:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                <li><strong>Supabase</strong> – hosting e database (server in UE)</li>
                <li><strong>Resend</strong> – invio email transazionali</li>
              </ul>
            </section>

            {/* 7. Diritti dell'Utente */}
            <section>
              <h2 className="font-bold text-primary mb-2">7. Diritti dell'Utente</h2>
              <p className="text-sm mb-3">
                Ai sensi degli articoli 15-22 del GDPR, l'utente ha il diritto di:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <strong>Accedere ai propri dati</strong> – ottenere conferma del trattamento e copia dei dati
                </li>
                <li>
                  <strong>Richiedere la rettifica</strong> – correggere dati inesatti o incompleti
                </li>
                <li>
                  <strong>Richiedere la cancellazione</strong> – eliminazione dei dati ("diritto all'oblio")
                </li>
                <li>
                  <strong>Limitare o opporsi al trattamento</strong> – in determinati casi previsti dalla legge
                </li>
                <li>
                  <strong>Richiedere la portabilità</strong> – ricevere i dati in formato strutturato e leggibile
                </li>
              </ul>
              <p className="text-sm mt-3">
                Per esercitare questi diritti, contattaci a: 
                <a href="mailto:playgroundjam21@gmail.com" className="text-primary hover:underline ml-1">
                  playgroundjam21@gmail.com
                </a>
              </p>
            </section>

            {/* 8. Revoca del Consenso */}
            <section>
              <h2 className="font-bold text-primary mb-2">8. Revoca del Consenso</h2>
              <p className="text-sm">
                L'utente può <strong>revocare il consenso in qualsiasi momento</strong> scrivendo a{' '}
                <a href="mailto:playgroundjam21@gmail.com" className="text-primary hover:underline">
                  playgroundjam21@gmail.com
                </a>
                .
              </p>
              <p className="text-sm mt-2">
                La revoca del consenso non pregiudica la liceità del trattamento effettuato 
                prima della revoca stessa.
              </p>
            </section>

            {/* 9. Autorità di Controllo */}
            <section>
              <h2 className="font-bold text-primary mb-2">9. Autorità di Controllo</h2>
              <p className="text-sm">
                Se ritieni che il trattamento dei tuoi dati violi le normative sulla protezione dei dati, 
                hai il diritto di proporre reclamo al <strong>Garante per la Protezione dei Dati Personali</strong>:
              </p>
              <p className="text-sm mt-2">
                <a 
                  href="https://www.garanteprivacy.it" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.garanteprivacy.it
                </a>
              </p>
            </section>

            {/* 10. Cookie */}
            <section>
              <h2 className="font-bold text-primary mb-2">10. Cookie e Tecnologie Simili</h2>
              <p className="text-sm">
                Utilizziamo esclusivamente <strong>cookie tecnici strettamente necessari</strong> per il 
                funzionamento del servizio (es. sessione di autenticazione). 
                Non utilizziamo cookie di profilazione o di terze parti per pubblicità.
              </p>
            </section>

            {/* 11. Modifiche alla Privacy Policy */}
            <section>
              <h2 className="font-bold text-primary mb-2">11. Modifiche alla Privacy Policy</h2>
              <p className="text-sm">
                Ci riserviamo il diritto di modificare questa informativa. Le modifiche significative 
                saranno comunicate via email o tramite avviso sul sito. 
                Ti invitiamo a consultare periodicamente questa pagina.
              </p>
            </section>

            {/* Contatti */}
            <section className="pt-4 border-t border-border">
              <h2 className="font-bold text-primary mb-2">Contatti</h2>
              <p className="text-sm">
                Per qualsiasi domanda sulla privacy o per esercitare i tuoi diritti:
              </p>
              <ul className="text-sm mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <strong>Email:</strong> 
                  <a href="mailto:playgroundjam21@gmail.com" className="text-primary hover:underline">
                    playgroundjam21@gmail.com
                  </a>
                </li>
                <li>
                  <strong>Titolare:</strong> Playground JAM
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;