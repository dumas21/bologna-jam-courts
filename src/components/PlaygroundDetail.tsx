
import { useState } from "react";
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
  MessageSquare,
  Star,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Playground } from "@/types/playground";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";
import { formatTimeUntilReset } from "@/utils/timeUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import PlaygroundChart from "./PlaygroundChart";
import PlaygroundRating from "./PlaygroundRating";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface PlaygroundDetailProps {
  playground: Playground;
  onCheckIn: (playgroundId: string) => void;
  onCheckOut: (playgroundId: string) => void;
}

const PlaygroundDetail = ({ playground, onCheckIn, onCheckOut }: PlaygroundDetailProps) => {
  const { toast } = useToast();
  const { isLoggedIn } = useUser();
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState<string[]>(playground.comments || []);
  
  const currentDate = format(new Date(), "EEEE d MMMM yyyy", { locale: it });
  const currentTime = format(new Date(), "HH:mm");
  
  const handleCheckIn = () => {
    onCheckIn(playground.id);
    playSoundEffect('checkin');
    toast({
      title: "Check-in completato!",
      description: `Non dimenticare di portare il pallone e tenere pulito! 🏀`,
    });
  };
  
  const handleCheckOut = () => {
    onCheckOut(playground.id);
    playSoundEffect('checkout');
    toast({
      title: "Check-out completato!",
      description: `Grazie per aver aggiornato le presenze e mantenuto pulito il playground! 👋`,
    });
  };
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    if (!isLoggedIn) {
      toast({
        title: "Login richiesto",
        description: "Devi effettuare il login per inviare messaggi",
        variant: "destructive"
      });
      return;
    }
    
    playSoundEffect('message');
    setComments([...comments, message]);
    setMessage("");
    
    toast({
      title: "Messaggio inviato",
      description: "Il tuo messaggio è stato pubblicato nella chat",
    });
  };

  const playSoundEffect = (action: string) => {
    const audio = new Audio(`/sounds/${action}.mp3`);
    audio.play().catch(err => console.log('Audio playback error:', err));
  };

  return (
    <div className="pixel-card mt-6 animate-pixel-fade-in bg-black bg-opacity-50 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h3 className="font-press-start text-base md:text-xl text-jam-orange">
          {playground.name}
        </h3>
        
        <div className="flex items-center space-x-2 text-xs">
          <Calendar size={14} className="text-jam-blue" />
          <span className="font-press-start">{currentDate}</span>
          <Clock size={14} className="text-jam-blue ml-2" />
          <span className="font-press-start">{currentTime}</span>
        </div>
      </div>
      
      <Tabs defaultValue="info">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="info" className="text-xs">Info</TabsTrigger>
          <TabsTrigger value="stats" className="text-xs">Statistiche</TabsTrigger>
          <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
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
              
              <div className="flex items-center gap-2 mt-4">
                <span className="text-xs">Canestri:</span>
                <span className="font-press-start text-jam-yellow">
                  {playground.basketCount || 1}
                </span>
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
              
              <PlaygroundRating playground={playground} />
              
              <div className="flex gap-2 mt-2">
                <Button 
                  onClick={handleCheckIn} 
                  className="pixel-button text-xs w-full md:w-auto"
                >
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
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="stats-card">
              <h4 className="font-press-start text-xs text-jam-orange mb-2">Presenze Attuali</h4>
              <div className="chart-container h-40">
                <PlaygroundChart type="current" playground={playground} />
              </div>
            </div>
            
            <div className="stats-card">
              <h4 className="font-press-start text-xs text-jam-orange mb-2">Orari di Picco</h4>
              <div className="chart-container h-40">
                <PlaygroundChart type="peak" playground={playground} />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="chat">
          <div className="bg-black bg-opacity-50 backdrop-blur-md border border-jam-purple rounded-md p-2 h-64 mb-4 overflow-y-auto">
            {comments && comments.length > 0 ? (
              <div className="space-y-2">
                {comments.map((comment, index) => (
                  <div key={index} className={`chat-message ${index % 2 === 0 ? 'chat-message-other' : 'chat-message-user'}`}>
                    {comment}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-jam-orange font-press-start text-xs text-center">
                  Nessun messaggio nella chat
                </p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Textarea 
              placeholder="Scrivi un messaggio..." 
              className="bg-black bg-opacity-60 border-jam-purple min-h-[60px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!isLoggedIn}
            />
            <Button 
              onClick={handleSendMessage}
              className="pixel-button h-[60px] w-[60px] flex items-center justify-center p-2"
              disabled={!isLoggedIn || !message.trim()}
            >
              <MessageSquare size={24} />
            </Button>
          </div>
          {!isLoggedIn && (
            <p className="text-xs text-jam-orange mt-1">Effettua il login per partecipare alla chat</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlaygroundDetail;
