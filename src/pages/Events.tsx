import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const navigate = useNavigate();

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
        </div>
      </main>
      
      <footer className="arcade-footer mt-4">
        <div className="container mx-auto px-4 text-center py-4">
          <p className="font-press-start text-xs">
            PLAYGROUND JAM BOLOGNA &copy; 2026 - MATTEO BERGAMI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Events;