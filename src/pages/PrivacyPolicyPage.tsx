import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

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
            Ultimo aggiornamento: Gennaio 2025
          </p>
          
          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="font-bold text-primary mb-2">1. Titolare del Trattamento</h2>
              <p className="text-sm">
                Il titolare del trattamento dei dati personali è <strong>Playground Jam Bologna</strong>, 
                di Matteo Bergami. Per qualsiasi informazione o richiesta relativa al trattamento 
                dei tuoi dati personali, puoi contattarci all'indirizzo email: 
                <a href="mailto:privacy@playgroundjam.com" className="text-primary hover:underline ml-1">
                  privacy@playgroundjam.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">2. Dati Personali Raccolti</h2>
              <p className="text-sm mb-3">
                Raccogliamo e trattiamo i seguenti dati personali:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <strong>Indirizzo Email:</strong> Raccolto durante la registrazione, utilizzato per:
                  <ul className="list-circle pl-5 mt-1 space-y-1">
                    <li>Autenticazione e accesso al servizio</li>
                    <li>Invio dell'email di conferma registrazione</li>
                    <li>Comunicazioni relative al servizio (es. reset password)</li>
                    <li>Newsletter (solo se espressamente acconsentito)</li>
                  </ul>
                </li>
                <li>
                  <strong>Username/Nickname:</strong> Scelto dall'utente, visibile pubblicamente nelle chat dei playground
                </li>
                <li>
                  <strong>Password:</strong> Memorizzata in forma crittografata (hash), mai in chiaro
                </li>
                <li>
                  <strong>Messaggi Chat:</strong> Contenuto dei messaggi inviati nelle chat dei playground
                </li>
                <li>
                  <strong>Dati Tecnici:</strong> Indirizzo IP, User Agent del browser (per sicurezza e prevenzione abusi)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">3. Finalità e Base Giuridica del Trattamento</h2>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4">Finalità</th>
                    <th className="text-left py-2">Base Giuridica (GDPR)</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">Creazione e gestione account</td>
                    <td className="py-2">Art. 6(1)(b) - Esecuzione contratto</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">Autenticazione e sicurezza</td>
                    <td className="py-2">Art. 6(1)(b) - Esecuzione contratto</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">Invio email di conferma</td>
                    <td className="py-2">Art. 6(1)(b) - Esecuzione contratto</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">Partecipazione alle chat</td>
                    <td className="py-2">Art. 6(1)(a) - Consenso</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4">Invio newsletter</td>
                    <td className="py-2">Art. 6(1)(a) - Consenso esplicito</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Prevenzione abusi e sicurezza</td>
                    <td className="py-2">Art. 6(1)(f) - Legittimo interesse</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">4. Conservazione dei Dati</h2>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <strong>Dati Account:</strong> Conservati per tutta la durata dell'account. 
                  Alla cancellazione, i dati vengono eliminati entro 30 giorni.
                </li>
                <li>
                  <strong>Messaggi Chat:</strong> Eliminati automaticamente dopo <strong>72 ore</strong> 
                  dalla pubblicazione.
                </li>
                <li>
                  <strong>Log di Sicurezza:</strong> Conservati per 12 mesi per finalità di 
                  sicurezza e prevenzione frodi.
                </li>
                <li>
                  <strong>Dati Newsletter:</strong> Conservati fino alla disiscrizione.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">5. Condivisione e Trasferimento Dati</h2>
              <p className="text-sm mb-2">
                <strong>Non vendiamo</strong> né condividiamo i tuoi dati personali con terze parti 
                per scopi pubblicitari o di marketing.
              </p>
              <p className="text-sm mb-2">I dati possono essere condivisi con:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  <strong>Supabase Inc.</strong> (hosting e database) - Server in UE, conforme GDPR
                </li>
                <li>
                  <strong>Resend</strong> (servizio email) - Per l'invio di email transazionali
                </li>
              </ul>
              <p className="text-sm mt-2">
                Tutti i fornitori sono selezionati per la loro conformità al GDPR e alle 
                normative sulla protezione dei dati.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">6. I Tuoi Diritti (GDPR Art. 15-22)</h2>
              <p className="text-sm mb-3">
                Hai i seguenti diritti sui tuoi dati personali:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <strong>Diritto di Accesso (Art. 15):</strong> Ottenere conferma del trattamento 
                  e copia dei tuoi dati
                </li>
                <li>
                  <strong>Diritto di Rettifica (Art. 16):</strong> Correggere dati inesatti o 
                  incompleti
                </li>
                <li>
                  <strong>Diritto alla Cancellazione (Art. 17):</strong> Richiedere l'eliminazione 
                  dei tuoi dati ("diritto all'oblio")
                </li>
                <li>
                  <strong>Diritto alla Portabilità (Art. 20):</strong> Ricevere i tuoi dati in 
                  formato strutturato e leggibile
                </li>
                <li>
                  <strong>Diritto di Opposizione (Art. 21):</strong> Opporti al trattamento in 
                  determinati casi
                </li>
                <li>
                  <strong>Diritto di Revoca (Art. 7):</strong> Ritirare il consenso in qualsiasi 
                  momento senza pregiudicare la liceità del trattamento precedente
                </li>
              </ul>
              <p className="text-sm mt-3">
                Per esercitare questi diritti, contattaci a: 
                <a href="mailto:privacy@playgroundjam.com" className="text-primary hover:underline ml-1">
                  privacy@playgroundjam.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">7. Sicurezza dei Dati</h2>
              <p className="text-sm mb-2">
                Adottiamo misure tecniche e organizzative appropriate per proteggere i tuoi dati:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Crittografia delle password con algoritmi sicuri (bcrypt)</li>
                <li>Connessioni sicure HTTPS per tutte le comunicazioni</li>
                <li>Row Level Security (RLS) nel database per isolamento dati utente</li>
                <li>Rate limiting per prevenire abusi</li>
                <li>Autenticazione a due fattori disponibile</li>
                <li>Monitoraggio costante degli accessi</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">8. Cookie e Tecnologie Simili</h2>
              <p className="text-sm">
                Utilizziamo cookie tecnici strettamente necessari per il funzionamento del 
                servizio (es. sessione di autenticazione). Non utilizziamo cookie di 
                profilazione o di terze parti per pubblicità.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">9. Minori</h2>
              <p className="text-sm">
                Il servizio è destinato a utenti di età pari o superiore a 16 anni. Non 
                raccogliamo consapevolmente dati di minori di 16 anni senza il consenso 
                del genitore o tutore.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">10. Reclami</h2>
              <p className="text-sm">
                Se ritieni che il trattamento dei tuoi dati violi le normative sulla protezione 
                dei dati, hai il diritto di presentare un reclamo all'Autorità Garante per la 
                Protezione dei Dati Personali: 
                <a 
                  href="https://www.garanteprivacy.it" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-1"
                >
                  www.garanteprivacy.it
                </a>
              </p>
            </section>

            <section>
              <h2 className="font-bold text-primary mb-2">11. Modifiche alla Privacy Policy</h2>
              <p className="text-sm">
                Ci riserviamo il diritto di modificare questa informativa. Le modifiche 
                significative saranno comunicate via email o tramite avviso sul sito. 
                Ti invitiamo a consultare periodicamente questa pagina.
              </p>
            </section>

            <section className="pt-4 border-t border-border">
              <h2 className="font-bold text-primary mb-2">Contatti</h2>
              <p className="text-sm">
                Per qualsiasi domanda sulla privacy o per esercitare i tuoi diritti:
              </p>
              <ul className="text-sm mt-2 space-y-1">
                <li>
                  <strong>Email:</strong> 
                  <a href="mailto:privacy@playgroundjam.com" className="text-primary hover:underline ml-1">
                    privacy@playgroundjam.com
                  </a>
                </li>
                <li>
                  <strong>Titolare:</strong> Matteo Bergami - Playground Jam Bologna
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