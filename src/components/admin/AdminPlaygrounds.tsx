import { useState } from "react";
import { MapPin, Star, Users } from "lucide-react";
import { playgroundData } from "@/data/playgroundData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const AdminPlaygrounds = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlaygrounds = playgroundData.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold arcade-heading">GESTIONE PLAYGROUND</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca playground..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Totale playground: <span className="text-primary font-bold">{playgroundData.length}</span>
      </div>

      <div className="grid gap-4">
        {filteredPlaygrounds.map((playground) => (
          <div 
            key={playground.id} 
            className="arcade-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold">{playground.name}</span>
                  {playground.currentEvent?.isActive && (
                    <Badge className="bg-yellow-500 text-black">
                      <Star className="w-3 h-3 mr-1" />
                      EVENTO ATTIVO
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {playground.address}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              {playground.district && (
                <Badge variant="outline">{playground.district}</Badge>
              )}
              {playground.basketCount && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {playground.basketCount} canestri
                </div>
              )}
              {playground.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{playground.rating}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredPlaygrounds.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nessun playground trovato
          </div>
        )}
      </div>

      <div className="arcade-section p-4 mt-6">
        <p className="text-sm text-muted-foreground text-center">
          ℹ️ I playground sono attualmente gestiti tramite file di configurazione. 
          <br />
          Per modifiche, contatta lo sviluppatore.
        </p>
      </div>
    </div>
  );
};

export default AdminPlaygrounds;