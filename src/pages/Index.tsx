
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import PlaygroundDetail from "@/components/PlaygroundDetail";
import { Playground } from "@/types/playground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, MessageSquare, CalendarDays, Plus, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { usePlaygrounds } from "@/hooks/usePlaygrounds";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();
  const { playgrounds, checkIn, checkOut } = usePlaygrounds();
  const [selectedPlayground, setSelectedPlayground] = useState<Playground | null>(null);

  const handleSelectPlayground = (playground: Playground) => {
    setSelectedPlayground(playground);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto p-4 flex-1">
        <div className="bg-gradient-to-r from-jam-purple to-jam-blue p-1 rounded mb-6">
          <h2 className="font-press-start text-xs md:text-sm text-center py-2">
            TROVA IL TUO PLAYGROUND A BOLOGNA
          </h2>
        </div>
        
        <div className="flex justify-between mb-4">
          <Button 
            onClick={() => navigate('/stats')}
            className="pixel-button text-xs flex items-center gap-2 bg-jam-blue"
          >
            <BarChart size={16} />
            <span className="hidden md:inline">Statistiche</span>
            <span className="inline md:hidden">Stats</span>
          </Button>
          
          <Button 
            onClick={() => navigate('/add-playground')}
            className="pixel-button text-xs flex items-center gap-2"
          >
            <Plus size={16} />
            <span className="hidden md:inline">Aggiungi Playground</span>
            <span className="inline md:hidden">Nuovo</span>
          </Button>
        </div>
        
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="map" className="font-press-start text-xs">
              <MapPin size={16} className="mr-1" />
              <span className="hidden md:inline">Mappa</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="font-press-start text-xs">
              <MessageSquare size={16} className="mr-1" />
              <span className="hidden md:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="font-press-start text-xs">
              <CalendarDays size={16} className="mr-1" />
              <span className="hidden md:inline">Eventi</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="animate-pixel-fade-in">
            <div className="pixel-card bg-black bg-opacity-70 backdrop-blur-sm">
              <MapView 
                playgrounds={playgrounds} 
                selectedPlayground={selectedPlayground}
                onSelectPlayground={handleSelectPlayground} 
              />
            </div>
            
            {selectedPlayground && (
              <PlaygroundDetail 
                playground={selectedPlayground} 
                onCheckIn={checkIn}
                onCheckOut={checkOut}
              />
            )}
          </TabsContent>
          
          <TabsContent value="chat" className="animate-pixel-fade-in">
            <div className="pixel-card bg-black bg-opacity-70 backdrop-blur-sm h-64 flex items-center justify-center">
              <p className="font-press-start text-xs text-jam-orange">
                {isLoggedIn ? 'Chat disponibile presto' : 'Chat disponibile dopo il login'}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="animate-pixel-fade-in">
            <div className="pixel-card bg-black bg-opacity-70 backdrop-blur-sm h-64 flex items-center justify-center">
              <p className="font-press-start text-xs text-jam-orange">
                {isLoggedIn ? 'Eventi disponibili presto' : 'Eventi disponibili dopo il login'}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-black bg-opacity-70 backdrop-blur-sm border-t-4 border-jam-purple py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="font-press-start text-xs text-white/60">
            PLAYGROUND JAM BOLOGNA &copy; 2025 - Matteo Bergami
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
