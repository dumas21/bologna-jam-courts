
import { MessageSquare } from "lucide-react";
import { Playground } from "@/types/playgroundTypes";

interface ChatHeaderProps {
  playground: Playground;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ playground }) => {
  return (
    <h3 className="text-lg mb-4 flex items-center font-bold text-black">
      <MessageSquare size={20} className="mr-3 text-blue-600" /> 
      CHAT DI {playground.name.toUpperCase()}
    </h3>
  );
};

export default ChatHeader;
