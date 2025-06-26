
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlaygroundChatMessage {
  id: string;
  playground_id: string;
  user_id: string | null;
  nickname: string;
  message: string;
  created_at: string;
}

export const usePlaygroundMessages = (playgroundId: string, nickname: string) => {
  const [messages, setMessages] = useState<PlaygroundChatMessage[]>([]);
  const [remainingMessages, setRemainingMessages] = useState(2);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('playground_messages')
        .select('*')
        .eq('playground_id', playgroundId)
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

  const checkRemainingMessages = async () => {
    try {
      const { data, error } = await supabase.rpc('check_message_rate_limit', {
        p_playground_id: playgroundId,
        p_nickname: nickname
      });

      if (error) {
        console.error('Error checking rate limit:', error);
        return;
      }

      if (data === false) {
        setRemainingMessages(0);
      } else {
        const { data: recentMessages } = await supabase
          .from('playground_messages')
          .select('id')
          .eq('playground_id', playgroundId)
          .eq('nickname', nickname)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const recentCount = recentMessages?.length || 0;
        setRemainingMessages(Math.max(0, 2 - recentCount));
      }
    } catch (error) {
      console.error('Error checking remaining messages:', error);
    }
  };

  useEffect(() => {
    loadMessages();
    checkRemainingMessages();
    
    const interval = setInterval(() => {
      loadMessages();
      checkRemainingMessages();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [playgroundId, nickname]);

  return {
    messages,
    remainingMessages,
    loadMessages,
    checkRemainingMessages,
    setMessages,
    setRemainingMessages
  };
};
