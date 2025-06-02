
import { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Comment, Playground } from "@/types/playgroundTypes";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";

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
    if (!message.trim()) return;
    
    if (!isLoggedIn || !nickname) {
      toast({
        title: "Login richiesto",
        description: "Devi effettuare il login per inviare messaggi",
        variant: "destructive"
      });
      return;
    }
    
    playSoundEffect('message');
    
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      text: message,
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
      title: "Messaggio inviato",
      description: "Il tuo messaggio è stato pubblicato nella chat",
    });
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="font-press-start text-xs mb-3 flex items-center text-black">
        <MessageSquare size={16} className="mr-2 text-blue-600" /> 
        Chat di {playground.name}
      </h3>
      
      <div className="bg-gray-50 p-3 rounded-md mb-4 h-60 overflow-y-auto shadow-inner border">
        <div className="text-xs text-center text-blue-600 mb-3 font-semibold">
          Chat valida fino al {chatResetDate}
        </div>
        
        {comments && comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment, index) => (
              <div key={index} className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
                <div className="text-sm text-black break-words leading-relaxed">{comment.text}</div>
                <div className="text-xs text-gray-600 mt-2 flex justify-between items-center">
                  <span className="font-medium text-blue-600">{comment.user}</span>
                  <span>{format(new Date(comment.timestamp), 'dd/MM/yyyy HH:mm', { locale: it })}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 font-press-start text-xs text-center">
              Nessun messaggio nella chat di {playground.name}
            </p>
          </div>
        )}
      </div>
      
      <div className="flex gap-3 items-end">
        <Textarea 
          placeholder={`Scrivi nella chat di ${playground.name}...`}
          className="bg-white text-black border-gray-300 min-h-[60px] flex-1 text-sm resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!isLoggedIn}
          onKeyDown={handleKeyPress}
        />
        <Button 
          onClick={handleSendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white h-[60px] px-4 flex items-center justify-center rounded-lg"
          disabled={!isLoggedIn || !message.trim()}
        >
          <Send size={18} />
        </Button>
      </div>
      
      {!isLoggedIn && (
        <p className="text-xs text-red-600 mt-2 text-center">
          Effettua il login per partecipare alla chat
        </p>
      )}
    </div>
  );
};

export default PlaygroundChat;
