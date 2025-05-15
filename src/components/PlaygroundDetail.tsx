
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
  Edit,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Playground } from "@/types/playground";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";
import { formatTimeUntilReset } from "@/utils/timeUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PlaygroundChart from "./PlaygroundChart";
import PlaygroundRating from "./PlaygroundRating";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface PlaygroundDetailProps {
  playground: Playground;
  onCheckIn: (playgroundId: string, email: string) => boolean;
  onCheckOut: (playgroundId: string, email: string) => boolean;
  hasUserCheckedIn: (playgroundId: string, email: string) => boolean;
}

const PlaygroundDetail = ({ playground, onCheckIn, onCheckOut, hasUserCheckedIn }: PlaygroundDetailProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isLoggedIn, email } = useUser();
  const [message, setMessage] = useState("");
  const [checkInEmail, setCheckInEmail] = useState("");
  const [comments, setComments] = useState<string[]>(playground.comments || []);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
  const currentDate = format(new Date(), "EEEE d MMMM yyyy", { locale: it });
  const currentTime = format(new Date(), "HH:mm");
  
  const userHasCheckedIn = email ? hasUserCheckedIn(playground.id, email) : false;
  
  const handleCheckIn = () => {
    if (!isLoggedIn) {
      toast({
        title: "Login richiesto",
        description: "Devi effettuare il login per fare check-in",
        variant: "destructive"
      });
      return;
    }
    
    // Mostra il dialog per inserire l'email se non è già loggato
    if (!email) {
      setShowEmailDialog(true);
      return;
    }
    
    // Usa l'email dell'utente loggato
    processCheckIn(email);
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
    if (!isLoggedIn || !email) {
      toast({
        title: "Login richiesto",
        description: "Devi effettuare il login per fare check-out",
        variant: "destructive"
      });
      return;
    }
    
    const success = onCheckOut(playground.id, email);
    
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
    setComments([...comments, message]);
    setMessage("");
    
    // Aggiorna il playground con il nuovo messaggio
    playground.comments = [...comments, message];
    
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
    ? new Date(Number(lastChatReset) + (3 * 24 * 60 * 60 * 1000)) 
    : new Date(Date.now() + (3 * 24 * 60 * 60 * 1000));
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
          <TabsTrigger value="stats" className="text-xs" onClick={() => playSoundEffect('tab')}>Statistiche</TabsTrigger>
          <TabsTrigger value="chat" className="text-xs" onClick={() => playSoundEffect('tab')}>Chat</TabsTrigger>
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
                    <span className="hidden sm:inline">CHECK-OUT</span>
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
                    <span className="hidden sm:inline">MODIFICA</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="stats-card">
              <h4 className="font-press-start text-xs text-red-600 mb-2">Presenze Attuali</h4>
              <div className="chart-container h-40">
                <PlaygroundChart type="current" playground={playground} />
              </div>
            </div>
            
            <div className="stats-card">
              <h4 className="font-press-start text-xs text-red-600 mb-2">Orari di Picco</h4>
              <div className="chart-container h-40">
                <PlaygroundChart type="peak" playground={playground} />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="chat">
          <div className="bg-black bg-opacity-70 backdrop-blur-md border border-red-600 rounded-md p-2 h-64 mb-4 overflow-y-auto">
            <div className="text-xs text-center text-blue-500 mb-2">
              Chat valida fino al {chatResetDate} (reset ogni 72 ore)
            </div>
          
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
                <p className="text-red-600 font-press-start text-xs text-center">
                  Nessun messaggio nella chat
                </p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Textarea 
              placeholder="Scrivi un messaggio..." 
              className="bg-black bg-opacity-70 border-red-600 min-h-[60px]"
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
            <p className="text-xs text-red-600 mt-1">Effettua il login per partecipare alla chat</p>
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="glass-card text-white">
          <DialogHeader>
            <DialogTitle className="text-red-600 font-press-start">Inserisci la tua email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-xs">L'email verrà utilizzata per eventi, tornei e aggiornamenti sui playground.</p>
            <Input
              type="email"
              placeholder="Email"
              className="bg-black bg-opacity-70 border-red-600"
              value={checkInEmail}
              onChange={(e) => setCheckInEmail(e.target.value)}
            />
            <div className="flex justify-end">
              <Button className="pixel-button" onClick={() => processCheckIn(checkInEmail)}>
                Conferma
              </Button>
            </div>
            <p className="text-xs text-center text-gray-400">
              Utilizziamo la tua email solo per notificarti di eventi nei playground
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlaygroundDetail;
