
import { useState } from "react";
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
  const { isLoggedIn, username, nickname } = useUser();
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState<Comment[]>(() => {
    // Filtra i commenti per mostrare SOLO quelli del playground corrente
    return (playground.comments || []).filter(comment => 
      comment.playgroundId === playground.id
    );
  });

  // Calcola quando la chat verrà resettata
  const lastChatReset = localStorage.getItem("lastChatReset");
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
    
    if (!isLoggedIn) {
      toast({
        title: "Login richiesto",
        description: "Devi effettuare il login per inviare messaggi",
        variant: "destructive"
      });
      return;
    }
    
    playSoundEffect('message');
    
    // Create a new comment with the correct structure and ALWAYS include playground ID
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      text: message,
      user: nickname || username.split('@')[0], // Usa sempre il nickname, mai l'email
      timestamp: Date.now(),
      playgroundId: playground.id // Assicuriamoci che questo sia sempre presente
    };
    
    // Aggiorna i commenti locali
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    
    // Callback per aggiornare i commenti nel playground
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
    <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="font-press-start text-xs mb-2 flex items-center text-jam-purple">
        <MessageSquare size={16} className="mr-2" /> 
        Chat di {playground.name}
      </h3>
      
      <div className="bg-white p-2 rounded-md mb-4 h-72 overflow-y-auto shadow-inner">
        <div className="text-xs text-center text-blue-500 mb-2">
          Chat valida fino al {chatResetDate}
        </div>
        
        {comments && comments.length > 0 ? (
          <div className="space-y-2 px-1">
            {comments.map((comment, index) => (
              <div key={index} className="p-3 rounded mb-2 bg-gray-100 text-black border border-gray-200">
                <div className="text-sm break-words">{comment.text}</div>
                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                  <span className="font-medium">{comment.user}</span>
                  <span>{format(new Date(comment.timestamp), 'HH:mm')}</span>
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
      
      <div className="mt-5">
        <div className="flex gap-2 items-end">
          <Textarea 
            placeholder="Scrivi un messaggio..." 
            className="bg-white text-black border-gray-300 min-h-[80px] flex-1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isLoggedIn}
            onKeyDown={handleKeyPress}
          />
          <Button 
            onClick={handleSendMessage}
            className="pixel-button h-[80px] w-[80px] flex items-center justify-center"
            disabled={!isLoggedIn || !message.trim()}
          >
            <Send size={24} />
          </Button>
        </div>
        
        {!isLoggedIn && (
          <p className="text-xs text-red-600 mt-2">
            Effettua il login per partecipare alla chat
          </p>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          I messaggi sono soggetti alla nostra{' '}
          <button 
            className="text-jam-blue underline" 
            onClick={() => window.dispatchEvent(new CustomEvent('open-privacy-policy'))}
          >
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
};

export default PlaygroundChat;
