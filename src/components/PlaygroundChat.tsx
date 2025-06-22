
import { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Playground } from "@/types/playgroundTypes";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";
import { secureChatManager, PlaygroundChatMessage } from "@/utils/chatSecurity";
import { validateContentLength } from "@/utils/security";

interface PlaygroundChatProps {
  playground: Playground;
  onSendMessage?: (message: any) => void;
}

const PlaygroundChat: React.FC<PlaygroundChatProps> = ({ playground, onSendMessage }) => {
  const { toast } = useToast();
  const { isLoggedIn, nickname } = useUser();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<PlaygroundChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load messages for this specific playground
  useEffect(() => {
    const loadMessages = () => {
      const playgroundMessages = secureChatManager.getPlaygroundMessages(playground.id);
      setMessages(playgroundMessages);
      
      // Clean old messages periodically
      secureChatManager.cleanOldMessages(playground.id, 72);
    };
    
    loadMessages();
    
    // Reload messages every 30 seconds to show new messages from other users
    const interval = setInterval(loadMessages, 30000);
    return () => clearInterval(interval);
  }, [playground.id]);

  const playSoundEffect = (action: string) => {
    const audio = new Audio(`/sounds/${action}.mp3`);
    audio.play().catch(err => console.log('Audio playback error:', err));
  };
  
  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage) {
      toast({
        title: "MESSAGGIO VUOTO",
        description: "Inserisci un messaggio prima di inviare",
        variant: "destructive"
      });
      return;
    }
    
    if (!isLoggedIn || !nickname) {
      toast({
        title: "LOGIN RICHIESTO",
        description: "Devi effettuare il login e inserire un nickname per inviare messaggi",
        variant: "destructive"
      });
      return;
    }
    
    // Validate content length
    if (!validateContentLength(trimmedMessage, 500)) {
      toast({
        title: "MESSAGGIO TROPPO LUNGO",
        description: "Il messaggio non può superare i 500 caratteri",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Check if user can send message to this specific playground
    const limitCheck = secureChatManager.canUserSendMessage(nickname, playground.id);
    
    if (!limitCheck.canSend) {
      setIsLoading(false);
      toast({
        title: "LIMITE MESSAGGI RAGGIUNTO",
        description: `Hai raggiunto il limite di 2 messaggi ogni 24h per questo playground. Riprova tra ${limitCheck.timeUntilReset} ore.`,
        variant: "destructive"
      });
      return;
    }
    
    // Add message using secure chat manager
    const success = secureChatManager.addMessage(playground.id, nickname, nickname, trimmedMessage);
    
    if (success) {
      playSoundEffect('message');
      
      // Reload messages to show the new one
      const updatedMessages = secureChatManager.getPlaygroundMessages(playground.id);
      setMessages(updatedMessages);
      
      setMessage("");
      
      const remainingMessages = limitCheck.remainingMessages || 0;
      toast({
        title: "MESSAGGIO INVIATO",
        description: `Messaggio pubblicato! Ti rimangono ${remainingMessages} messaggi per le prossime 24h in questo playground.`,
      });
      
      if (onSendMessage) {
        onSendMessage({ 
          id: `temp_${Date.now()}`,
          text: trimmedMessage,
          user: nickname,
          timestamp: Date.now(),
          playgroundId: playground.id
        });
      }
    } else {
      toast({
        title: "ERRORE",
        description: "Impossibile inviare il messaggio. Riprova.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setMessage(value);
    }
  };

  // Get user's remaining messages for this playground
  const getRemainingMessages = () => {
    if (!isLoggedIn || !nickname) return 0;
    const limitCheck = secureChatManager.canUserSendMessage(nickname, playground.id);
    return limitCheck.remainingMessages || 0;
  };
  
  return (
    <div className="bg-white p-6 rounded-lg border-4 border-orange-500 shadow-lg">
      <h3 className="text-lg mb-4 flex items-center font-bold text-black">
        <MessageSquare size={20} className="mr-3 text-blue-600" /> 
        CHAT DI {playground.name.toUpperCase()}
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6 h-64 overflow-y-auto shadow-inner border-2 border-gray-200">
        <div className="text-sm text-center mb-4 font-bold text-black">
          CHAT INDIPENDENTE PER {playground.name.toUpperCase()} - MESSAGGI ELIMINATI DOPO 72H
        </div>
        
        {messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="p-4 rounded-lg bg-white border-2 border-gray-200 shadow-sm">
                <div className="text-base break-words leading-relaxed font-bold text-black">
                  {msg.message}
                </div>
                <div className="text-sm mt-3 flex justify-between items-center">
                  <span className="font-bold text-blue-600">
                    {msg.nickname}
                  </span>
                  <span className="font-bold text-black">
                    {format(new Date(msg.timestamp), 'dd/MM/yyyy HH:mm', { locale: it })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="font-bold text-sm text-center text-black">
              NESSUN MESSAGGIO NELLA CHAT DI {playground.name.toUpperCase()}
            </p>
          </div>
        )}
      </div>
      
      {!isLoggedIn ? (
        <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 text-center">
          <p className="font-bold text-sm mb-2 text-black">
            DEVI EFFETTUARE IL LOGIN PER SCRIVERE IN CHAT
          </p>
          <p className="text-xs font-bold text-black">
            Vai alla pagina di login e inserisci il tuo nickname
          </p>
        </div>
      ) : (
        <>
          <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-2 mb-4 text-center">
            <p className="text-xs font-bold text-black">
              MESSAGGI RIMASTI PER QUESTO PLAYGROUND: {getRemainingMessages()}/2 (nelle prossime 24h)
            </p>
          </div>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Textarea 
                placeholder={`Scrivi nella chat di ${playground.name}... (max 500 caratteri)`}
                className="bg-white border-2 border-gray-300 min-h-[80px] text-base resize-none font-bold text-black"
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyPress}
                maxLength={500}
                disabled={isLoading}
              />
              <div className="text-xs mt-1 font-bold text-black">
                {message.length}/500 caratteri
              </div>
            </div>
            <Button 
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white h-[80px] px-6 flex items-center justify-center rounded-lg font-bold"
              disabled={!message.trim() || message.length > 500 || isLoading || getRemainingMessages() === 0}
            >
              {isLoading ? "..." : <Send size={20} />}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PlaygroundChat;
