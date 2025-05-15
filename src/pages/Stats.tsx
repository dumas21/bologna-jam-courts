
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Users, CalendarCheck } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

// Use the hook we created earlier
import { usePlaygrounds } from "@/hooks/usePlaygrounds";

const Stats = () => {
  const navigate = useNavigate();
  const { playgrounds, totalCheckIns } = usePlaygrounds();
  const [view, setView] = useState<"daily" | "total">("daily");
  
  // Current date
  const currentDate = format(new Date(), "EEEE d MMMM yyyy", { locale: it });
  
  // Sort playgrounds by current players (daily) or total check-ins
  const sortedPlaygrounds = [...playgrounds].sort((a, b) => {
    if (view === "daily") {
      return b.currentPlayers - a.currentPlayers;
    } else {
      return b.totalCheckins - a.totalCheckins;
    }
  });
  
  // Calculate totals
  const currentTotal = playgrounds.reduce((sum, pg) => sum + pg.currentPlayers, 0);
  
  const playSoundEffect = (action: string) => {
    const audio = new Audio(`/sounds/${action}.mp3`);
    audio.play().catch(err => console.log('Audio playback error:', err));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto p-4 flex-1">
        <div className="bg-gradient-to-r from-jam-purple to-jam-blue p-1 rounded mb-6">
          <h2 className="font-press-start text-xs md:text-sm text-center py-2 animate-[text-flashing_2s_ease-in-out_infinite]">
            STATISTICHE PLAYGROUND BOLOGNA
          </h2>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => {
              playSoundEffect('click');
              navigate("/");
            }}
            className="text-jam-purple hover:text-jam-blue"
          >
            <ArrowLeft size={16} />
            <span className="ml-2">Indietro</span>
          </Button>
          
          <div className="text-jam-yellow font-press-start text-xs">
            {currentDate}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-black bg-opacity-50 backdrop-blur-md border-jam-purple">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-jam-orange flex items-center justify-center gap-2">
                <User size={18} />
                Giocatori Oggi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <span className="font-press-start text-2xl text-jam-yellow animate-[text-flashing_2s_ease-in-out_infinite]">{currentTotal}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black bg-opacity-50 backdrop-blur-md border-jam-blue">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-jam-orange flex items-center justify-center gap-2">
                <Users size={18} />
                Check-in Totali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <span className="font-press-start text-2xl text-jam-yellow animate-[text-flashing_2s_ease-in-out_infinite]">{totalCheckIns}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs 
          value={view} 
          onValueChange={(val) => {
            playSoundEffect('tab');
            setView(val as "daily" | "total");
          }} 
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="daily" className="font-press-start text-xs">
              <User size={16} className="mr-1" />
              <span>Oggi</span>
            </TabsTrigger>
            <TabsTrigger value="total" className="font-press-start text-xs">
              <CalendarCheck size={16} className="mr-1" />
              <span>Totali</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="animate-pixel-fade-in">
            <div className="pixel-card bg-black bg-opacity-50 backdrop-blur-md">
              <h3 className="font-press-start text-sm text-jam-orange mb-4 text-center animate-[text-flashing_3s_ease-in-out_infinite]">
                CLASSIFICA PRESENZE GIORNALIERE
              </h3>
              
              <div className="space-y-4">
                {sortedPlaygrounds.map((playground, index) => (
                  <div 
                    key={playground.id}
                    className="flex items-center justify-between p-2 border-b border-jam-purple hover:bg-jam-purple/20 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="font-press-start text-jam-blue w-6">{index + 1}</span>
                      <span className="ml-2">{playground.name}</span>
                    </div>
                    <div className="flex items-center bg-jam-dark px-3 py-1 rounded">
                      <User className="text-jam-orange mr-1" size={14} />
                      <span className="font-press-start">{playground.currentPlayers}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="total" className="animate-pixel-fade-in">
            <div className="pixel-card bg-black bg-opacity-50 backdrop-blur-md">
              <h3 className="font-press-start text-sm text-jam-orange mb-4 text-center animate-[text-flashing_3s_ease-in-out_infinite]">
                CLASSIFICA CHECK-IN TOTALI
              </h3>
              
              <div className="space-y-4">
                {sortedPlaygrounds.map((playground, index) => (
                  <div 
                    key={playground.id}
                    className="flex items-center justify-between p-2 border-b border-jam-purple hover:bg-jam-blue/20 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="font-press-start text-jam-blue w-6">{index + 1}</span>
                      <span className="ml-2">{playground.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-press-start text-jam-yellow">{playground.totalCheckins}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-black bg-opacity-60 backdrop-blur-md border-t-4 border-jam-purple py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="font-press-start text-xs text-white/60">
            PLAYGROUND JAM BOLOGNA &copy; 2025 - Matteo Bergami
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Stats;
