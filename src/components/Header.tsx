
import { useState } from "react";
import { Bell, User } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="bg-jam-purple border-b-4 border-white sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center py-3 px-4">
        <div className="flex items-center">
          <div className="flex flex-col">
            <h1 className="font-press-start text-sm md:text-lg text-white">
              PLAYGROUND
            </h1>
            <span className="font-press-start text-lg md:text-xl text-jam-orange mt-1">
              JAM BOLOGNA
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="text-white relative">
            <Bell size={24} />
            <span className="absolute -top-1 -right-1 bg-jam-orange text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
              2
            </span>
          </button>
          
          <button className="bg-white p-1 rounded-full">
            <User size={24} className="text-jam-dark" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
