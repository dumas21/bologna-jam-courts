
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  message: string;
  onMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  remainingMessages: number;
  playgroundName: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  message,
  onMessageChange,
  onKeyPress,
  onSendMessage,
  isLoading,
  remainingMessages,
  playgroundName
}) => {
  return (
    <>
      <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-2 mb-4 text-center">
        <p className="text-xs font-bold text-black">
          MESSAGGI RIMASTI PER QUESTO PLAYGROUND: {remainingMessages}/2 (nelle prossime 24h)
        </p>
      </div>
      
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Textarea 
            placeholder={`Scrivi nella chat di ${playgroundName}... (max 500 caratteri)`}
            className="bg-white border-2 border-gray-300 min-h-[80px] text-base resize-none font-bold text-black"
            value={message}
            onChange={onMessageChange}
            onKeyDown={onKeyPress}
            maxLength={500}
            disabled={isLoading}
          />
          <div className="text-xs mt-1 font-bold text-black">
            {message.length}/500 caratteri
          </div>
        </div>
        <Button 
          onClick={onSendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white h-[80px] px-6 flex items-center justify-center rounded-lg font-bold"
          disabled={!message.trim() || message.length > 500 || isLoading || remainingMessages <= 0}
        >
          {isLoading ? "..." : <Send size={20} />}
        </Button>
      </div>
    </>
  );
};

export default MessageInput;
