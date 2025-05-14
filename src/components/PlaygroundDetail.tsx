
import { useState } from "react";
import { 
  User, 
  Clock, 
  Droplet, 
  Home, 
  Umbrella, 
  Sun,
  Bell,
  BellOff,
  LogOut,
  TimerReset
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Playground } from "@/types/playground";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";
import { formatTimeUntilReset } from "@/utils/timeUtils";

interface PlaygroundDetailProps {
  playground: Playground;
  onCheckIn: (playgroundId: string) => void;
  onCheckOut: (playgroundId: string) => void;
}

const PlaygroundDetail = ({ playground, onCheckIn, onCheckOut }: PlaygroundDetailProps) => {
  const { toast } = useToast();
  const { 
    isLoggedIn, 
    subscribeToPlayground, 
    unsubscribeFromPlayground, 
    isSubscribed 
  } = useUser();
  
  const [subscriptionStatus, setSubscriptionStatus] = useState(
    isSubscribed(playground.id)
  );
  
  const handleCheckIn = () => {
    onCheckIn(playground.id);
    toast({
      title: "Check-in completato!",
      description: `Non dimenticare di portare il pallone! 🏀`,
    });
  };
  
  const handleCheckOut = () => {
    onCheckOut(playground.id);
    toast({
      title: "Check-out completato!",
      description: `Grazie per aver aggiornato le presenze! 👋`,
    });
  };
  
  const handleSubscriptionToggle = () => {
    if (!isLoggedIn) {
      toast({
        title: "Login richiesto",
        description: "Devi accedere per ricevere notifiche sui playground",
        variant: "destructive"
      });
      return;
    }
    
    if (subscriptionStatus) {
      unsubscribeFromPlayground(playground.id);
      setSubscriptionStatus(false);
      toast({
        title: "Notifiche disattivate",
        description: `Non riceverai più notifiche per ${playground.name}`
      });
    } else {
      subscribeToPlayground(playground.id);
      setSubscriptionStatus(true);
      toast({
        title: "Notifiche attivate",
        description: `Riceverai notifiche per ${playground.name}`
      });
    }
  };

  return (
    <div className="pixel-card mt-6 animate-pixel-fade-in bg-black bg-opacity-70 backdrop-blur-sm">
      <h3 className="font-press-start text-base md:text-xl text-jam-orange mb-2">
        {playground.name}
      </h3>
      
      <div className="flex flex-col md:flex-row md:justify-between">
        <div className="mb-4 md:mb-0 md:w-2/3">
          <div className="flex items-start gap-2 mb-2">
            <Home className="flex-shrink-0 text-jam-purple mt-1" size={16} />
            <span className="text-sm">{playground.address}</span>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-jam-purple" size={16} />
            <span className="text-sm">{playground.openHours}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 md:gap-4 mt-4">
            <div className="flex items-center gap-1">
              {playground.hasShade ? (
                <Umbrella className="text-green-400" size={16} />
              ) : (
                <Umbrella className="text-red-400" size={16} />
              )}
              <span className="text-xs">Ombra</span>
            </div>
            
            <div className="flex items-center gap-1">
              {playground.hasFountain ? (
                <Droplet className="text-green-400" size={16} />
              ) : (
                <Droplet className="text-red-400" size={16} />
              )}
              <span className="text-xs">Fontanella</span>
            </div>
            
            <div className="flex items-center gap-1">
              {playground.hasAmenities ? (
                <Home className="text-green-400" size={16} />
              ) : (
                <Home className="text-red-400" size={16} />
              )}
              <span className="text-xs">Servizi</span>
            </div>
            
            <div className="flex items-center gap-1">
              {playground.hasLighting ? (
                <Sun className="text-jam-yellow" size={16} />
              ) : (
                <Sun className="text-red-400" size={16} />
              )}
              <span className="text-xs">Illuminazione</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 text-xs text-jam-blue">
            <TimerReset size={14} />
            <span>Reset conteggio tra {formatTimeUntilReset()}</span>
          </div>
        </div>
        
        <div className="flex flex-col md:items-end gap-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs">Presenze oggi:</span>
            <div className="flex items-center bg-jam-dark p-2 rounded justify-center ml-2">
              <User className="text-jam-blue" size={16} />
              <span className="font-press-start text-base ml-2">
                {playground.currentPlayers}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs">Totale check-in:</span>
            <span className="font-press-start text-jam-yellow text-sm ml-2">
              {playground.totalCheckins}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleCheckIn} className="pixel-button text-xs w-full md:w-auto">
              CHECK-IN
            </Button>
            
            <Button 
              onClick={handleCheckOut} 
              className="pixel-button bg-jam-orange hover:bg-red-500 text-xs w-full md:w-auto"
              disabled={playground.currentPlayers === 0}
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">CHECK-OUT</span>
            </Button>
          </div>
          
          <Button 
            onClick={handleSubscriptionToggle}
            className={`flex items-center gap-2 mt-2 ${
              subscriptionStatus 
              ? 'bg-red-500 hover:bg-red-700' 
              : 'bg-green-500 hover:bg-green-700'
            } text-white rounded-md px-3 py-1 text-xs w-full md:w-auto`}
          >
            {subscriptionStatus ? (
              <>
                <BellOff size={14} />
                <span>Disattiva notifiche</span>
              </>
            ) : (
              <>
                <Bell size={14} />
                <span>Attiva notifiche</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundDetail;
