import { useState, useEffect } from "react";
import { 
  User, 
  Clock, 
  Droplet, 
  Home, 
  Umbrella, 
  Sun,
  LogOut,
  TimerReset,
  Calendar,
  Gamepad2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Playground } from "@/types/playground";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PlaygroundRating from "./PlaygroundRating";
import PlaygroundChat from "./PlaygroundChat";
import WeatherInfo from "./WeatherInfo";
import ShootTheHoop from "./ShootTheHoop";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface PlaygroundDetailProps {
  playground: Playground;
  onCheckIn: (playgroundId: string, userNickname: string) => boolean;
  onCheckOut: (playgroundId: string, userNickname: string) => boolean;
  hasUserCheckedIn: (playgroundId: string, userNickname: string) => boolean;
  checkInRecords: Array<{playgroundId: string; email: string; nickname: string; timestamp: number;}>;
}

const PlaygroundDetail = ({ playground, onCheckIn, onCheckOut, hasUserCheckedIn, checkInRecords }: PlaygroundDetailProps) => {
  const { toast } = useToast();
  const { isLoggedIn, nickname, isAdmin } = useUser();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const currentDate = format(new Date(), "EEEE d MMMM yyyy", { locale: it });
  const currentTime = format(new Date(), "HH:mm");
  
  const userHasCheckedIn = checkInRecords.some(
    record => record.playgroundId === playground.id && nickname === record.nickname
  );
  
  const playBasketballSound = (soundType: string) => {
    const audio = new Audio(`/sounds/${soundType}.mp3`);
    audio.play().catch(err => console.log('Basketball sound error:', err));
  };
  
  const openGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.google.com/maps?q=${encodedAddress}`;
    window.open(url, '_blank');
    playBasketballSound('click');
  };
  
  const handleCheckIn = () => {
    if (!isLoggedIn) {
      toast({
        title: "LOGIN RICHIESTO",
        description: "Devi effettuare il login per fare check-in",
        variant: "destructive"
      });
      return;
    }
    
    setShowConfirmDialog(true);
    playBasketballSound('tab');
  };
  
  const processCheckIn = () => {
    const success = onCheckIn(playground.id, nickname);
    
    if (success) {
      playBasketballSound('checkin');
      toast({
        title: "CHECK-IN COMPLETATO! 🏀",
        description: `Non dimenticare di portare il pallone e tenere pulito!`,
      });
      setShowConfirmDialog(false);
    }
  };
  
  const handleCheckOut = () => {
    if (!isLoggedIn) {
      toast({
        title: "LOGIN RICHIESTO",
        description: "Devi effettuare il login per fare check-out",
        variant: "destructive"
      });
      return;
    }
    
    const success = onCheckOut(playground.id, nickname);
    
    if (success) {
      playBasketballSound('checkout');
      toast({
        title: "CHECK-OUT COMPLETATO! 👋",
        description: `Grazie per aver aggiornato le presenze e mantenuto pulito il playground!`,
      });
    }
  };

  // Generate basketball hoop icons based on basket count
  const renderBasketHoops = () => {
    const hoops = [];
    const basketCount = playground.basketCount || 1;
    for (let i = 0; i < basketCount; i++) {
      hoops.push(
        <span key={i} className="text-3xl">🏀</span>
      );
    }
    return hoops;
  };

  return (
    <div className="glass-card mt-8 animate-pixel-fade-in p-8 rounded-lg">
      <div className="flex flex-wrap items-center justify-between mb-8">
        <h3 className="nba-jam-heading bg-black bg-opacity-90 px-6 py-3 rounded-lg border-[3px] border-orange-500">
          {playground.name.toUpperCase()}
        </h3>
        
        <div className="flex items-center space-x-6 text-base">
          <div className="flex items-center space-x-3">
            <Calendar size={20} className="text-blue-400 animate-neon-glow" />
            <span className="nike-text text-white">{currentDate.toUpperCase()}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock size={20} className="text-blue-400 animate-neon-glow" />
            <span className="nike-text text-white">{currentTime}</span>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="info">
        <TabsList className="w-full mb-8 bg-black bg-opacity-80 border-2 border-orange-500">
          <TabsTrigger 
            value="info" 
            className="text-base nike-text" 
            onClick={() => playBasketballSound('tab')}
          >
            INFO
          </TabsTrigger>
          <TabsTrigger 
            value="chat" 
            className="text-base nike-text" 
            onClick={() => playBasketballSound('tab')}
          >
            CHAT
          </TabsTrigger>
          <TabsTrigger 
            value="meteo" 
            className="text-base nike-text" 
            onClick={() => playBasketballSound('tab')}
          >
            METEO
          </TabsTrigger>
          <TabsTrigger 
            value="gioco" 
            className="text-base nike-text" 
            onClick={() => playBasketballSound('tab')}
          >
            <Gamepad2 size={16} className="mr-2" />
            GIOCO
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <div className="flex flex-col md:flex-row md:justify-between gap-8">
            <div className="md:w-2/3 space-y-6">
              <div className="flex items-start gap-4 p-4 bg-black bg-opacity-60 rounded-lg border-2 border-orange-500/40">
                <Home className="flex-shrink-0 text-orange-500 mt-1 animate-neon-glow" size={24} />
                <div>
                  <span className="text-white nike-text text-base">{playground.address}</span>
                  <div 
                    className="shoes-icon inline-block ml-4 cursor-pointer"
                    onClick={() => openGoogleMaps(playground.address)}
                    title="Apri in Google Maps per le indicazioni"
                  >
                    👟
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-black bg-opacity-60 rounded-lg border-2 border-orange-500/40">
                <Clock className="text-orange-500 animate-neon-glow" size={24} />
                <span className="text-white nike-text text-base">{playground.openHours}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="flex items-center gap-3 p-4 bg-black bg-opacity-60 rounded-lg border-2 border-orange-500/40">
                  {playground.hasShade ? (
                    <Umbrella className="text-green-400 animate-neon-glow" size={22} />
                  ) : (
                    <Umbrella className="text-red-400" size={22} />
                  )}
                  <span className="text-base nike-text text-white">OMBRA</span>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-black bg-opacity-60 rounded-lg border-2 border-orange-500/40">
                  {playground.hasFountain ? (
                    <Droplet className="text-green-400 animate-neon-glow" size={22} />
                  ) : (
                    <Droplet className="text-red-400" size={22} />
                  )}
                  <span className="text-base nike-text text-white">FONTANELLA</span>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-black bg-opacity-60 rounded-lg border-2 border-orange-500/40">
                  {playground.hasAmenities ? (
                    <Home className="text-green-400 animate-neon-glow" size={22} />
                  ) : (
                    <Home className="text-red-400" size={22} />
                  )}
                  <span className="text-base nike-text text-white">SERVIZI</span>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-black bg-opacity-60 rounded-lg border-2 border-orange-500/40">
                  {playground.hasLighting ? (
                    <Sun className="text-yellow-400 animate-neon-glow" size={22} />
                  ) : (
                    <Sun className="text-red-400" size={22} />
                  )}
                  <span className="text-base nike-text text-white">ILLUMINAZIONE</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-8 p-5 bg-black bg-opacity-60 rounded-lg border-2 border-orange-500/40">
                <span className="text-base nike-text text-white">CANESTRI:</span>
                <div className="flex items-center gap-2">
                  {renderBasketHoops()}
                </div>
                <span className="nike-text text-yellow-400 text-xl ml-3">
                  {playground.basketCount || 1}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mt-4 text-base text-blue-400 p-4 bg-black bg-opacity-40 rounded-lg">
                <TimerReset size={20} className="animate-neon-glow" />
                <span className="nike-text">RESET CONTEGGIO ALLE 23:59 DI OGGI</span>
              </div>
            </div>
            
            <div className="flex flex-col md:items-end gap-6 md:w-1/3">
              <div className="flex items-center justify-between mb-4 p-5 bg-black bg-opacity-80 rounded-lg border-2 border-orange-500">
                <span className="text-base nike-text text-white">CHECK-IN OGGI:</span>
                <div className="flex items-center bg-gradient-to-r from-red-600 to-orange-500 p-4 rounded-lg justify-center ml-4">
                  <User className="text-white" size={22} />
                  <span className="nike-text text-white text-2xl ml-3">
                    {playground.currentPlayers}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4 p-5 bg-black bg-opacity-80 rounded-lg border-2 border-orange-500">
                <span className="text-base nike-text text-white">TOTALE CHECK-IN:</span>
                <span className="nike-text text-yellow-400 text-xl ml-4">
                  {playground.totalCheckins}
                </span>
              </div>
              
              <PlaygroundRating playground={playground} />
              
              <div className="flex gap-4 mt-6 w-full">
                {userHasCheckedIn ? (
                  <Button 
                    onClick={handleCheckOut} 
                    className="pixel-button text-base w-full flex items-center gap-3"
                  >
                    <LogOut size={20} />
                    <span>CHECK-OUT</span>
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCheckIn} 
                    className="pixel-button text-base w-full"
                  >
                    CHECK-IN
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="chat">
          <PlaygroundChat 
            playground={playground}
          />
        </TabsContent>
        
        <TabsContent value="meteo">
          <WeatherInfo 
            playgroundName={playground.name}
            location={playground.address}
          />
        </TabsContent>
        
        <TabsContent value="gioco">
          <div className="flex flex-col items-center justify-center space-y-6">
            <h2 className="nba-jam-heading text-2xl text-center">
              ARCADE BASKETBALL
            </h2>
            <p className="nike-text text-center text-white/80 max-w-md">
              PROVA LA TUA ABILITÀ NEL TIRO! MIRA ALLA ZONA VERDE PER FARE CANESTRO!
            </p>
            <ShootTheHoop />
            <div className="bg-black bg-opacity-60 p-4 rounded-lg border-2 border-orange-500/40 max-w-md">
              <p className="nike-text text-sm text-center text-white/70">
                🎯 TRUCCO: PREMI QUANDO LA BARRA È NELLA ZONA CENTRALE PER FARE CANESTRO!
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="glass-card text-white border-2 border-orange-500">
          <DialogHeader>
            <DialogTitle className="nba-jam-heading text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              CONFERMA CHECK-IN
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-8 pt-6">
            <p className="text-base nike-text">SEI SICURO DI VOLER FARE IL CHECK-IN IN QUESTO PLAYGROUND?</p>
            <div className="flex justify-end gap-4">
              <Button 
                className="pixel-button bg-gray-600 hover:bg-gray-700" 
                onClick={() => {
                  setShowConfirmDialog(false);
                  playBasketballSound('click');
                }}
              >
                ANNULLA
              </Button>
              <Button 
                className="pixel-button" 
                onClick={processCheckIn}
              >
                CONFERMA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlaygroundDetail;
