
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
  Edit
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
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface PlaygroundDetailProps {
  playground: Playground;
  onCheckIn: (playgroundId: string, userNickname: string) => boolean;
  onCheckOut: (playgroundId: string, userNickname: string) => boolean;
  hasUserCheckedIn: (playgroundId: string, userNickname: string) => boolean;
  checkInRecords: Array<{playgroundId: string; email: string; nickname: string; timestamp: number;}>;
}

const PlaygroundDetail = ({ playground, onCheckIn, onCheckOut, hasUserCheckedIn, checkInRecords }: PlaygroundDetailProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isLoggedIn, nickname } = useUser();
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
  
  const handleEditPlayground = () => {
    localStorage.setItem("editPlaygroundId", playground.id);
    navigate("/add-playground");
    playBasketballSound('click');
  };

  // Generate basketball hoop icons based on basket count
  const renderBasketHoops = () => {
    const hoops = [];
    const basketCount = playground.basketCount || 1;
    for (let i = 0; i < basketCount; i++) {
      hoops.push(
        <span key={i} className="text-2xl">🏀</span>
      );
    }
    return hoops;
  };

  return (
    <div className="glass-card mt-8 animate-pixel-fade-in p-6 rounded-lg">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h3 className="font-bold text-2xl text-white bg-black bg-opacity-80 px-4 py-2 rounded-lg border-2 border-orange-500">
          {playground.name.toUpperCase()}
        </h3>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-blue-400 animate-neon-glow" />
            <span className="font-exo font-bold text-white">{currentDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-blue-400 animate-neon-glow" />
            <span className="font-exo font-bold text-white">{currentTime}</span>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="info">
        <TabsList className="w-full mb-6 bg-black bg-opacity-70 border border-orange-500">
          <TabsTrigger 
            value="info" 
            className="text-sm font-orbitron font-bold" 
            onClick={() => playBasketballSound('tab')}
          >
            INFO
          </TabsTrigger>
          <TabsTrigger 
            value="chat" 
            className="text-sm font-orbitron font-bold" 
            onClick={() => playBasketballSound('tab')}
          >
            CHAT
          </TabsTrigger>
          <TabsTrigger 
            value="meteo" 
            className="text-sm font-orbitron font-bold" 
            onClick={() => playBasketballSound('tab')}
          >
            METEO
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <div className="flex flex-col md:flex-row md:justify-between gap-6">
            <div className="md:w-2/3 space-y-4">
              <div className="flex items-start gap-3 p-3 bg-black bg-opacity-50 rounded-lg border border-orange-500/30">
                <Home className="flex-shrink-0 text-orange-500 mt-1 animate-neon-glow" size={20} />
                <div>
                  <span className="text-white font-exo font-medium">{playground.address}</span>
                  <div 
                    className="shoes-icon inline-block ml-3 cursor-pointer text-2xl"
                    onClick={() => openGoogleMaps(playground.address)}
                    title="Apri in Google Maps per le indicazioni"
                  >
                    👟
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-black bg-opacity-50 rounded-lg border border-orange-500/30">
                <Clock className="text-orange-500 animate-neon-glow" size={20} />
                <span className="text-white font-exo font-medium">{playground.openHours}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-2 p-3 bg-black bg-opacity-50 rounded-lg border border-orange-500/30">
                  {playground.hasShade ? (
                    <Umbrella className="text-green-400 animate-neon-glow" size={18} />
                  ) : (
                    <Umbrella className="text-red-400" size={18} />
                  )}
                  <span className="text-sm font-exo font-bold text-white">OMBRA</span>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-black bg-opacity-50 rounded-lg border border-orange-500/30">
                  {playground.hasFountain ? (
                    <Droplet className="text-green-400 animate-neon-glow" size={18} />
                  ) : (
                    <Droplet className="text-red-400" size={18} />
                  )}
                  <span className="text-sm font-exo font-bold text-white">FONTANELLA</span>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-black bg-opacity-50 rounded-lg border border-orange-500/30">
                  {playground.hasAmenities ? (
                    <Home className="text-green-400 animate-neon-glow" size={18} />
                  ) : (
                    <Home className="text-red-400" size={18} />
                  )}
                  <span className="text-sm font-exo font-bold text-white">SERVIZI</span>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-black bg-opacity-50 rounded-lg border border-orange-500/30">
                  {playground.hasLighting ? (
                    <Sun className="text-yellow-400 animate-neon-glow" size={18} />
                  ) : (
                    <Sun className="text-red-400" size={18} />
                  )}
                  <span className="text-sm font-exo font-bold text-white">ILLUMINAZIONE</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-6 p-4 bg-black bg-opacity-50 rounded-lg border border-orange-500/30">
                <span className="text-sm font-exo font-bold text-white">CANESTRI:</span>
                <div className="flex items-center gap-1">
                  {renderBasketHoops()}
                </div>
                <span className="font-orbitron text-yellow-400 font-bold text-lg ml-2">
                  {playground.basketCount || 1}
                </span>
              </div>
              
              <div className="flex items-center gap-3 mt-3 text-sm text-blue-400 p-3 bg-black bg-opacity-30 rounded-lg">
                <TimerReset size={16} className="animate-neon-glow" />
                <span className="font-exo">Reset conteggio alle 23:59 di oggi</span>
              </div>
            </div>
            
            <div className="flex flex-col md:items-end gap-4 md:w-1/3">
              <div className="flex items-center justify-between mb-3 p-4 bg-black bg-opacity-70 rounded-lg border border-orange-500">
                <span className="text-sm font-exo font-bold text-white">CHECK-IN OGGI:</span>
                <div className="flex items-center bg-gradient-to-r from-red-600 to-orange-500 p-3 rounded-lg justify-center ml-3">
                  <User className="text-white" size={18} />
                  <span className="font-orbitron text-white font-bold text-xl ml-2">
                    {playground.currentPlayers}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3 p-4 bg-black bg-opacity-70 rounded-lg border border-orange-500">
                <span className="text-sm font-exo font-bold text-white">TOTALE CHECK-IN:</span>
                <span className="font-orbitron text-yellow-400 font-bold text-lg ml-3">
                  {playground.totalCheckins}
                </span>
              </div>
              
              <PlaygroundRating playground={playground} />
              
              <div className="flex gap-3 mt-4 w-full">
                {userHasCheckedIn ? (
                  <Button 
                    onClick={handleCheckOut} 
                    className="pixel-button text-sm w-full flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    <span>CHECK-OUT</span>
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCheckIn} 
                    className="pixel-button text-sm w-full"
                  >
                    CHECK-IN
                  </Button>
                )}
                
                {isLoggedIn && userHasCheckedIn && (
                  <Button 
                    onClick={handleEditPlayground} 
                    className="pixel-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-sm flex items-center gap-2"
                  >
                    <Edit size={18} />
                    <span>MODIFICA</span>
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
      </Tabs>
      
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="glass-card text-white border border-orange-500">
          <DialogHeader>
            <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 font-orbitron font-bold">
              CONFERMA CHECK-IN
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <p className="text-sm font-exo font-medium">Sei sicuro di voler fare il check-in in questo playground?</p>
            <div className="flex justify-end gap-3">
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
