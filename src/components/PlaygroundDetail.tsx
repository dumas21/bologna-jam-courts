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
  MessageSquare,
  Edit,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Playground, Comment, WeatherData } from "@/types/playground";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";
import { formatTimeUntilReset } from "@/utils/timeUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PlaygroundRating from "./PlaygroundRating";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface PlaygroundDetailProps {
  playground: Playground;
  onCheckIn: (playgroundId: string, userEmail: string) => boolean;
  onCheckOut: (playgroundId: string, userEmail: string) => boolean;
  hasUserCheckedIn: (playgroundId: string, userEmail: string) => boolean;
  checkInRecords: Array<{playgroundId: string; email: string; nickname: string; timestamp: number;}>;
}

const PlaygroundDetail = ({ playground, onCheckIn, onCheckOut, hasUserCheckedIn, checkInRecords }: PlaygroundDetailProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isLoggedIn, username, nickname } = useUser();
  const [message, setMessage] = useState("");
  const [checkInEmail, setCheckInEmail] = useState("");
  const [comments, setComments] = useState<Comment[]>(() => {
    // Filtra i commenti per mostrare SOLO quelli del playground corrente
    return (playground.comments || []).filter(comment => 
      comment.playgroundId === playground.id
    );
  });
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
  // Dati meteo di esempio per il playground
  const [weatherData, setWeatherData] = useState<WeatherData>({
    condition: "Soleggiato",
    temperature: 24,
    humidity: 60,
    icon: "sun"
  });
  
  const currentDate = format(new Date(), "EEEE d MMMM yyyy", { locale: it });
  const currentTime = format(new Date(), "HH:mm");
  
  // Filter check-in records for this specific playground
  const playgroundCheckins = checkInRecords.filter(record => record.playgroundId === playground.id);
  
  // Check if the current user has checked in
  const userHasCheckedIn = checkInRecords.some(
    record => record.playgroundId === playground.id && username === record.email
  );
  
  const handleCheckIn = () => {
    if (!isLoggedIn) {
      toast({
        title: "Login richiesto",
        description: "Devi effettuare il login per fare check-in",
        variant: "destructive"
      });
      return;
    }
    
    // Mostra il dialog per inserire l'email
    setShowEmailDialog(true);
  };
  
  const processCheckIn = (emailToUse: string) => {
    if (!emailToUse.trim() || !emailToUse.includes('@')) {
      toast({
        title: "Email non valida",
        description: "Inserisci un indirizzo email valido",
        variant: "destructive"
      });
      return;
    }
    
    const success = onCheckIn(playground.id, emailToUse);
    
    if (success) {
      playSoundEffect('checkin');
      toast({
        title: "Check-in completato!",
        description: `Non dimenticare di portare il pallone e tenere pulito! 🏀`,
      });
      setShowEmailDialog(false);
    }
  };
  
  const handleCheckOut = () => {
    if (!isLoggedIn) {
      toast({
        title: "Login richiesto",
        description: "Devi effettuare il login per fare check-out",
        variant: "destructive"
      });
      return;
    }
    
    // Use the username as email for checkout
    const success = username ? onCheckOut(playground.id, username) : false;
    
    if (success) {
      playSoundEffect('checkout');
      toast({
        title: "Check-out completato!",
        description: `Grazie per aver aggiornato le presenze e mantenuto pulito il playground! 👋`,
      });
    }
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
    
    // Create a new comment with the correct structure and ensure it has the playground ID
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      text: message,
      user: nickname || username.split('@')[0], // Usa sempre il nickname, mai l'email
      timestamp: Date.now(),
      playgroundId: playground.id
    };
    
    // Aggiorna il playground con il nuovo messaggio
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    
    // Aggiorna anche i commenti nel playground
    playground.comments = [...playground.comments || [], newComment];
    
    setMessage("");
    
    toast({
      title: "Messaggio inviato",
      description: "Il tuo messaggio è stato pubblicato nella chat",
    });
  };
  
  const handleEditPlayground = () => {
    // Salva l'ID del playground da modificare nel localStorage
    localStorage.setItem("editPlaygroundId", playground.id);
    
    // Vai alla pagina di modifica
    navigate("/add-playground");
    
    playSoundEffect('click');
  };

  const playSoundEffect = (action: string) => {
    const audio = new Audio(`/sounds/${action}.mp3`);
    audio.play().catch(err => console.log('Audio playback error:', err));
  };

  // Calcola quando la chat verrà resettata
  const lastChatReset = localStorage.getItem("lastChatReset");
  const nextChatReset = lastChatReset 
    ? new Date(Number(lastChatReset) + (2 * 24 * 60 * 60 * 1000)) // 48 hours as requested
    : new Date(Date.now() + (2 * 24 * 60 * 60 * 1000));
  const chatResetDate = format(nextChatReset, "dd/MM/yyyy", { locale: it });

  return (
    <div className="pixel-card mt-6 animate-pixel-fade-in bg-black bg-opacity-70 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h3 className="font-press-start text-base md:text-xl text-red-600">
          {playground.name}
        </h3>
        
        <div className="flex items-center space-x-2 text-xs">
          <Calendar size={14} className="text-blue-500" />
          <span className="font-press-start">{currentDate}</span>
          <Clock size={14} className="text-blue-500 ml-2" />
          <span className="font-press-start">{currentTime}</span>
        </div>
      </div>
      
      <Tabs defaultValue="info">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="info" className="text-xs" onClick={() => playSoundEffect('tab')}>Info</TabsTrigger>
          <TabsTrigger value="chat" className="text-xs" onClick={() => playSoundEffect('tab')}>Chat</TabsTrigger>
          <TabsTrigger value="checkins" className="text-xs" onClick={() => playSoundEffect('tab')}>Check-in</TabsTrigger>
          <TabsTrigger value="meteo" className="text-xs" onClick={() => playSoundEffect('tab')}>Meteo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <div className="flex flex-col md:flex-row md:justify-between">
            <div className="mb-4 md:mb-0 md:w-2/3">
              <div className="flex items-start gap-2 mb-2">
                <Home className="flex-shrink-0 text-red-600 mt-1" size={16} />
                <span className="text-sm">{playground.address}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-red-600" size={16} />
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
                    <Sun className="text-yellow-400" size={16} />
                  ) : (
                    <Sun className="text-red-400" size={16} />
                  )}
                  <span className="text-xs">Illuminazione</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <span className="text-xs">Canestri:</span>
                <span className="font-press-start text-yellow-400">
                  {playground.basketCount || 1}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-2 text-xs text-blue-500">
                <TimerReset size={14} />
                <span>Reset conteggio alle 23:59 di oggi</span>
              </div>
            </div>
            
            <div className="flex flex-col md:items-end gap-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">Presenze oggi:</span>
                <div className="flex items-center bg-black p-2 rounded justify-center ml-2">
                  <User className="text-blue-500" size={16} />
                  <span className="font-press-start text-base ml-2">
                    {playground.currentPlayers}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">Totale check-in:</span>
                <span className="font-press-start text-yellow-400 text-sm ml-2">
                  {playground.totalCheckins}
                </span>
              </div>
              
              <PlaygroundRating playground={playground} />
              
              <div className="flex gap-2 mt-2">
                {userHasCheckedIn ? (
                  <Button 
                    onClick={handleCheckOut} 
                    className="pixel-button bg-red-600 hover:bg-red-700 text-xs w-full md:w-auto"
                  >
                    <LogOut size={16} />
                    <span className="sm:inline">CHECK-OUT</span>
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCheckIn} 
                    className="pixel-button text-xs w-full md:w-auto"
                  >
                    CHECK-IN
                  </Button>
                )}
                
                {isLoggedIn && userHasCheckedIn && (
                  <Button 
                    onClick={handleEditPlayground} 
                    className="pixel-button bg-blue-600 hover:bg-blue-700 text-xs w-full md:w-auto"
                  >
                    <Edit size={16} />
                    <span className="sm:inline">MODIFICA</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="chat">
          <div className="bg-white p-2 rounded-md mb-4 h-72 overflow-y-auto">
            <div className="text-xs text-center text-blue-500 mb-2">
              Chat di {playground.name} valida fino al {chatResetDate}
            </div>
          
            {comments && comments.length > 0 ? (
              <div className="space-y-2">
                {comments.map((comment, index) => (
                  <div key={index} className="p-2 rounded mb-2 bg-gray-100 text-black border border-gray-200">
                    <div className="text-sm">{comment.text}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {comment.user} - {new Date(comment.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-red-600 font-press-start text-xs text-center">
                  Nessun messaggio nella chat di {playground.name}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            <Textarea 
              placeholder="Scrivi un messaggio..." 
              className="bg-white text-black border-gray-300 min-h-[70px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!isLoggedIn}
            />
            <Button 
              onClick={handleSendMessage}
              className="pixel-button h-[70px] w-[70px] flex items-center justify-center p-2"
              disabled={!isLoggedIn || !message.trim()}
            >
              <MessageSquare size={30} />
            </Button>
          </div>
          {!isLoggedIn && (
            <p className="text-xs text-red-600 mt-1">Effettua il login per partecipare alla chat</p>
          )}
        </TabsContent>
        
        <TabsContent value="checkins">
          <div className="bg-white p-4 rounded-md mb-4 text-black">
            <h4 className="font-press-start text-xs text-red-600 mb-2">Lista check-in</h4>
            
            {playgroundCheckins.length > 0 ? (
              <div className="space-y-2">
                {playgroundCheckins.map((record, index) => (
                  <div key={index} className="flex items-center gap-2 border-b border-gray-200 py-2">
                    <UserCircle size={16} className="text-blue-500" />
                    <div className="text-sm">{record.nickname}</div>
                    <div className="text-xs text-gray-500 ml-auto">
                      {format(new Date(record.timestamp), "HH:mm")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nessun utente ha fatto check-in</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="meteo">
          <div className="bg-white p-4 rounded-md mb-4 text-black">
            <h4 className="font-press-start text-xs text-red-600 mb-4">Meteo {playground.name}</h4>
            
            <div className="flex items-center gap-6 mb-4">
              <div className="bg-blue-500 p-3 rounded-full">
                {weatherData.icon === "sun" && <Sun className="text-yellow-400" size={32} />}
                {weatherData.icon === "cloud" && <Sun className="text-white" size={32} />}
                {weatherData.icon === "rain" && <Sun className="text-white" size={32} />}
              </div>
              <div>
                <div className="text-2xl font-semibold">{weatherData.temperature}°C</div>
                <div className="text-sm text-gray-600">{weatherData.condition}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-3 rounded-md">
                <div className="text-sm text-gray-500">Umidità</div>
                <div className="text-xl">{weatherData.humidity}%</div>
              </div>
              
              <div className="bg-gray-100 p-3 rounded-md">
                <div className="text-sm text-gray-500">Condizioni</div>
                <div className="text-xl">Ottimali</div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              Aggiornato alle {format(new Date(), "HH:mm")}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="glass-card text-white">
          <DialogHeader>
            <DialogTitle className="text-red-600 font-press-start">Conferma check-in</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-xs">Sei sicuro di voler fare il check-in in questo playground?</p>
            <div className="flex justify-end gap-2">
              <Button 
                className="pixel-button bg-gray-600" 
                onClick={() => setShowEmailDialog(false)}
              >
                Annulla
              </Button>
              <Button 
                className="pixel-button" 
                onClick={() => processCheckIn(username)}
              >
                Conferma
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlaygroundDetail;
