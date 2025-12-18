import { useState } from "react";
import { Playground } from "@/types/playgroundTypes";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateContentLength, sanitizeText } from "@/utils/security";
import { usePlaygroundMessages } from "@/hooks/usePlaygroundMessages";
import { useChatSounds } from "@/hooks/useChatSounds";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import MessageInput from "./chat/MessageInput";

interface PlaygroundChatProps {
  playground: Playground;
  onSendMessage?: (message: any) => void;
}

const PlaygroundChat: React.FC<PlaygroundChatProps> = ({ playground, onSendMessage }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, isLoading: authLoading } = useAuth();
  // Usa il nome utente dal profilo Supabase o fallback al localStorage per compatibilità
  const nickname = profile?.nickname || localStorage.getItem('username') || 'Utente';
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { playSoundEffect } = useChatSounds();
  
  const {
    messages,
    remainingMessages,
    loadMessages,
    checkRemainingMessages,
    setMessages,
    setRemainingMessages
  } = usePlaygroundMessages(playground.id, nickname);

  // Se l'utente non è autenticato, mostra CTA login
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="bg-background/80 p-6 rounded-lg border-4 border-primary shadow-lg text-center">
        <ChatHeader playground={playground} />
        <div className="py-8 space-y-4">
          <p className="text-foreground font-press-start text-xs">
            ACCEDI PER PARTECIPARE ALLA CHAT
          </p>
          <p className="text-muted-foreground text-sm">
            Devi effettuare il login per visualizzare e inviare messaggi.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="arcade-button mt-4"
          >
            ACCEDI ORA
          </button>
        </div>
      </div>
    );
  }

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
      const sanitizedMessage = sanitizeText(trimmedMessage);
      const sanitizedNickname = sanitizeText(nickname);
      
      // L'utente DEVE essere autenticato per inviare messaggi (user.id da auth)
      if (!user?.id) {
        toast({
          title: "ERRORE AUTENTICAZIONE",
          description: "Devi essere autenticato per inviare messaggi.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('playground_messages')
        .insert({
          playground_id: playground.id,
          nickname: sanitizedNickname,
          message: sanitizedMessage,
          user_id: user.id // Usa sempre l'ID utente autenticato
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
      <ChatHeader playground={playground} />
      <ChatMessages messages={messages} playgroundName={playground.name} />
      <MessageInput
        message={message}
        onMessageChange={handleMessageChange}
        onKeyPress={handleKeyPress}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        remainingMessages={remainingMessages}
        playgroundName={playground.name}
      />
    </div>
  );
};

export default PlaygroundChat;
