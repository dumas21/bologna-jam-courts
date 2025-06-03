
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
        title: "LOGIN RICHIESTO",
        description: "Devi effettuare il login e inserire un nickname per inviare messaggi",
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
  
  return (
    <div className="bg-white p-6 rounded-lg border-4 border-orange-500 shadow-lg">
      <h3 className="nike-text text-lg mb-4 flex items-center text-black">
        <MessageSquare size={20} className="mr-3 text-blue-600" /> 
        CHAT DI {playground.name.toUpperCase()}
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6 h-64 overflow-y-auto shadow-inner border-2 border-gray-200">
        <div className="text-sm text-center text-blue-600 mb-4 nike-text">
          CHAT VALIDA FINO AL {chatResetDate}
        </div>
        
        {comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div key={index} className="p-4 rounded-lg bg-white border-2 border-gray-200 shadow-sm">
                <div className="text-base text-black break-words leading-relaxed nike-text">{comment.text}</div>
                <div className="text-sm text-gray-600 mt-3 flex justify-between items-center">
                  <span className="font-bold text-blue-600 nike-text">{comment.user}</span>
                  <span className="nike-text">{format(new Date(comment.timestamp), 'dd/MM/yyyy HH:mm', { locale: it })}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 nike-text text-sm text-center">
              NESSUN MESSAGGIO NELLA CHAT DI {playground.name.toUpperCase()}
            </p>
          </div>
        )}
      </div>
      
      {!isLoggedIn ? (
        <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 text-center">
          <p className="text-red-700 nike-text text-sm mb-2">
            DEVI EFFETTUARE IL LOGIN PER SCRIVERE IN CHAT
          </p>
          <p className="text-red-600 text-xs nike-text">
            Vai alla pagina di login e inserisci il tuo nickname
          </p>
        </div>
      ) : (
        <div className="flex gap-4 items-end">
          <Textarea 
            placeholder={`Scrivi nella chat di ${playground.name}...`}
            className="bg-white text-black border-2 border-gray-300 min-h-[80px] flex-1 text-base resize-none nike-text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white h-[80px] px-6 flex items-center justify-center rounded-lg nike-text"
            disabled={!message.trim()}
          >
            <Send size={20} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlaygroundChat;
