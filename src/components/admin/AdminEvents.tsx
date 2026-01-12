import { Sparkles, Calendar } from "lucide-react";

const AdminEvents = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold arcade-heading">GESTIONE EVENTI</h2>
      </div>

      <div className="text-center py-12">
        <div className="flex justify-center gap-4 mb-6">
          <Calendar className="w-12 h-12 text-primary animate-pulse" />
          <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse" />
        </div>
        
        <h3 className="text-2xl font-bold mb-4 retro-neon-text">
          COMING SOON!
        </h3>
        
        <p className="text-muted-foreground arcade-text max-w-md mx-auto">
          La gestione eventi sarà disponibile prossimamente.
        </p>
        <p className="text-muted-foreground arcade-text mt-2">
          Potrai creare, modificare e gestire tutti gli eventi dei playground.
        </p>
      </div>

      <div className="arcade-section p-4">
        <h4 className="font-bold mb-3 text-primary">FUNZIONALITÀ IN ARRIVO:</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✅ Creazione nuovi eventi</li>
          <li>✅ Associazione evento a playground</li>
          <li>✅ Gestione date e orari</li>
          <li>✅ Pubblicazione/Nascondimento eventi</li>
          <li>✅ Notifiche agli utenti</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminEvents;