import { Calendar, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { playgroundData } from "@/data/playgroundData";
const Events = () => {
  const navigate = useNavigate();

  // Filtra i playground che hanno eventi attivi
  const activeEvents = playgroundData.filter(playground => playground.currentEvent && playground.currentEvent.isActive);
  const openEventLink = (link: string) => {
    window.open(link, '_blank');
  };
  return <div className="min-h-screen flex flex-col arcade-container">
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
          <div className="arcade-section p-6">
            <h2 className="text-xl md:text-2xl font-bold mb-4 arcade-heading">
              EVENTI IN CORSO
            </h2>
            
            {activeEvents.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeEvents.map(playground => <Card key={playground.id} className="arcade-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 arcade-title">
                        <Calendar className="text-orange-500" size={24} />
                        {playground.name}
                      </CardTitle>
                    </CardHeader>
                    
                  </Card>)}
              </div> : <div className="text-center py-12">
                <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold mb-2 arcade-heading">
                  NESSUN EVENTO IN CORSO
                </h3>
                <p className="text-gray-600 arcade-text">
                  Al momento non ci sono eventi attivi nei playground.
                </p>
              </div>}
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
    </div>;
};
export default Events;