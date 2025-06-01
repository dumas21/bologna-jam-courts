
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
  
  // Store comments specifically for THIS playground only in localStorage
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

  // Save comments to localStorage whenever they change
  useEffect(() => {
    const storageKey = `playground_chat_${playground.id}`;
    localStorage.setItem(storageKey, JSON.stringify(comments));
  }, [comments, playground.id]);

  // Calculate when the chat will be reset (every 48 hours)
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
    
    // Create a new comment with ONLY nickname (never email)
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      text: message,
      user: nickname, // Always use nickname, never email
      timestamp: Date.now(),
      playgroundId: playground.id
    };
    
    // Update local comments for THIS specific playground
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    
    // Callback for parent component
    if (onSendMessage) {
      onSendMessage(newComment);
    }
    
    setMessage("");
    
    toast({
      title: "Messaggio inviato",
      description: "Il tuo messaggio è stato pubblicato nella chat",
    });
  };
  
  // Handle keypresses in the textarea
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 shadow-sm mb-20">
      <h3 className="font-press-start text-xs mb-3 flex items-center text-jam-purple">
        <MessageSquare size={16} className="mr-2" /> 
        Chat di {playground.name}
      </h3>
      
      <div className="bg-white p-3 rounded-md mb-6 h-80 overflow-y-auto shadow-inner">
        <div className="text-xs text-center text-blue-500 mb-3 font-semibold">
          Chat valida fino al {chatResetDate}
        </div>
        
        {comments && comments.length > 0 ? (
          <div className="space-y-3 px-1">
            {comments.map((comment, index) => (
              <div key={index} className="p-3 rounded-lg mb-2 bg-gray-50 text-black border border-gray-200 shadow-sm">
                <div className="text-sm break-words leading-relaxed">{comment.text}</div>
                <div className="text-xs text-gray-500 mt-2 flex justify-between items-center">
                  <span className="font-medium text-jam-blue">{comment.user}</span>
                  <span>{format(new Date(comment.timestamp), 'HH:mm')}</span>
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
      
      {/* Fixed chat input at bottom with better spacing */}
      <div className="fixed bottom-6 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-40">
        <div className="flex gap-3 items-end max-w-6xl mx-auto">
          <Textarea 
            placeholder={`Scrivi nella chat di ${playground.name}...`}
            className="bg-white text-black border-gray-300 min-h-[60px] flex-1 text-base resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isLoggedIn}
            onKeyDown={handleKeyPress}
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-jam-purple hover:bg-jam-purple/90 text-white h-[60px] w-[60px] flex items-center justify-center rounded-lg shadow-md"
            disabled={!isLoggedIn || !message.trim()}
          >
            <Send size={20} />
          </Button>
        </div>
        
        {!isLoggedIn && (
          <p className="text-xs text-red-600 mt-2 text-center">
            Effettua il login per partecipare alla chat
          </p>
        )}
      </div>
    </div>
  );
};

export default PlaygroundChat;
