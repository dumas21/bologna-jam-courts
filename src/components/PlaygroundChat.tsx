
import { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Playground } from "@/types/playgroundTypes";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateContentLength, sanitizeText } from "@/utils/security";

interface PlaygroundChatMessage {
  id: string;
  playground_id: string;
  user_id: string | null;
  nickname: string;
  message: string;
  created_at: string;
}

interface PlaygroundChatProps {
  playground: Playground;
  onSendMessage?: (message: any) => void;
}

const PlaygroundChat: React.FC<PlaygroundChatProps> = ({ playground, onSendMessage }) => {
  const { toast } = useToast();
  const nickname = 'Anonymous';
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<PlaygroundChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(2);

  // Load messages for this specific playground from database
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('playground_messages')
          .select('*')
          .eq('playground_id', playground.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
          return;
        }

        setMessages(data || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    
    loadMessages();
    
    // Check remaining messages for this user
    checkRemainingMessages();
    
    // Reload messages every 30 seconds to show new messages from other users
    const interval = setInterval(() => {
      loadMessages();
      checkRemainingMessages();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [playground.id]);

  const checkRemainingMessages = async () => {
    try {
      const { data, error } = await supabase.rpc('check_message_rate_limit', {
        p_playground_id: playground.id,
        p_nickname: nickname
      });

      if (error) {
        console.error('Error checking rate limit:', error);
        return;
      }

      // If rate limit check returns false, user has reached limit
      if (data === false) {
        setRemainingMessages(0);
      } else {
        // Count recent messages to show remaining
        const { data: recentMessages } = await supabase
          .from('playground_messages')
          .select('id')
          .eq('playground_id', playground.id)
          .eq('nickname', nickname)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const recentCount = recentMessages?.length || 0;
        setRemainingMessages(Math.max(0, 2 - recentCount));
      }
    } catch (error) {
      console.error('Error checking remaining messages:', error);
    }
  };

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
    
    // Validate content length
    if (!validateContentLength(trimmedMessage, 500)) {
      toast({
        title: "MESSAGGIO TROPPO LUNGO",
        description: "Il messaggio non può superare i 500 caratteri",
        variant: "destructive"
      });
      return;
    }
    
    if (remainingMessages <= 0) {
      toast({
        title: "LIMITE MESSAGGI RAGGIUNTO",
        description: "Hai raggiunto il limite di 2 messaggi ogni 24h per questo playground.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Sanitize inputs before sending to database
      const sanitizedMessage = sanitizeText(trimmedMessage);
      const sanitizedNickname = sanitizeText(nickname);
      
      const { error } = await supabase
        .from('playground_messages')
        .insert({
          playground_id: playground.id,
          nickname: sanitizedNickname,
          message: sanitizedMessage,
          user_id: null // Anonymous user
        });

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "ERRORE",
          description: "Impossibile inviare il messaggio. Riprova.",
          variant: "destructive"
        });
        return;
      }

      playSoundEffect('message');
      
      // Reload messages and check remaining count
      const { data } = await supabase
        .from('playground_messages')
        .select('*')
        .eq('playground_id', playground.id)
        .order('created_at', { ascending: true });

      setMessages(data || []);
      await checkRemainingMessages();
      
      setMessage("");
      
      toast({
        title: "MESSAGGIO INVIATO",
        description: `Messaggio pubblicato! Ti rimangono ${remainingMessages - 1} messaggi per le prossime 24h in questo playground.`,
      });
      
      if (onSendMessage) {
        onSendMessage({ 
          id: `temp_${Date.now()}`,
          text: sanitizedMessage,
          user: sanitizedNickname,
          timestamp: Date.now(),
          playgroundId: playground.id
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "ERRORE",
        description: "Impossibile inviare il messaggio. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
  
  return (
    <div className="bg-white p-6 rounded-lg border-4 border-orange-500 shadow-lg">
      <h3 className="text-lg mb-4 flex items-center font-bold text-black">
        <MessageSquare size={20} className="mr-3 text-blue-600" /> 
        CHAT DI {playground.name.toUpperCase()}
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6 h-64 overflow-y-auto shadow-inner border-2 border-gray-200">
        <div className="text-sm text-center mb-4 font-bold text-black">
          CHAT SICURA PER {playground.name.toUpperCase()} - MESSAGGI ELIMINATI DOPO 72H
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
                    {format(new Date(msg.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}
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
      
      <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-2 mb-4 text-center">
        <p className="text-xs font-bold text-black">
          MESSAGGI RIMASTI PER QUESTO PLAYGROUND: {remainingMessages}/2 (nelle prossime 24h)
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
          disabled={!message.trim() || message.length > 500 || isLoading || remainingMessages <= 0}
        >
          {isLoading ? "..." : <Send size={20} />}
        </Button>
      </div>
    </div>
  );
};

export default PlaygroundChat;
