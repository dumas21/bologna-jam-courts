import { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Comment, Playground } from "@/types/playgroundTypes";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";
import { sanitizeText, validateContentLength, chatRateLimiter } from "@/utils/security";

interface PlaygroundChatProps {
  playground: Playground;
  onSendMessage?: (message: Comment) => void;
}

const PlaygroundChat: React.FC<PlaygroundChatProps> = ({ playground, onSendMessage }) => {
  const { toast } = useToast();
  const { isLoggedIn, nickname } = useUser();
  const [message, setMessage] = useState("");
  
  const [comments, setComments] = useState<Comment[]>(() => {
    const storageKey = `playground_chat_${playground.id}`;
    const storedComments = localStorage.getItem(storageKey);
    if (storedComments) {
      try {
        const parsed = JSON.parse(storedComments);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    const storageKey = `playground_chat_${playground.id}`;
    localStorage.setItem(storageKey, JSON.stringify(comments));
  }, [comments, playground.id]);

  const lastChatReset = localStorage.getItem(`lastChatReset_${playground.id}`);
  const nextChatReset = lastChatReset 
    ? new Date(Number(lastChatReset) + (2 * 24 * 60 * 60 * 1000))
    : new Date(Date.now() + (2 * 24 * 60 * 60 * 1000));
  const chatResetDate = format(nextChatReset, "dd/MM/yyyy", { locale: it });
  
  const playSoundEffect = (action: string) => {
    const audio = new Audio(`/sounds/${action}.mp3`);
    audio.play().catch(err => console.log('Audio playback error:', err));
  };
  
  const handleSendMessage = () => {
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
    
    // Check rate limiting
    if (!chatRateLimiter.isAllowed(nickname)) {
      const remainingTime = Math.ceil(chatRateLimiter.getRemainingTime(nickname) / 1000);
      toast({
        title: "TROPPI MESSAGGI",
        description: `Aspetta ${remainingTime} secondi prima di inviare un altro messaggio`,
        variant: "destructive"
      });
      return;
    }
    
    // Sanitize the message content
    const sanitizedMessage = sanitizeText(trimmedMessage);
    
    if (!sanitizedMessage || sanitizedMessage.length === 0) {
      toast({
        title: "CONTENUTO NON VALIDO",
        description: "Il messaggio contiene contenuto non permesso",
        variant: "destructive"
      });
      return;
    }
    
    playSoundEffect('message');
    
    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: sanitizedMessage,
      user: nickname,
      timestamp: Date.now(),
      playgroundId: playground.id
    };
    
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    
    if (onSendMessage) {
      onSendMessage(newComment);
    }
    
    setMessage("");
    
    toast({
      title: "MESSAGGIO INVIATO",
      description: "Il tuo messaggio è stato pubblicato nella chat",
    });
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Limit input length in real-time
    if (value.length <= 500) {
      setMessage(value);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg border-4 border-orange-500 shadow-lg">
      <h3 className="text-lg mb-4 flex items-center font-bold" style={{fontFamily: 'JetBrains Mono, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '3px', color: '#000000'}}>
        <MessageSquare size={20} className="mr-3 text-blue-600" /> 
        CHAT DI {playground.name.toUpperCase()}
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6 h-64 overflow-y-auto shadow-inner border-2 border-gray-200">
        <div className="text-sm text-center mb-4 font-bold" style={{fontFamily: 'JetBrains Mono, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '2px', color: '#000000'}}>
          CHAT VALIDA FINO AL {chatResetDate}
        </div>
        
        {comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div key={comment.id || index} className="p-4 rounded-lg bg-white border-2 border-gray-200 shadow-sm">
                <div className="text-base break-words leading-relaxed font-bold" style={{fontFamily: 'JetBrains Mono, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px', color: '#000000'}}>
                  {sanitizeText(comment.text)}
                </div>
                <div className="text-sm mt-3 flex justify-between items-center">
                  <span className="font-bold text-blue-600" style={{fontFamily: 'JetBrains Mono, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '10px', color: '#000000'}}>
                    {sanitizeText(comment.user)}
                  </span>
                  <span className="font-bold" style={{fontFamily: 'JetBrains Mono, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '10px', color: '#000000'}}>{format(new Date(comment.timestamp), 'dd/MM/yyyy HH:mm', { locale: it })}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="font-bold text-sm text-center" style={{fontFamily: 'JetBrains Mono, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '2px', color: '#000000'}}>
              NESSUN MESSAGGIO NELLA CHAT DI {sanitizeText(playground.name.toUpperCase())}
            </p>
          </div>
        )}
      </div>
      
      {!isLoggedIn ? (
        <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 text-center">
          <p className="font-bold text-sm mb-2" style={{fontFamily: 'JetBrains Mono, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '2px', color: '#000000'}}>
            DEVI EFFETTUARE IL LOGIN PER SCRIVERE IN CHAT
          </p>
          <p className="text-xs font-bold" style={{fontFamily: 'JetBrains Mono, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '1px', color: '#000000'}}>
            Vai alla pagina di login e inserisci il tuo nickname
          </p>
        </div>
      ) : (
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Textarea 
              placeholder={`Scrivi nella chat di ${playground.name}... (max 500 caratteri)`}
              className="bg-white border-2 border-gray-300 min-h-[80px] text-base resize-none font-bold"
              style={{fontFamily: 'JetBrains Mono, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px', color: '#000000'}}
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyPress}
              maxLength={500}
            />
            <div className="text-xs mt-1 font-bold" style={{fontFamily: 'JetBrains Mono, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '1px', color: '#000000'}}>
              {message.length}/500 caratteri
            </div>
          </div>
          <Button 
            onClick={handleSendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white h-[80px] px-6 flex items-center justify-center rounded-lg font-bold"
            style={{fontFamily: 'JetBrains Mono, Press Start 2P, monospace', textTransform: 'uppercase', letterSpacing: '1px'}}
            disabled={!message.trim() || message.length > 500}
          >
            <Send size={20} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlaygroundChat;
