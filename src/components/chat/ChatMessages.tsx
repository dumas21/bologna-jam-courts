
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface PlaygroundChatMessage {
  id: string;
  playground_id: string;
  user_id: string | null;
  nickname: string;
  message: string;
  created_at: string;
}

interface ChatMessagesProps {
  messages: PlaygroundChatMessage[];
  playgroundName: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, playgroundName }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md mb-6 h-64 overflow-y-auto shadow-inner border-2 border-gray-200">
      <div className="text-sm text-center mb-4 font-bold text-black">
        CHAT SICURA PER {playgroundName.toUpperCase()} - MESSAGGI ELIMINATI DOPO 72H
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
            NESSUN MESSAGGIO NELLA CHAT DI {playgroundName.toUpperCase()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
